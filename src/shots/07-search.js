// 07 search, T 10.5 to 13.5, SCH. Three searches on the page lattice: by clause number, by a word, by meaning.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd, F } = L;
  const PH = 'ابحث داخل الكتاب: رقم بند أو كلمات أو سؤال';
  const BAR = { x: 80, y: 300, w: 860, h: 92 };
  // three searches: typing window (32nds), hit time, lit cell, chip
  const Q = () => [
    { a: 0.25, hit: 0.5, cell: [30, 8], text: FILM.CFG.CLAUSE == null ? '_ _ _' : String(FILM.CFG.CLAUSE), tag: 'رقم البند', cy: 600 },
    { a: 1.0, hit: 1.5, cell: [7, 15], text: 'درج', tag: 'كلمات', cy: 850 },
    { a: 2.0, hit: 2.5, cell: [21, 24], text: 'عرض الدرج', tag: 'المعنى', cy: 1100 },
  ];
  const GLOW = [[12, 9], [25, 13], [16, 18], [31, 20], [4, 23], [22, 27], [10, 29]];
  const chipW = 560, chipH = 96, chipX = 500;
  FILM.defShot('search', {
    draw(ctx, t, T) {
      const qs = Q(), t2 = L.onTwos(t);
      L.blueprintPlate(ctx, { cx: 500, cy: 860, r: 600 });
      // the lattice; on T 13.0 it reorders by meaning: cells flow right to left toward the answer
      const k3 = ease.inOut(prog(t, 2.5, 0.5));
      O.lattice(ctx, { rowFrom: 4, wrap: true, dx: (c, r) => (k3 > 0 ? -k3 * O.LAT.px * (2 + (L.hash('flow', r) % 7) + Math.max(0, 6 - Math.abs(r - 24))) : 0) });
      if (k3 > 0 && k3 < 1) for (let j = 0; j < 22; j++) { const r = 5 + ((j * 7) % 28), y = O.LAT.y + r * 30 + 12, x = 980 - ((j * 131 + k3 * 700) % 860); L.line(ctx, x, y, x - 90 - (j % 4) * 30, y, { color: PAL.line, width: 2, alpha: 0.7 * Math.sin(k3 * Math.PI), seed: 800 + j, amp: 0.4 }); }
      // word search: several cells glow
      if (t >= 1.5) for (const [c, r] of GLOW) O.latLight(ctx, c, r, { fill: PAL.lineGold, alpha: t < 2.5 ? 0.75 : 0.75 * (1 - k3), color: PAL.lineGold, lineAlpha: t < 2.5 ? 1 : 1 - k3, grow: 2 });
      // hits: the cell lights with a `change` flash, lifts out, and a leader runs to its result chip
      qs.forEach((q, i) => {
        if (t < q.hit) return;
        const f = L.flash(t, q.hit, 12), [x, y] = O.latCell(q.cell[0], q.cell[1]), cx = x + 9, cy = y + 12, lift = ease.outExpo(prog(t, q.hit, 0.25));
        O.latLight(ctx, q.cell[0], q.cell[1], { fill: f > 0 ? PAL.change : PAL.lineGold, alpha: f > 0 ? 1 : 0.9, grow: 3 + lift * 5 });
        if (f > 0) { L.glowDot(ctx, cx, cy, 8, { color: PAL.change, alpha: f, rot: t2 * 3 }); L.ring(ctx, cx, cy, 70, { color: PAL.change, scale: 0.3 + (1 - f) * 1.3, alpha: f, width: 3, seed: 810 + i }); }
        L.ring(ctx, cx, cy, 30, { color: PAL.lineGold, width: 2, dash: [8, 7], seed: 815 + i, scale: L.pop(t, q.hit) });
        // leader from the cell to the chip edge
        const ex = cx > chipX ? chipX + chipW / 2 : chipX - chipW / 2, ey = q.cy;
        L.lineTo(ctx, cx, cy, cx, ey, lift, { color: PAL.line, width: 2, seed: 820 + i });
        if (lift >= 1) L.line(ctx, cx, ey, ex, ey, { color: PAL.line, width: 2, seed: 825 + i });
        // chip plate (inked), text is drawn crisp in the text layer
        const s = L.pop(t, q.hit + F(1));
        if (s > 0) {
          const w = chipW * s, h = chipH * s;
          L.hatch(ctx, L.rrectPts(chipX - w / 2 + 10, q.cy - h / 2 + 12, w, h, 22), { gap: 5, color: PAL.bpDeep, width: 2, seed: 830 + i });
          L.rrect(ctx, chipX - w / 2, q.cy - h / 2, w, h, 22, { fill: PAL.bpLight, color: PAL.line, width: 3, double: true, seed: 835 + i });
          L.line(ctx, chipX + w / 2 - 22 * s, q.cy - h / 2 + 14, chipX + w / 2 - 22 * s, q.cy + h / 2 - 14, { color: i === 2 && f > 0 ? PAL.change : PAL.lineGold, width: 6, seed: 840 + i });
        }
      });
      // search field: a ruler-like bar across the top of the lattice
      L.rrect(ctx, BAR.x, BAR.y, BAR.w, BAR.h, 18, { fill: PAL.bpLight, color: PAL.line, width: 3.5, double: true, seed: 850 });
      for (let i = 0; i <= 43; i++) { const x = BAR.x + 14 + i * ((BAR.w - 28) / 43); L.line(ctx, x, BAR.y + BAR.h, x, BAR.y + BAR.h + (i % 5 === 0 ? 20 : 10), { color: PAL.lineGold, width: 1.6, seed: 851 + i, amp: 0.3, alpha: 0.85 }); }
      L.circle(ctx, BAR.x + 50, BAR.y + 42, 17, { color: PAL.line, width: 3.5, seed: 896 }); L.line(ctx, BAR.x + 62, BAR.y + 55, BAR.x + 76, BAR.y + 70, { color: PAL.line, width: 4, seed: 897 });
      L.bracket(ctx, 1010, 420, 1010, 1320, { color: PAL.lineGold, width: 1.8, ticks: 30, tick: 10, seed: 898, alpha: 0.7 });
    },
    text(ctx, t, T) {
      const qs = Q();
      // the field: placeholder, or the query typing in on 32nds
      let cur = null; for (const q of qs) if (t >= q.a) cur = q;
      const xr = BAR.x + BAR.w - 36, yb = BAR.y + 58;
      if (!cur) L.txt(ctx, PH, xr, yb, { size: 31, weight: 400, align: 'right', color: PAL.lineGold, alpha: 0.75 });
      else {
        const n = Array.from(cur.text).length, steps = Math.floor((t - cur.a) / 0.0625 + 1e-6) + 1, k = Math.min(n, Math.ceil((steps / 4) * n));
        const s = L.typed(cur.text, k);
        L.txt(ctx, s, xr, yb + 2, { size: 40, weight: 600, align: 'right', color: PAL.line, dir: 'rtl' });
        const w = L.measure(ctx, s, { size: 40, weight: 600 });
        if (Math.floor(t * 4) % 2 === 0 || k < n) { ctx.fillStyle = PAL.lineGold; ctx.fillRect(xr - w - 12, BAR.y + 22, 4, 48); }
      }
      // result chips, drawn as the product draws a result: {clause} · {tag}
      qs.forEach((q, i) => {
        const s = L.pop(t, q.hit + F(1)); if (s <= 0) return;
        const clause = 'البند ' + FILM.slot(FILM.CFG.CLAUSE), o = { size: 36, weight: 600 };
        const wc = L.measure(ctx, clause, o), wd = L.measure(ctx, ' · ', o), wt = L.measure(ctx, q.tag, { size: 34, weight: 500 }), tot = wc + wd + wt;
        let x = chipX + tot / 2 - 8; const y = q.cy + 13;
        ctx.save(); ctx.translate(chipX, q.cy); ctx.scale(s, s); ctx.translate(-chipX, -q.cy);
        L.txt(ctx, clause, x, y, { ...o, align: 'right', dir: 'rtl', color: PAL.line }); x -= wc;
        L.txt(ctx, ' · ', x, y, { ...o, align: 'right', dir: 'rtl', color: PAL.lineGold }); x -= wd;
        L.txt(ctx, q.tag, x, y, { size: 34, weight: 500, align: 'right', dir: 'rtl', color: PAL.lineGold });
        ctx.restore();
      });
    },
  });
})();
