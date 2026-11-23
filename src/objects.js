// Shared objects whose geometry must be identical across shots (brief section 9): desk and lamp (G5),
// book tower (G1), gold view (G2), hand, sticky note, logo.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL, W = FILM.W, H = FILM.H;
  const { hash, rnd, rs, lerp, clamp } = L;

  // ---- G5 desk and lamp. opts: stripe, lampOn (default true), day (0..1 morning light), window (default true) ----
  O.DESK_Y = 1260; O.DESK_BACK = 1090; O.DESK_FRONT = 1340;
  O.desk = (ctx, o = {}) => {
    const lampOn = o.lampOn !== false, day = o.day ?? 0;
    L.paperPlate(ctx, { stripe: o.stripe || PAL.stripeSand, seed: o.seed ?? 21 });
    // night wall: hatched dark toward the corners, lifted by day
    if (day < 1) {
      L.hatch(ctx, [0, 0, W, 1090], { gap: 12, color: PAL.inkFaint, width: 1.3, alpha: 0.5 * (1 - day), seed: 61 });
      L.hatch(ctx, [[0, 0], [330, 0], [0, 760]], { gap: 8, angle: 105, color: PAL.inkSoft, width: 1.3, alpha: 0.5 * (1 - day), seed: 62 });
      L.hatch(ctx, [[W, 560], [W, 1090], [690, 1090]], { gap: 8, angle: 105, color: PAL.inkSoft, width: 1.3, alpha: 0.45 * (1 - day), seed: 63 });
    }
    if (o.window !== false) {                       // window: night sky, or pale morning
      const wx = 56, wy = 250, ww = 200, wh = 320;
      L.rect(ctx, wx, wy, ww, wh, { fill: day > 0.5 ? PAL.lampGlow : PAL.night, width: 5, double: true, seed: 70 });
      if (day > 0.5) { L.hatch(ctx, [wx, wy, ww, wh], { gap: 12, color: PAL.brand300, width: 2, seed: 71 }); L.circle(ctx, wx + 130, wy + 110, 34, { fill: PAL.brand400, width: 3, seed: 72 }); }
      else {
        L.hatch(ctx, [wx, wy, ww, wh], { gap: 8, color: PAL.inkSoft, width: 1.2, seed: 71 });
        L.circle(ctx, wx + 130, wy + 100, 26, { fill: PAL.lampGlow, width: 2.5, seed: 72 });
        L.circle(ctx, wx + 142, wy + 92, 22, { fill: PAL.night, width: 0, seed: 73 });
        L.stipple(ctx, wx + 10, wy + 10, ww - 20, wh - 20, 14, { color: PAL.lampGlow, r: 1.6, seed: 74 });
      }
      L.line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, { width: 4, seed: 75 });
      L.line(ctx, wx, wy + wh * 0.5, wx + ww, wy + wh * 0.5, { width: 4, seed: 76 });
      L.rect(ctx, wx - 14, wy + wh, ww + 28, 18, { fill: PAL.paperDeep, width: 4, seed: 77 });
    }
    // desk top (seen slightly from above) and front
    const top = [[-20, O.DESK_BACK], [W + 20, O.DESK_BACK], [W + 20, O.DESK_FRONT], [-20, O.DESK_FRONT]];
    L.poly(ctx, top, { fill: PAL.desk, width: 0 });
    for (let i = 0; i < 9; i++) { const y = O.DESK_BACK + 16 + i * 27 + rs('dg', i) * 6; L.line(ctx, -20 + rnd('dg', i, 1) * 200, y, W + 20 - rnd('dg', i, 2) * 260, y + rs('dg', i, 3) * 5, { color: PAL.deskDeep, width: 1.6, alpha: 0.7, seed: 80 + i }); }
    // lamp pool: a flat shape, never a gradient
    if (lampOn) {
      ctx.save(); ctx.beginPath(); L.pathOf(ctx, top); ctx.clip();
      L.ellipse(ctx, 540, 1180, 420, 120, { fill: PAL.lampGlow, color: PAL.heroShade, width: 2, alpha: 1, seed: 90, n: 44 });
      L.ellipse(ctx, 540, 1180, 300, 80, { color: PAL.brand300, width: 1.6, seed: 91, n: 36, dash: [10, 12] });
      ctx.restore();
    }
    L.line(ctx, -20, O.DESK_BACK, W + 20, O.DESK_BACK, { width: 5, double: true, seed: 95 });
    L.rect(ctx, -20, O.DESK_FRONT, W + 40, H - O.DESK_FRONT + 20, { fill: PAL.deskDeep, width: 0 });
    L.hatch(ctx, [-20, O.DESK_FRONT, W + 40, 620], { gap: 8, color: PAL.ink, width: 1.5, alpha: 0.5, seed: 96 });
    L.hatch(ctx, [-20, O.DESK_FRONT, W + 40, 90], { gap: 5, angle: 105, color: PAL.ink, width: 1.4, alpha: 0.5, seed: 97 });
    L.line(ctx, -20, O.DESK_FRONT, W + 20, O.DESK_FRONT, { width: 6, double: true, seed: 98 });
    for (const dx of [150, 610]) {                  // drawer fronts
      L.rect(ctx, dx, O.DESK_FRONT + 250, 330, 200, { color: PAL.ink, width: 3.5, alpha: 0.8, seed: 100 + dx });
      L.rrect(ctx, dx + 125, O.DESK_FRONT + 330, 80, 22, 10, { fill: PAL.desk, width: 3, seed: 101 + dx });
    }
  };
  // The lamp is drawn after desk objects so its arm overlaps them correctly. head at (860, 380).
  O.lamp = (ctx, o = {}) => {
    const on = o.on !== false;
    const base = [980, 1150], elbow = [1010, 760], head = [860, 380];
    L.ellipse(ctx, base[0], base[1], 78, 22, { fill: PAL.spineSlate, width: 4, double: true, seed: 110 });
    L.hatch(ctx, L.ellPts(base[0], base[1], 78, 22, 20), { gap: 5, color: PAL.inkStrong, width: 1.4, seed: 111 });
    L.ink(ctx, [[base[0], base[1] - 8], elbow, [head[0] + 46, head[1] + 12]], { width: 9, seed: 112 });
    L.ink(ctx, [[base[0] + 14, base[1] - 8], [elbow[0] + 16, elbow[1] + 4], [head[0] + 58, head[1] + 22]], { width: 3, seed: 113, color: PAL.inkSoft });
    L.circle(ctx, elbow[0] + 6, elbow[1], 14, { fill: PAL.hero, width: 4, seed: 114 });
    const shade = [[head[0] - 78, head[1] + 44], [head[0] - 14, head[1] - 44], [head[0] + 56, head[1] - 22], [head[0] + 34, head[1] + 66]];
    L.poly(ctx, shade, { fill: PAL.spineSlate, width: 5, double: true, seed: 115 });
    L.hatch(ctx, shade, { gap: 6, color: PAL.inkStrong, width: 1.5, seed: 116 });
    L.ink(ctx, [[head[0] - 78, head[1] + 44], [head[0] - 26, head[1] + 74], [head[0] + 34, head[1] + 66]], { fill: on ? PAL.lampGlow : PAL.paperDeep, width: 4, close: true, seed: 117 });
    if (on) {                                       // faint construction lines: the light cone
      L.line(ctx, head[0] - 76, head[1] + 48, 150, 1150, { color: PAL.heroShade, width: 1.4, alpha: 0.5, seed: 118, dash: [14, 12] });
      L.line(ctx, head[0] + 30, head[1] + 68, 930, 1130, { color: PAL.heroShade, width: 1.4, alpha: 0.5, seed: 119, dash: [14, 12] });
    }
  };

  // ---- G1 book tower ----
  // layout: N books from the desk line up to y ~420, centred x 400. The last (top) book is the gold hero.
  O.tower = (N = FILM.CFG.N) => {
    const cols = [PAL.spineSlate, PAL.spineStone, PAL.spineSand], raw = [];
    let sum = 0; for (let i = 0; i < N; i++) { const t = 1 + rs('tw', i, 1) * 0.2; raw.push(t); sum += t; }
    const books = []; let y = O.DESK_Y;
    for (let i = 0; i < N; i++) {
      const h = (raw[i] / sum) * (O.DESK_Y - 420), hero = i === N - 1;
      const w = hero ? 440 : 380 + rnd('tw', i, 2) * 80, cx = 400 + (hero ? 0 : rs('tw', i, 3) * 14);
      y -= h;
      books.push({ i, x: cx - w / 2, y, w, h, hero, color: hero ? PAL.hero : cols[(hash('tw', i, 4) + (i % 2)) % 3], seed: 500 + i * 7 });
    }
    return books;
  };
  // one book seen spine-on. opts: dx, dy, rot (radians)
  O.book = (ctx, b, o = {}) => {
    ctx.save();
    ctx.translate(b.x + b.w / 2 + (o.dx || 0), b.y + b.h / 2 + (o.dy || 0)); if (o.rot) ctx.rotate(o.rot); ctx.translate(-b.w / 2, -b.h / 2);
    const dark = b.color === PAL.spineSlate, hc = b.hero ? PAL.heroShade : dark ? PAL.inkStrong : PAL.inkSoft, s = b.seed;
    L.rrect(ctx, 0, 0, b.w, b.h, 5, { fill: b.color, width: 0, seed: s });
    L.hatch(ctx, [b.w * 0.62, 0, b.w * 0.38, b.h], { gap: b.hero ? 6 : 8, color: hc, width: 1.5, seed: s + 1 });       // shadow side, away from the light
    L.hatch(ctx, [0, b.h * 0.62, b.w, b.h * 0.38], { gap: 6, color: hc, width: 1.3, alpha: 0.8, seed: s + 2 });
    if (b.hero) L.hatch(ctx, [b.w * 0.8, 0, b.w * 0.2, b.h], { gap: 6, angle: 105, color: PAL.heroDeep, width: 1.5, seed: s + 3 });
    for (const u of [0.08, 0.11, 0.89, 0.92]) L.line(ctx, b.w * u, 1, b.w * u, b.h - 1, { color: dark ? PAL.spineSand : PAL.ink, width: 2.2, seed: s + u * 100, amp: 0.6 });
    L.scribble(ctx, b.w * 0.74, b.h * 0.5 - (b.h > 34 ? 5 : 0), b.w * 0.44, { lines: b.h > 34 ? 2 : 1, gap: 10, color: dark ? PAL.paperShade : PAL.ink, width: 2, seed: s + 5, word: 20 });
    L.rrect(ctx, 0, 0, b.w, b.h, 5, { width: 4, double: true, seed: s + 6 });
    ctx.restore();
  };

  // ---- G2 gold reading view: x 90..910, y 360..1240, radius 36 ----
  O.VIEW = { x: 90, y: 360, w: 820, h: 880, r: 36, head: 96 };
  O.goldView = (ctx, o = {}) => {
    const v = O.VIEW; ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    L.hatch(ctx, L.rrectPts(v.x + 16, v.y + 20, v.w, v.h, v.r), { gap: 6, color: PAL.inkSoft, width: 1.6, alpha: 0.7, seed: 130 });   // cast shadow, lower right
    L.rrect(ctx, v.x, v.y, v.w, v.h, v.r, { fill: PAL.brand100, width: 5, double: true, seed: 131 });
    L.line(ctx, v.x + 6, v.y + v.head, v.x + v.w - 6, v.y + v.head, { color: PAL.ink, width: 3, seed: 132 });
    L.hatch(ctx, [v.x + 8, v.y + 8, v.w - 16, 10], { gap: 5, color: PAL.hero, width: 2, seed: 133 });
    L.line(ctx, v.x + 5, v.y + 20, v.x + v.w - 5, v.y + 20, { color: PAL.hero, width: 5, seed: 134 });                              // the gold edge
    ctx.restore();
  };
  // crisp header for the gold view (text layer): the mark in the top corner and the language switch
  O.goldViewText = (ctx, o = {}) => {
    const v = O.VIEW, a = o.alpha ?? 1; if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    O.logoMark(ctx, v.x + v.w - 76, v.y + 59, 38);
    L.txt(ctx, 'العربية · English · كلاهما', v.x + 50, v.y + 69, { size: 24, weight: 500, align: 'left', dir: 'rtl', color: PAL.inkSoft });
    ctx.restore();
  };

  // ---- logos (brief 4.4): the exported vectors, flat tint only, no boil, no grain, no distortion ----
  // the Emtithal mark alone (the left part of the logo), centred on (cx, cy), h px tall
  O.logoMark = (ctx, cx, cy, h, color = PAL.ink) => {
    const B = FILM.BRAND, m = B.emtithal.mark, S = B.S;
    ctx.drawImage(B.tinted('emtithal', color), m[0] * S, m[1] * S, m[2] * S, m[3] * S, cx - h / 2, cy - h / 2, h, h);
  };
  // the full Emtithal logo (mark and wordmark as one piece), centred on (cx, cy), h px tall
  O.logoLockup = (ctx, cx, cy, h, color = PAL.inkStrong) => {
    const d = FILM.BRAND.emtithal, w = (h * d.w) / d.h;
    ctx.drawImage(FILM.BRAND.tinted('emtithal', color), cx - w / 2, cy - h / 2, w, h);
  };
  // the AISC logo, centred on (cx, cy), h px tall
  O.logoAisc = (ctx, cx, cy, h, color = PAL.inkStrong) => {
    const d = FILM.BRAND.aisc, w = (h * d.w) / d.h;
    ctx.drawImage(FILM.BRAND.tinted('aisc', color), cx - w / 2, cy - h / 2, w, h);
  };
  // "بواسطة" + AISC logo, the byline used under the Emtithal logo in the team's Figma file
  O.byAisc = (ctx, cx, cy, h, color = PAL.inkStrong) => {
    const d = FILM.BRAND.aisc, w = (h * d.w) / d.h, size = h * 0.62, tw = L.measure(ctx, 'بواسطة', { size, weight: 500 }), gap = h * 0.4, total = w + gap + tw;
    ctx.drawImage(FILM.BRAND.tinted('aisc', color), cx - total / 2, cy - h / 2, w, h);
    L.txt(ctx, 'بواسطة', cx + total / 2, cy + size * 0.36, { size, weight: 500, align: 'right', color });
  };

  // ---- hand: fingertip at (tx, ty). opts: from (degrees, the direction the arm comes from; 0 = from the right, 90 = from below),
  // cuff: 'thobe' (white) or 'shirt' (slate work shirt), press (0..1 fingertip squash), scale ----
  O.hand = (ctx, tx, ty, o = {}) => {
    const a = ((o.from ?? 55) * Math.PI) / 180, sc = o.scale ?? 1, s = o.seed ?? 900;
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(a); ctx.scale(sc, sc);
    const skin = PAL.paperShade, shirt = o.cuff === 'shirt';
    // sleeve and cuff (drawn first, under the palm)
    L.poly(ctx, [[400, -120], [1500, -170], [1500, 190], [400, 130]], { fill: shirt ? PAL.spineSlate : PAL.paper, width: 5, double: true, seed: s });
    L.hatch(ctx, [[400, 40], [1500, 60], [1500, 190], [400, 130]], { gap: 8, color: shirt ? PAL.inkStrong : PAL.inkFaint, width: 1.6, seed: s + 1 });
    for (let i = 0; i < 4; i++) L.line(ctx, 520 + i * 150, -110 - i * 5, 560 + i * 150, 100 + i * 8, { color: shirt ? PAL.inkStrong : PAL.inkSoft, width: 2, alpha: 0.7, seed: s + 2 + i });
    L.rrect(ctx, 330, -112, 96, 232, 14, { fill: shirt ? PAL.ovSlate : PAL.paper, width: 5, double: true, seed: s + 8 });
    L.circle(ctx, 378, 60, 9, { fill: shirt ? PAL.spineSand : PAL.hero, width: 2.5, seed: s + 9 });
    // palm, curled fingers, thumb
    L.poly(ctx, [[150, -70], [250, -96], [340, -84], [340, 104], [240, 118], [150, 96], [118, 30]], { fill: skin, width: 5, double: true, seed: s + 10 });
    for (let i = 0; i < 3; i++) L.rrect(ctx, 96 + i * 8, 2 + i * 34, 96, 40, 20, { fill: skin, width: 4.5, seed: s + 12 + i });
    L.poly(ctx, [[200, -78], [150, -128], [96, -138], [84, -112], [140, -84], [176, -50]], { fill: skin, width: 4.5, seed: s + 16 });
    // index finger
    const pr = 1 - (o.press ?? 0) * 0.06;
    L.rrect(ctx, 0, -26, 190 * pr + 10, 50, 25, { fill: skin, width: 5, double: true, seed: s + 18 });
    L.line(ctx, 62, -22, 66, 20, { color: PAL.inkSoft, width: 2, seed: s + 19 }); L.line(ctx, 118, -22, 122, 22, { color: PAL.inkSoft, width: 2, seed: s + 20 });
    L.arc(ctx, 20, 0, 15, -1.9, 1.9, { color: PAL.inkSoft, width: 2, seed: s + 21 });
    L.hatch(ctx, [[10, 6], [190, 6], [340, 60], [340, 104], [240, 118], [150, 96]], { gap: 8, color: PAL.heroShade, width: 1.5, seed: s + 22 });
    ctx.restore();
  };

  // ---- sticky note with a hand-drawn question mark. opts: rot, tag (small gold clause tag, shot 17), flutter ----
  O.note = (ctx, cx, cy, size, o = {}) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? -0.08); const h = size / 2, s = o.seed ?? 950, fl = o.flutter ?? 0;
    L.poly(ctx, [[-h, -h], [h, -h], [h, h - size * 0.2 - fl * 10], [h - size * 0.2, h - fl * 14], [-h, h]], { fill: PAL.brand400, width: Math.max(2.5, size * 0.035), double: true, seed: s });
    L.hatch(ctx, [[-h, h * 0.2], [h, h * 0.2], [h, h], [-h, h]], { gap: Math.max(5, size * 0.07), color: PAL.heroShade, width: 1.4, seed: s + 1 });
    L.poly(ctx, [[h, h - size * 0.2 - fl * 10], [h - size * 0.2, h - fl * 14], [h - size * 0.2, h - size * 0.2]], { fill: PAL.brand300, width: Math.max(2, size * 0.03), seed: s + 2 });
    const q = size * 0.2;
    L.ink(ctx, [[q, -q * 1.1], [q * 0.6, -q * 1.9], [-q * 0.4, -q * 2], [-q, -q * 1.2], [-q * 0.5, -q * 0.3], [0, q * 0.2], [0, q * 0.8]], { width: Math.max(3, size * 0.07), seed: s + 3 });
    L.circle(ctx, 0, q * 1.6, Math.max(2.5, size * 0.04), { fill: PAL.ink, width: 2, seed: s + 4 });
    ctx.restore();
  };

  // DRAFT tag (top of the safe area) while any ledger item is unconfirmed
  O.draftTag = (ctx, mode) => {
    if (!FILM.CFG.draft) return;
    L.chip(ctx, 'مسودة · DRAFT', 190, 262, { size: 20, weight: 600, fill: mode === 'SCH' ? PAL.bpLight : PAL.brand200, color: mode === 'SCH' ? PAL.lineGold : PAL.inkSoft, outline: mode === 'SCH' ? PAL.lineGold : PAL.inkSoft, outlineW: 1.5, padX: 16, alpha: 0.9 });
  };
})();
