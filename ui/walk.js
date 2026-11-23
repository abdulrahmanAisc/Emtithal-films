// UI video 1: a walkthrough of the real Emtithal reader (captured keyframes), with a cursor, clicks and a camera.
// Flow: knowledge base -> SBC 201 -> search by clause number -> clause 1011.2 -> select text -> ask the book ->
// cited answer -> the original page as the source -> call to action.
// One event list drives both the picture and the sound, so every sound sits on the thing that makes it.
(function () {
  const L = FILM.lib, O = FILM.obj, U = FILM.UI, PAL = L.PAL, { clamp, lerp, prog, ease, hexA } = L;
  const SIZE = [1080, 1080], W = SIZE[0], H = SIZE[1];
  const SLOW = 1.6;                                   // the whole piece runs this much slower than its timeline
  const END = 19.4;
  const V = FILM.V = { DUR: END * SLOW, FPS: 60 };
  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  const MID = (U.VH - U.BAR) / 2;
  const range = (n, t0, dt) => Array.from({ length: n }, (_, i) => t0 + i * dt);

  // ---- the timeline (seconds before slowing) ----
  // typing: keys land one by one in the field, then the real typed state takes over
  const TYPE = [{ to: 'k02', rect: 'searchInput', keys: range(7, 1.42, 0.075), done: 1.98 }, { to: 'k06', rect: 'searchInput', keys: range(6, 4.5, 0.085), done: 5.0 }];
  const ENTER = 5.4;
  // which captured state is on screen, and the sound its arrival makes
  const STATES = [[0, 'k01'], [1.98, 'k02', 'pop'], [2.66, 'k04', 'page'], [3.56, 'k05', 'pop'], [5.0, 'k06'], [5.45, 'k07', 'pop'], [5.95, 'k08', 'chime'], [7.45, 'k09', 'pop'], [8.26, 'k08'], [9.06, 'k10', 'slide'], [9.86, 'k11', 'pop'], [10.9, 'k12', 'chime'], [11.75, 'k13', 'tick'], [13.1, 'k14']];
  const SCROLL = [12.5, 13.1];                        // the clause panel is scrolled down to its original-page section
  const DRAG = [6.95, 7.4];
  let CLICKS, CUR, CAM, PAGE;
  function plan() {                                   // built after the keyframes load, because it reads their target rects
    const toPage = [530, 600];                        // inside the clause panel, where the wheel scroll happens
    const pg = U.R('k14', 'pageImage'), fr = U.R('k14', 'pageFrame');
    const pz = clamp(Math.min(860 / pg.w, 800 / pg.h), 0.7, 1.7), fz = clamp(Math.min(900 / fr.w, 420 / fr.h), pz, 2.2);
    PAGE = { pg, fr };
    CLICKS = [[1.3, 900, 193], [2.6, 643, 358], [3.5, 1177, 40], [4.3, 1180, 231], [8.2, 1290, 700], [9.0, 92, 856], [9.8, 170, 394]];
    CUR = [[0, 980, 620], [0.5, 980, 620], [1.25, 900, 193], [1.98, 880, 215], [2.55, 643, 358], [2.9, 660, 380], [3.45, 1177, 40], [3.7, 1185, 60], [4.25, 1180, 231], [5.4, 1150, 250], [6.2, 900, 600], [6.85, 801, 545], [6.95, 801, 545], [7.4, 967, 545], [7.7, 990, 560], [8.15, 1290, 700], [8.4, 1290, 700], [8.95, 92, 856], [9.2, 100, 850], [9.75, 170, 394], [10.2, 200, 460], [11.0, 210, 500], [11.7, 286, 437], [11.9, 286, 437], [12.4, toPage[0], toPage[1]], [13.3, toPage[0], toPage[1]], [13.9, pg.x + pg.w * 0.2, pg.y + pg.h * 0.8], [14.3, pg.x + pg.w * 0.2, pg.y + pg.h * 0.8], [14.9, fr.x + fr.w * 0.5, fr.y + fr.h + 26], [END, fr.x + fr.w * 0.5, fr.y + fr.h + 26]];
    CAM = [[0, 720, MID, 0.7], [0.9, 720, MID, 0.7], [1.6, 800, 330, 1.15], [2.2, 850, 320, 1.3], [2.7, 850, 320, 1.3], [3.2, 720, MID, 0.72], [3.9, 720, MID, 0.72], [4.5, 850, 380, 1.0], [5.6, 850, 380, 1.0], [6.3, 760, 520, 1.05], [6.7, 760, 520, 1.05], [7.3, 884, 620, 1.5], [8.1, 884, 620, 1.5], [8.7, 720, 500, 0.85], [9.0, 720, 500, 0.85], [9.5, 430, 560, 1.15], [10.5, 430, 560, 1.15], [11.2, 250, 400, 1.7], [11.95, 250, 400, 1.7], [12.45, 530, 540, 1.1], [13.25, 530, 540, 1.1], [13.85, pg.x + pg.w / 2, pg.y + pg.h / 2, pz], [14.35, pg.x + pg.w / 2, pg.y + pg.h / 2, pz], [14.9, fr.x + fr.w / 2, fr.y + fr.h / 2, fz], [15.5, fr.x + fr.w / 2, fr.y + fr.h / 2, fz], [16.3, 720, MID, 0.7], [END, 720, MID, 0.7]];
  }
  const CAPS = [[0.2, 2.6, 'قاعدة المعرفة: كتب كود البناء السعودي'], [3.0, 5.8, 'ابحث برقم البند'], [6.0, 8.3, 'حدّد أي نص من البند'], [8.6, 10.7, 'اسأل الكتاب'], [11.0, 12.3, 'إجابة من نص الكود، مع بندها'], [12.6, 15.9, 'والمصدر: الصفحة الأصلية من الكتاب']];
  // the call to action
  const CTA = { t: 16.4, morph: 0.75, logo: 16.9, by: 17.05, head: 17.2, sub: 17.38, btn: 17.58, url: 17.78, note: 17.95, click: 18.55, btnY: 700 };

  // ---- typing reveal: the typed text of the next state appears character by character in the field ----
  const extents = {};
  function textExtent(id, r) {                        // dark pixels inside the field of the typed state = the typed text
    const key = id; if (extents[key] !== undefined) return extents[key];
    const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true }), pad = 5;
    c.width = Math.round((r.w - pad * 2) * 2); c.height = Math.round((r.h - pad * 2) * 2);
    g.drawImage(U.imgs[id], (r.x + pad) * 2, (r.y + pad) * 2, c.width, c.height, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = -1;
    for (let x = 0; x < c.width; x++) for (let y = 0; y < c.height; y += 2) { const i = (y * c.width + x) * 4; if (d[i] + d[i + 1] + d[i + 2] < 300) { if (x < x0) x0 = x; if (x > x1) x1 = x; break; } }
    const bg = `rgb(${d[0]},${d[1]},${d[2]})`;
    return (extents[key] = x1 < 0 ? null : { x0: r.x + pad + x0 / 2 - 1, x1: r.x + pad + x1 / 2 + 2, bg });
  }
  function typing(c, T) {
    for (const ty of TYPE) {
      const n = ty.keys.filter((k) => T >= k).length; if (!n || T >= ty.done) continue;
      const r = U.R(ty.to, ty.rect), e = textExtent(ty.to, r); if (!e) continue;
      const w = e.x1 - e.x0, part = (w * n) / ty.keys.length;
      c.fillStyle = e.bg; c.fillRect(r.x + 2, r.y + 3, r.w - 4, r.h - 6);                       // clears the placeholder text
      c.drawImage(U.imgs[ty.to], e.x0 * 2, (r.y + 3) * 2, part * 2, (r.h - 6) * 2, e.x1 - part, r.y + 3, part, r.h - 6);
      if (Math.floor(T * 2.2) % 2 === 0) { c.fillStyle = PAL.ink; c.fillRect(e.x1 - part - 2, r.y + r.h * 0.26, 1.4, r.h * 0.48); }   // caret
    }
  }
  function backdrop(t) {                              // the brand's halftone skyline, cover-fit, drifting slowly
    const im = U.bg, k = t / END, sc = Math.max(W / im.width, H / im.height) * (1.12 + k * 0.05), dw = im.width * sc, dh = im.height * sc;
    ctx.drawImage(im, (W - dw) / 2 - 30 + k * 60, (H - dh) / 2, dw, dh);
    ctx.fillStyle = hexA(PAL.brand50, 0.18); ctx.fillRect(0, 0, W, H);
  }
  function cta(T) {
    const k = ease.inOut(prog(T, CTA.t, CTA.morph)); if (k <= 0) return;
    // the logo plate grows into the whole frame
    const x = lerp(390, 0, k), y = lerp(52, 0, k), w = lerp(300, W, k), h = lerp(88, H, k), r = lerp(22, 0, k);
    ctx.save(); ctx.shadowColor = hexA(PAL.inkStrong, 0.25 * (1 - k)); ctx.shadowBlur = 40; L.rr(ctx, x, y, w, h, Math.max(r, 0.01)); ctx.fillStyle = PAL.brand50; ctx.fill(); ctx.restore();
    ctx.save(); L.rr(ctx, x, y, w, h, Math.max(r, 0.01)); ctx.clip();
    ctx.globalAlpha = 0.08 * k; ctx.fillStyle = PAL.brand300;                                        // the end card's quiet stripe
    for (let sx = -H; sx < W + 300; sx += 300) { ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx + H, 0); ctx.lineTo(sx + H + 150, 0); ctx.lineTo(sx + 150, H); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha = 1;
    O.logoLockup(ctx, 540, lerp(96, 330, k), lerp(44, 112, k), PAL.inkStrong);
    const rise = (t0, d = 0.32) => { const a = ease.outCubic(prog(T, t0, d)); return { a, dy: (1 - a) * 22 }; };
    let e = rise(CTA.by); if (e.a > 0) { ctx.save(); ctx.globalAlpha = e.a; O.byAisc(ctx, 540, 436 + e.dy, 32, PAL.inkStrong); ctx.restore(); }
    e = rise(CTA.head); L.txt(ctx, 'اسأل الكود.', 540, 580 + e.dy, { size: 92, weight: 700, color: PAL.inkStrong, alpha: e.a });
    e = rise(CTA.sub); L.txt(ctx, 'كود البناء السعودي، يجاوبك من نصّه.', 540, 648 + e.dy, { size: 36, weight: 500, color: PAL.ink, alpha: e.a });
    const bp = L.pop(T, CTA.btn, 9), press = T >= CTA.click - 0.04 && T < CTA.click + 0.12 ? 0.95 : 1, glow = prog(T, CTA.click, 0.6);
    if (bp > 0) {
      if (glow > 0 && glow < 1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - glow); L.rr(ctx, 540 - 150 - glow * 26, CTA.btnY + 30 - 44 - glow * 26, 300 + glow * 52, 88 + glow * 52, 44 + glow * 26); ctx.strokeStyle = PAL.cta; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      L.chip(ctx, FILM.CFG.cta, 540, CTA.btnY + 30, { size: 38, weight: 700, fill: PAL.cta, color: PAL.inkStrong, outline: null, scale: bp * press, h: 88, w: 300 });
    }
    e = rise(CTA.url); L.txt(ctx, 'emtithal.aisc.sa', 540, 838 + e.dy, { size: 30, weight: 600, color: PAL.inkSoft, alpha: e.a });
    e = rise(CTA.note);
    L.txt(ctx, 'يساعدك امتثال على قراءة كود البناء السعودي وفهمه،', 540, 968 + e.dy, { size: 21, color: hexA(PAL.ink, 0.8), alpha: e.a });
    L.txt(ctx, 'ولا يغني عن المهندس المرخّص، ولا يمثّل اعتماداً رسمياً.', 540, 1002 + e.dy, { size: 21, color: hexA(PAL.ink, 0.8), alpha: e.a });
    ctx.restore();
    // the cursor comes in and presses the button
    const ck = ease.inOut(prog(T, CTA.btn + 0.1, CTA.click - CTA.btn - 0.2));
    if (ck > 0) { const cx = lerp(900, 648, ck), cy = lerp(1010, CTA.btnY + 52, ck); U.ripple(ctx, 648, CTA.btnY + 52, prog(T, CTA.click, 0.5), 1.6); U.cursor(ctx, cx, cy, 1.9, press < 1 ? 1 : 0); }
  }

  V.draw = (T) => {
    T = clamp(Math.round(T * V.FPS) / V.FPS, 0, V.DUR - 1e-4) / SLOW; FILM.bf = 0;
    if (!CAM) plan();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; backdrop(T);
    const [cx, cy, z] = U.track(CAM, T), [mx, my] = U.track(CUR, T), st = U.stateAt(STATES, T);
    const out = ease.inOut(prog(T, CTA.t, CTA.morph));                 // the window sinks back as the end card opens
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(W / 2, H / 2 - 20 + out * 60); ctx.scale(z * (1 - out * 0.08), z * (1 - out * 0.08)); ctx.translate(-cx, -cy);
    U.window(ctx, st, { overlay: (c) => {
      typing(c, T);
      if (T >= SCROLL[0] && T < SCROLL[1] + 0.2) {       // the panel's content slides up to the page section
        const r = U.R('k13', 'toPage'), k = ease.inOut(prog(T, SCROLL[0], SCROLL[1] - SCROLL[0]));
        c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
        c.drawImage(U.imgs.k13, r.x * 2, r.y * 2, r.w * 2, r.h * 2, r.x, r.y - k * r.h, r.w, r.h);
        c.drawImage(U.imgs.k14, r.x * 2, r.y * 2, r.w * 2, r.h * 2, r.x, r.y + (1 - k) * r.h, r.w, r.h); c.restore();
      }
      if (T >= DRAG[0] && T < 7.45) { c.fillStyle = 'rgba(120,160,255,0.55)'; c.globalCompositeOperation = 'multiply'; c.fillRect(801, 532, clamp(mx - 801, 0, 167), 27); c.globalCompositeOperation = 'source-over'; }
    } });
    let press = 0;
    for (const [t, x, y] of CLICKS) { U.ripple(ctx, x, y, prog(T, t, 0.45), 1 / Math.sqrt(z)); if (T >= t - 0.04 && T < t + 0.1) press = 1; }
    if (T >= DRAG[0] && T < DRAG[1] + 0.02) press = 1;
    U.cursor(ctx, mx, my, 1.5 / Math.sqrt(z), press);
    ctx.restore();
    const far = clamp((0.9 - z) / 0.15) * (T < CTA.t ? 1 : 0);
    if (far > 0) { ctx.save(); ctx.globalAlpha = far; L.rr(ctx, 390, 52, 300, 88, 22); ctx.fillStyle = hexA(PAL.brand50, 0.92); ctx.fill(); O.logoLockup(ctx, 540, 96, 44, PAL.inkStrong); ctx.restore(); }
    for (const [a, b, s] of CAPS) {
      const k = Math.min(L.pop(T, a, 8), 1 - prog(T, b - 0.15, 0.15)); if (k <= 0) continue;
      L.chip(ctx, s, 540, 986, { size: 40, weight: 600, fill: PAL.inkStrong, color: PAL.brand50, outline: null, scale: 0.9 + 0.1 * Math.min(1, k), alpha: clamp(k), h: 92, r: 26, padX: 40 });
    }
    cta(T);
  };

  // ---- sound: generated from the same events as the picture ----
  V.sound = (S0) => {
    if (!CAM) plan();
    const at = (t) => t * SLOW;
    for (const [t] of CLICKS) S0.click(at(t));
    for (const ty of TYPE) ty.keys.forEach((k) => S0.key(at(k)));
    S0.key(at(ENTER)); S0.thud(at(ENTER), 0.12);
    const sfx = { pop: (t, i) => S0.pop(t, i % 5), chime: (t) => S0.chime(t, 0.13), tick: (t) => S0.tick(t, 3), page: (t) => S0.whoosh(t - 0.05, 0.35, 0.12), slide: (t) => S0.whoosh(t - 0.05, 0.3, 0.09) };
    STATES.forEach(([t, id, s], i) => { if (s) sfx[s](at(t), i); });
    for (let i = 0; i < 4; i++) S0.tick(at(lerp(DRAG[0], DRAG[1], (i + 0.5) / 4)), i);
    for (let i = 0; i < 6; i++) S0.tick(at(lerp(SCROLL[0], SCROLL[1], i / 6)), 1);                    // wheel notches while the panel scrolls
    S0.pop(at(SCROLL[1]), 2);               // the selection crossing each word
    S0.riffle(at(9.95), (10.85 - 9.95) * SLOW);                                                       // searching, until the answer lands
    for (let i = 0; i < CAM.length - 1; i++) { const a = CAM[i], b = CAM[i + 1]; if (Math.abs(b[3] - a[3]) > 0.22 && a[0] < CTA.t - 0.5) S0.whoosh(at(a[0]), (b[0] - a[0]) * SLOW, 0.045); }   // big camera moves, quietly
    S0.whoosh(at(CTA.t), CTA.morph * SLOW, 0.14); S0.thud(at(CTA.t + CTA.morph), 0.22);
    [CTA.by, CTA.head, CTA.sub, CTA.url].forEach((t, i) => S0.tick(at(t), i)); S0.pop(at(CTA.btn), 4);
    S0.click(at(CTA.click)); S0.chime(at(CTA.click + 0.06), 0.12);
  };
  V.ready = U.load().then(() => { plan(); V.draw(0); U.player(V); return true; });
})();
