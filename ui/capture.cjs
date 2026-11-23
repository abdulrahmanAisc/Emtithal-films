#!/usr/bin/env node
// Captures keyframes of the real Emtithal knowledge base and code reader from a running `next dev`.
//
//   node capture.cjs [baseUrl=http://localhost:3100]
//
// The dev server needs frontend/web/.env.local with AUTH_SECRET=<anything>, AUTH_TRUST_HOST=true,
// ALLOW_ALL_PAGES=true (the proxy's dev-only pass-through). There is no backend: every /api/backend/**
// call is answered here from fixtures/*.json (built by build-fixtures.cjs from facts in the repo).
// Every keyframe is a state reached by real mouse and keyboard input in the page. The only things
// touched in the page are: the Next.js dev-tools badge is hidden, and two mocked responses are held
// back (the clause after a search, the ask answer) so their loading states can be captured.
//
// Output: shots/kNN.png (2880x1800) and shots/manifest.json (targets in CSS px of the 1440x900 viewport).

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:3100").replace(/\/$/, "");
const DIR = __dirname;
const SHOTS = path.join(DIR, "shots");
const fx = (name) => JSON.parse(fs.readFileSync(path.join(DIR, "fixtures", name), "utf8"));
const F = {
  books: fx("books.json"),
  overview: fx("overview.json"),
  contents: fx("contents.json"),
  chapter: fx("chapter-10.json"),
  clauses: fx("clauses.json"),
  changes: fx("changes.json"),
  usedIn: fx("used-in.json"),
  search: fx("search-1011.2.json"),
  ask: fx("ask.json"),
};
const BOOK = "SBC201-2024";
const QUERY = "1011.2";
const PHRASE = "not less than 1100 mm"; // part of the 1011.2 quote, selected with the mouse

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: "ar-SA",
    timezoneId: "Asia/Riyadh",
    colorScheme: "light",
  });
  const page = await context.newPage();

  const problems = [];
  const calls = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 300)}`));
  page.on("response", (r) => {
    const u = r.url().replace(BASE, "");
    if (r.status() >= 400) problems.push(`http ${r.status()} ${r.request().method()} ${u.slice(0, 200)}`);
  });

  // gates: a held response waits until release() is called
  const gate = () => {
    let release;
    const p = new Promise((r) => (release = r));
    return { wait: p, release };
  };
  const hold = { clause: null, ask: null };

  await page.route("**/api/backend/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname.replace(/^\/api\/backend\//, "");
    const n = url.searchParams.get("n");
    calls.push(`${req.method()} ${p}${url.search}`);
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    const none = () => json({ detail: "Not Found" }, 404);
    if (req.method() === "POST" && p === "ask") {
      calls.push(`  ask body: ${req.postData()}`);
      const body = JSON.parse(req.postData() || "{}");
      if (hold.ask) await hold.ask.wait;
      // the fixture answers for 1011.2 only
      return body.book === BOOK && body.number === "1011.2" ? json(F.ask) : none();
    }
    if (p === "me/notifications") return json({ items: [], unread: 0 }); // the header bell: nothing to show
    if (p === "codebooks") return json(F.books);
    if (p === "codebooks/search") {
      return json(url.searchParams.get("q") === QUERY ? F.search : []);
    }
    if (!p.startsWith(`codebooks/${BOOK}/`)) return none(); // only SBC 201 has content here
    const rest = p.slice(`codebooks/${BOOK}/`.length);
    if (rest === "overview") return json(F.overview);
    if (rest === "contents") return json(F.contents);
    if (rest === "changes") return json(F.changes);
    if (rest === "used-in") return json(F.usedIn);
    if (rest === "chapter") return n === F.chapter.number ? json(F.chapter) : none();
    if (rest === "clause") {
      if (hold.clause) await hold.clause.wait;
      return F.clauses[n] ? json(F.clauses[n]) : none();
    }
    return none(); // pages/<n>, figure: no images exist
  });

  // ---- helpers
  const manifest = [];
  const rect = async (loc) => {
    const b = await loc.first().boundingBox();
    if (!b) return null;
    const r = (v) => Math.round(v * 10) / 10;
    return { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) };
  };
  const settle = async () => {
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    await sleep(450);
  };
  const shot = async (note, targets, { idle = true } = {}) => {
    if (idle) await settle();
    else await sleep(450);
    // the Next.js dev-tools badge is not product UI
    const overlay = await page.evaluate(() => {
      const root = document.querySelector("nextjs-portal")?.shadowRoot;
      const d = root?.querySelector('[data-nextjs-dialog-overlay][data-rendered="true"], dialog[open]');
      const issues = root?.querySelector("[data-issues-count]")?.textContent ?? "";
      return d ? `dialog ${d.outerHTML.slice(0, 160)}` : /[1-9]/.test(issues) ? `issues badge: ${issues}` : "";
    });
    if (overlay) problems.push(`next dev overlay at keyframe ${manifest.length + 1}: ${overlay}`);
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => undefined);
    const id = `k${String(manifest.length + 1).padStart(2, "0")}`;
    const out = {};
    for (const [name, loc] of Object.entries(targets)) {
      const r = typeof loc.x === "number" ? loc : await rect(loc);
      if (r) out[name] = r;
      else problems.push(`${id}: target ${name} not found`);
    }
    await page.screenshot({ path: path.join(SHOTS, `${id}.png`), fullPage: false, animations: "disabled", caret: "initial" });
    manifest.push({ id, file: `${id}.png`, note, targets: out });
    console.log(id, note);
  };
  const clickAt = async (loc) => {
    const b = await loc.first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
    await page.mouse.down();
    await page.mouse.up();
  };

  // ---- locators shared by several keyframes
  const sidebar = page.locator('[data-sidebar="sidebar"]:visible').first();
  const main = page.locator("main").first();

  // ============================================================ 1. the knowledge base list
  await page.goto(`${BASE}/knowledge-base`, { waitUntil: "domcontentloaded" });
  const cards = page.locator("ul.grid > li");
  await cards.first().waitFor();
  // the cookie banner (first visit): answered with a real click on "necessary only", so no analytics load
  const necessary = page.getByRole("button", { name: "الضرورية فقط" });
  await necessary.waitFor({ timeout: 15000 });
  await settle();
  await clickAt(necessary);
  await necessary.waitFor({ state: "detached" });
  await page.mouse.move(720, 20);
  const listSearch = page.getByPlaceholder("ابحث عن كتاب");
  const card201 = cards.filter({ has: page.locator('a[href="/knowledge-base/SBC201-2024"]') });
  const shell = async () => ({
    ...((await sidebar.count()) ? { sidebar } : {}),
    ...((await page.locator("header").count()) ? { header: page.locator("header").first() } : {}),
  });
  await shot("Knowledge base: the book list loaded (24 SBC codes from code_packs.py)", {
    ...(await shell()),
    pageTitle: page.getByRole("heading", { level: 1 }),
    searchInput: listSearch,
    bookGrid: page.locator("ul.grid"),
    bookCard: card201,
  });

  // ============================================================ 2. filter the list by typing SBC 201
  await clickAt(listSearch);
  await page.keyboard.type("SBC 201", { delay: 90 }); // "201" alone also matches SBC 1201
  await page.waitForFunction(() => document.querySelectorAll("ul.grid > li").length === 1);
  await shot("List search focused with 'SBC 201' typed: only the SBC 201 card is left", {
    searchInput: listSearch,
    bookCard: card201,
    bookTitle: card201.locator("button").first(),
    enabledSwitch: card201.getByRole("switch"),
    previewButton: card201.getByRole("button", { name: "معاينة سريعة" }),
    openButton: card201.locator('a[href="/knowledge-base/SBC201-2024"]'),
  });

  // ============================================================ 3. quick preview
  await clickAt(card201.getByRole("button", { name: "معاينة سريعة" }));
  const dialog = page.getByRole("dialog");
  await dialog.locator("[data-clause]").first().waitFor();
  await shot("Quick preview of SBC 201: book details, the reader on chapter 10 and the ask panel", {
    previewDialog: dialog,
    detailsRail: dialog.locator("aside").first(),
    readerText: dialog.locator("article"),
    askPanel: dialog.locator("aside").last(),
    openButton: dialog.locator('a[href="/knowledge-base/SBC201-2024"]'),
    closeButton: dialog.getByRole("button", { name: "إغلاق" }).first(),
  });

  // ============================================================ 4. open the book
  await Promise.all([page.waitForURL(`**/knowledge-base/${BOOK}`), clickAt(dialog.locator('a[href="/knowledge-base/SBC201-2024"]'))]);
  const article = page.locator("article");
  await article.locator("[data-clause]").first().waitFor();
  await page.mouse.move(720, 20);
  const readerSearch = page.locator("#cv-dq");
  const searchForm = page.locator("form").filter({ has: readerSearch });
  const askButton = page.getByRole("button", { name: "اسأل الكتاب" });
  const toc = page.getByRole("navigation", { name: "المحتويات" });
  const sec = (n) => page.locator(`article [data-clause="${n}"]`);
  await shot("SBC 201 opened: the app shows the reader first (tab 'عرض الكتاب'), contents and chapter 10", {
    ...(await shell()),
    bookHeader: page.getByRole("heading", { level: 1 }),
    tabs: page.getByRole("tablist"),
    langSwitch: page.getByRole("radiogroup"),
    contents: toc,
    searchInput: readerSearch,
    searchBox: searchForm,
    readerText: article,
    contentsToggle: page.getByRole("button", { name: "إظهار/إخفاء المحتويات" }),
    sidebarToggle: page.locator('[data-sidebar="trigger"]:visible').first(),
    askButton,
  });

  // ============================================================ 5. make room: hide the contents, collapse the app sidebar
  const contentsToggle = page.getByRole("button", { name: "إظهار/إخفاء المحتويات" });
  const sidebarToggle = page.locator('[data-sidebar="trigger"]:visible').first();
  await clickAt(contentsToggle);
  await toc.waitFor({ state: "detached" });
  await clickAt(sidebarToggle);
  await sleep(600);
  await page.mouse.move(720, 20);
  await shot("Reading room: contents hidden and the app sidebar collapsed with their own buttons", {
    contentsToggle,
    sidebarToggle: page.locator('[data-sidebar="trigger"]:visible').first(),
    searchInput: readerSearch,
    searchBox: searchForm,
    readerText: article,
    clauseInReader: sec("1011.2"),
    askButton,
  });

  // ============================================================ 6. type the clause number in the reader search
  await clickAt(readerSearch);
  await page.keyboard.type(QUERY, { delay: 90 });
  await shot(`Reader search focused with '${QUERY}' typed (results come on Enter)`, {
    searchInput: readerSearch,
    searchBox: searchForm,
    readerText: article,
  });

  // ============================================================ 6. Enter: the results row (the clause is held back)
  hold.clause = gate();
  await page.keyboard.press("Enter");
  const hits = page.locator("ol").filter({ has: page.getByText("رقم البند") });
  const firstHit = hits.locator("button").first();
  await firstHit.waitFor();
  await shot(
    "Search results row under the search field: one hit, 1011.2, found by clause number; counter 1/1",
    { searchInput: readerSearch, searchBox: searchForm, resultsRow: hits, firstHit, hitCounter: searchForm.getByText("1/1") },
    { idle: false },
  );

  // ============================================================ 7. the clause opens
  hold.clause.release();
  hold.clause = null;
  const panel = page.getByRole("complementary", { name: "ملخص البند" });
  await panel.getByText("الاستثناءات").waitFor();
  await page.mouse.move(720, 20);
  const textSpan = sec("1011.2").locator("span.whitespace-pre-line");
  await shot("Clause 1011.2 open: highlighted in the reader with its exception below it, and the clause summary panel with the exception", {
    firstHit,
    clauseInReader: sec("1011.2"),
    clauseText: textSpan,
    exceptionInReader: sec("1011.2 Exception 1"),
    clausePanel: panel,
    panelClauseText: panel.locator("p.leading-8").first(),
    panelExceptions: panel.locator("section").filter({ hasText: "الاستثناءات" }).first(),
    copyButton: panel.getByRole("button", { name: "نسخ" }),
    askButton,
  });

  // ============================================================ 8. select a phrase with the mouse
  const sel = await textSpan.evaluate((el, phrase) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const i = node.data.indexOf(phrase);
      if (i < 0) continue;
      const r = document.createRange();
      r.setStart(node, i);
      r.setEnd(node, i + phrase.length);
      const rects = [...r.getClientRects()].map((b) => ({ x: b.x, y: b.y, w: b.width, h: b.height }));
      const b = r.getBoundingClientRect();
      return { rects, box: { x: b.x, y: b.y, w: b.width, h: b.height } };
    }
    return null;
  }, PHRASE);
  if (!sel) throw new Error("phrase not found in clause text");
  const a = sel.rects[0];
  const z = sel.rects[sel.rects.length - 1];
  const from = { x: a.x + 0.5, y: a.y + a.h / 2 }; // English text runs left to right inside the RTL page
  const to = { x: z.x + z.w - 0.5, y: z.y + z.h / 2 };
  await page.mouse.move(from.x, from.y, { steps: 6 });
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 14 });
  await page.mouse.up();
  const menu = page.getByRole("menu");
  await menu.waitFor();
  const picked = await page.evaluate(() => window.getSelection().toString());
  if (picked.trim() !== PHRASE) problems.push(`selection is "${picked}", wanted "${PHRASE}"`);
  const sb = await article.locator("xpath=..").boundingBox(); // the reader's scrolling area; its padding is empty
  const margin = { x: sb.x + sb.width - 8, y: sb.y + sb.height - 8, w: 0, h: 0 };
  await shot(`The phrase "${PHRASE}" selected with the mouse in clause 1011.2: the ask menu opens under it`, {
    selection: sel.box,
    dragFrom: { x: from.x, y: from.y, w: 0, h: 0 },
    dragTo: { x: to.x, y: to.y, w: 0, h: 0 },
    clauseInReader: sec("1011.2"),
    selectionMenu: menu,
    menuAsk: menu.getByRole("menuitem", { name: "اسأل الوكيل" }),
    menuExplain: menu.getByRole("menuitem", { name: "اشرح ببساطة" }),
    menuRelated: menu.getByRole("menuitem", { name: "بنود مرتبطة" }),
    menuChecked: menu.getByRole("menuitem", { name: "كيف يُفحص على المخطط؟" }),
    menuProject: menu.getByRole("menuitem", { name: "هل ينطبق على مشروعي؟" }),
    menuClose: menu.getByRole("button", { name: "إغلاق" }),
    readerMargin: margin,
    askButton,
  });

  // ============================================================ 9. drop the selection, open "اسأل الكتاب"
  // A click on the grey margin of the reader drops the selection, which closes the menu. (The menu's own X is
  // not enough: while the words stay selected, the next mouse-up anywhere opens the menu again.)
  await page.mouse.move(margin.x, margin.y, { steps: 8 });
  await page.mouse.down();
  await page.mouse.up();
  await menu.waitFor({ state: "detached" });
  await clickAt(askButton);
  const ask = page.getByRole("complementary", { name: "اسأل الكتاب" });
  await ask.waitFor();
  const chip = (text) => ask.getByRole("button", { name: text });
  await page.mouse.move(720, 20);
  await shot("The 'اسأل الكتاب' panel open beside the clause summary, with its three suggested questions", {
    askPanel: ask,
    askTitle: ask.locator("header"),
    chip1: chip("ما أقصى مسافة سير إلى المخرج؟"),
    chip2: chip("كم مخرجًا يلزم للطابق؟"),
    questionChip: chip("ما الحد الأدنى لعرض الدرج؟"),
    askInput: ask.locator("#cv-ask"),
    sendButton: ask.getByRole("button", { name: "إرسال" }),
    clausePanel: panel,
    clauseInReader: sec("1011.2"),
  });

  // ============================================================ 10. ask: the searching state
  hold.ask = gate();
  await clickAt(chip("ما الحد الأدنى لعرض الدرج؟"));
  const thinking = ask.getByText("جارٍ البحث في الكتاب…");
  await thinking.waitFor();
  await page.mouse.move(720, 20);
  await shot(
    "Question sent (the third suggestion): the question bubble and 'جارٍ البحث في الكتاب…'",
    { askPanel: ask, questionBubble: ask.locator("p.bg-gray-800"), searching: thinking, askInput: ask.locator("#cv-ask") },
    { idle: false },
  );

  // ============================================================ 11. the answer
  hold.ask.release();
  hold.ask = null;
  const answer = ask.locator("div.bg-brand-50").filter({ hasText: "المصادر" });
  await answer.waitFor();
  const cite = answer.locator("li button");
  await shot("The answer with its source: clause 1011.2 and the quoted words", {
    askPanel: ask,
    questionBubble: ask.locator("p.bg-gray-800"),
    answerCard: answer,
    answerText: answer.locator("p.whitespace-pre-line"),
    sources: answer.locator("ul"),
    citation: cite,
    citationQuote: answer.locator("q"),
    clauseInReader: sec("1011.2"),
    clausePanel: panel,
  });

  // ============================================================ 12. hover the citation
  await cite.hover();
  await shot("Pointer on the 1011.2 citation chip (it underlines; clicking it shows the clause in the book)", {
    citation: cite,
    answerCard: answer,
    clauseInReader: sec("1011.2"),
  });

  fs.writeFileSync(path.join(SHOTS, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(path.join(DIR, "capture-log.txt"), ["# backend calls the page made", ...calls, "", "# problems", ...problems, ""].join("\n"));
  console.log(`\n${manifest.length} keyframes -> ${SHOTS}`);
  console.log(problems.length ? `problems:\n  ${[...new Set(problems)].join("\n  ")}` : "no problems");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
