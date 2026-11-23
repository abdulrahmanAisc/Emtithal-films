// Builds fixtures/*.json from facts in the emtithal-platform repo only. Sources are named per field.
const fs = require("fs");
const path = require("path");
const out = (name, v) => fs.writeFileSync(path.join(__dirname, "fixtures", name), JSON.stringify(v, null, 2) + "\n");

// --- books: backend/modules/billing/src/emtithal_billing/code_packs.py PKG_TO_CODE_EDITION (24 codes)
const CODES = ["201","801","301","302","303","304","305","306","307","308","309","310","311","312","401","501","701","702","901","902","1001","1101","1201","1401"];
// backend/modules/codebooks/src/emtithal_codebooks/build_store.py TITLES (only these two exist in the repo)
const TITLES = { "201": ["Saudi General Building Code", "كود البناء السعودي العام"], "801": ["Saudi Fire Code", "كود الحماية من الحرائق السعودي"] };
const book = (code) => ({
  key: `SBC${code}:2024`, // "SBC201:2024"/"SBC801:2024" are in the repo; the others follow code_packs.py's "the 2024 family"
  code: `SBC ${code}`, // build_store.py: code=f"SBC {code}"
  edition: "2024",
  kind: "sbc",
  // build_store.py falls back to the code itself where it has no title: TITLES.get(code, (f"SBC {code}", ""))[0] / ("", f"SBC {code}")[1]
  title_en: (TITLES[code] ?? [`SBC ${code}`])[0],
  title_ar: (TITLES[code] ?? [null, `SBC ${code}`])[1],
  status: "live", // PLACEHOLDER (not in repo per book)
  pages: 0, // PLACEHOLDER: required number, unknown
  store_version: "v1", // limits.py names codebooks/SBC201-2024/v1; never displayed
  loaded_at: null, // unknown -> UI shows "—"
  updated_at: null,
  changes: null,
  clauses: null,
  enabled: true, // PLACEHOLDER (not in repo per book)
  size_bytes: null,
});
// the API orders by code (viewer.py: order_by(org_id nulls first, code, edition desc)) -> plain string order
const books = CODES.map(book).sort((a, b) => (a.code < b.code ? -1 : 1));
out("books.json", books);
out("books-titled-only.json", books.filter((b) => TITLES[b.code.slice(4)]));
const sbc201 = books.find((b) => b.key === "SBC201:2024");

// --- clauses: backend/modules/truth/src/emtithal_truth/limits.py (clause number + verbatim quote; one quote per row)
const BOOK = "SBC201:2024";
const PAGE = 0; // PLACEHOLDER: page_start/page_end are required numbers; the repo has no page for these clauses
const row = (number, kind, text_en, parent_number = null) => ({
  key: `${BOOK}:${number}`, number, parent_number, kind,
  title_en: null, text_en, title_ar: null, text_ar: null, page_start: PAGE, page_end: PAGE,
});
const chapterRow = row("Chapter 10", "chapter", "");
const rows = [
  chapterRow,
  row("1010.1.1", "clause", "shall provide a minimum clear opening width of 800 mm"),
  row("1010.3.1", "clause", "Each revolving door shall be capable of breakout in accordance with BHMA A156.27 and shall provide an aggregate width of not less than 900 mm."),
  row("1011.2", "clause", "the minimum width shall be not less than 1100 mm"),
  row("1011.2 Exception 1", "exception", "Stairways serving an occupant load of less than 50 shall have a width of not less than 900 mm", "1011.2"),
  row("1011.5.2", "clause", "Stair riser heights shall be 175 mm maximum and 100 mm minimum"),
  row("1012.2", "clause", "a running slope not steeper than 1 unit vertical in 12 units horizontal (8.3-percent slope)"),
  row("1020.5", "clause", "dead-end corridors do not exceed 6 m in length"),
  row("1020.5 Exception 2", "exception", "the length of the dead- end corridors shall not exceed 15 m", "1020.5"),
];
out("chapter-10.json", { number: "Chapter 10", clauses: rows, tables: [], figures: [] });
out("contents.json", [{ number: "Chapter 10", kind: "chapter", title_en: null, title_ar: null, page_start: PAGE, sections: [] }]);
const trail = [{ number: "Chapter 10", title_en: null, title_ar: null }];
const full = (r, exceptions = []) => ({
  ...r, bbox: null, page_size: null, sort_kind: null, answerable: null, exceptions,
  trail: r.kind === "chapter" ? [] : trail, links: [], linked_clauses: [], tables: [], figures: [], definitions: [],
});
const clauses = {};
for (const r of rows) clauses[r.number] = full(r, rows.filter((x) => x.kind === "exception" && x.parent_number === r.number));

// --- PLACEHOLDER book page (no page image exists outside the product's store): capture.cjs draws a greeked
// page from this, grey bars for lines of text and nothing readable, and serves it for pages/<n>. Sizes are in
// PDF points with the origin at the top left, as the UI reads bbox (clause-parts.tsx: left = bbox[0]/width,
// top = bbox[1]/height). The page size (A4) and the bbox are placeholders, not the clause's real position.
const PW = 595, PH = 842, X0 = 62, X1 = 533, LINE = 7, GAP = 15;
const bars = [];
const para = (y, widths) => widths.forEach((w, i) => bars.push({ x: X0, y: y + i * GAP, w: Math.round((X1 - X0) * w), h: LINE }));
para(96, [1, 1, 0.97, 1, 0.62]);
para(196, [1, 0.98, 1, 0.44]);
const FRAME_Y = 280, FRAME_LINES = [1, 1, 0.71];
para(FRAME_Y, FRAME_LINES); // the block the frame goes around
para(350, [1, 1, 0.99, 1, 1, 0.35]);
para(466, [1, 0.96, 1, 1, 0.8]);
para(566, [1, 1, 1, 0.52]);
para(652, [1, 0.99, 1, 1, 1, 0.27]);
const frame = [X0 - 6, FRAME_Y - 7, X1 + 6, FRAME_Y + (FRAME_LINES.length - 1) * GAP + LINE + 7];
out("page-placeholder.json", { placeholder: true, width: PW, height: PH, bars, frame });
clauses["1011.2"].bbox = frame; // PLACEHOLDER position
clauses["1011.2"].page_size = { width: PW, height: PH }; // PLACEHOLDER size
out("clauses.json", clauses);
out("overview.json", {
  book: sbc201,
  counts: { chapters: 0, clauses: 0, checkable: 0, tables: 0, figures: 0, definitions: 0 }, // PLACEHOLDER, only shown on the overview tab (not captured)
  key_requirements: [], related: [],
});
out("changes.json", []);
out("used-in.json", []);
const Q = "the minimum width shall be not less than 1100 mm";
out("search-1011.2.json", [{ ...rows.find((r) => r.number === "1011.2"), book_key: BOOK, score: 1 /* PLACEHOLDER, never displayed */, how: "number" }]);
out("ask.json", { ok: true, answer: "The minimum width shall be not less than 1100 mm.", citations: [{ ref: "1011.2", quote: Q }], result: null, note: null, refused: null });
