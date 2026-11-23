// 16 proof, T 34.0 to 36.5, SCH. Three proof marks, right to left: {N}, the language pair, the citation bracket.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, F, rnd, rs } = L;
  const SHELF_Y = 1180, MX = [790, 500, 212], MT = [0.5, 1.25, 2.0], MY = 590;
  function shelf(N) {
    const raw = []; let sum = 0; for (let i = 0; i < N; i++) { const w = 1 + rs('sh', i) * 0.22; raw.push(w); sum += w; }
    const out = []; let x = 900;
    for (let i = 0; i < N; i++) { const w = (raw[i] / sum) * 790, h = 250 + rnd('sh', i, 2) * 110; x -= w; out.push({ i, x, w, h, y: SHELF_Y - h }); }
    return out;
  }
  function burst(ctx, x, y, t, t0, r) {                            // the `change` flash: 12 frames at most
    const f = L.flash(t, t0); if (f <= 0) return;
    L.circle(ctx, x, y, r * (1.05 + (1 - f) * 0.35), { color: PAL.change, width: 6, alpha: f, seed: 1900 + t0 * 10, n: 44 });
    for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283, r0 = r * (1.2 + (1 - f) * 0.4); L.line(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * (r0 + 30), y + Math.sin(a) * (r0 + 30), { color: PAL.change, width: 3.5, alpha: f, seed: 1910 + i }); }
  }
  FILM.defShot('proof', {
    draw(ctx, t, T) {
      const N = FILM.CFG.N, books = shelf(N);
      L.blueprintPlate(ctx, { cy: 900, r: 660 });
      // the shelf: spine outlines trace in right to left on 16ths
      L.line(ctx, 50, SHELF_Y, 1030, SHELF_Y, { color: PAL.line, width: 4.5, alpha: 0.85, double: true, seed: 1920 });
      L.line(ctx, 50, SHELF_Y + 22, 1030, SHELF_Y + 22, { color: PAL.lineGold, width: 2, alpha: 0.6, seed: 1921 });
      L.hatch(ctx, [50, SHELF_Y, 980, 22], { gap: 8, color: PAL.lineGold, width: 1.3, alpha: 0.5, seed: 1922 });
      for (const sx of [110, 890]) { L.line(ctx, sx, SHELF_Y + 22, sx - 34, SHELF_Y + 110, { color: PAL.lineGold, width: 2.5, alpha: 0.7, seed: 1923 + sx }); L.line(ctx, sx, SHELF_Y + 22, sx, SHELF_Y + 110, { color: PAL.lineGold, width: 2.5, alpha: 0.7, seed: 1924 + sx }); }
      for (const b of books) {
        const t0 = Math.floor((b.i / N) * 7) * 0.0625 - 0.125, k = L.drawOn(t, t0);
        if (k <= 0) continue;
        const y = lerp(SHELF_Y, b.y, k), s = 1930 + b.i * 9;
        L.rect(ctx, b.x + 2, y, b.w - 4, SHELF_Y - y, { fill: PAL.bpLight, color: PAL.line, width: 2.6, alpha: 0.85, seed: s });
        if (k < 0.98) continue;
        if (b.i % 3 === 0) L.hatch(ctx, [b.x + 2, b.y, b.w - 4, b.h], { gap: 8, color: PAL.lineGold, width: 1.1, alpha: 0.45, seed: s + 1 });
        else if (b.i % 3 === 1) L.stipple(ctx, b.x + 5, b.y + 5, b.w - 10, b.h - 10, 26, { color: PAL.lineGold, r: 1.2, alpha: 0.6, seed: s + 2 });
        L.line(ctx, b.x + 3, b.y + 26, b.x + b.w - 3, b.y + 26, { color: PAL.line, width: 1.8, alpha: 0.8, seed: s + 3, amp: 0.5 });
        L.line(ctx, b.x + 3, SHELF_Y - 30, b.x + b.w - 3, SHELF_Y - 30, { color: PAL.line, width: 1.8, alpha: 0.8, seed: s + 4, amp: 0.5 });
        // T 35.25: every spine shows its two editions (a divider and two marks)
        if (t >= 1.25) { const my = b.y + b.h * 0.5; L.line(ctx, b.x + 3, my, b.x + b.w - 3, my, { color: PAL.lineGold, width: 2.2, seed: s + 5, amp: 0.5 }); L.circle(ctx, b.x + b.w / 2, my - 34, 5, { color: PAL.lineGold, width: 2, seed: s + 6, n: 8 }); L.rect(ctx, b.x + b.w / 2 - 5, my + 28, 10, 10, { color: PAL.lineGold, width: 2, seed: s + 7 }); }
        // T 36.0: every spine carries a reference tag
        if (t >= 2.0) { L.rect(ctx, b.x + b.w / 2 - 8, b.y - 26, 16, 20, { fill: PAL.lineGold, color: PAL.line, width: 1.8, seed: s + 8 }); L.line(ctx, b.x + b.w / 2, b.y - 6, b.x + b.w / 2, b.y, { color: PAL.line, width: 1.8, seed: s + 9 }); }
      }
      // measuring the whole shelf
      const bk = L.drawOn(t, 0.25, 8);
      L.bracket(ctx, 110, SHELF_Y + 70, 900, SHELF_Y + 70, { k: bk, color: PAL.line, width: 2.6, tick: 14, ticks: N, alpha: 0.85, seed: 1990 });
      // guides from each mark down to the shelf, and the mark frames
      for (let m = 0; m < 3; m++) {
        const k = L.drawOn(t, MT[m]); if (k <= 0) continue;
        L.line(ctx, MX[m], MY + 150, MX[m], lerp(MY + 150, SHELF_Y - 380, k), { color: PAL.lineGold, width: 1.6, alpha: 0.6, dash: [8, 10], seed: 2000 + m });
        L.glowDot(ctx, MX[m], SHELF_Y - 384, 5, { alpha: k, ticks: 8 });
        L.circle(ctx, MX[m], MY - 10, 148, { color: PAL.lineGold, width: 1.4, alpha: 0.35 * k, dash: [6, 10], seed: 2010 + m, n: 44 });
      }
      // language pair: two rings (T 35.25)
      const lk = L.pop(t, MT[1]);
      if (lk > 0) {
        L.circle(ctx, MX[1] + 58, MY - 20, 76 * lk, { fill: PAL.bpLight, color: PAL.line, width: 4, alpha: 0.9, double: true, seed: 2020, n: 36 });
        L.circle(ctx, MX[1] - 58, MY - 20, 76 * lk, { fill: PAL.bpLight, color: PAL.line, width: 4, alpha: 0.9, double: true, seed: 2021, n: 36 });
        L.stipple(ctx, MX[1] - 30, MY - 70, 60, 100, 30, { color: PAL.lineGold, r: 1.3, alpha: 0.7, seed: 2022 });
      }
      // citation bracket around a quote (T 36.0)
      const ck = L.pop(t, MT[2]);
      if (ck > 0) {
        const x0 = MX[2] - 112, x1 = MX[2] + 112, y0 = MY - 96, y1 = MY + 6;
        L.ink(ctx, [[x0 + 26, y0], [x0, y0], [x0, y1], [x0 + 26, y1]], { color: PAL.line, width: 5, seed: 2030 });
        L.ink(ctx, [[x1 - 26, y0], [x1, y0], [x1, y1], [x1 - 26, y1]], { color: PAL.line, width: 5, seed: 2031 });
        L.scribble(ctx, x1 - 24, y0 + 28, 176, { lines: 3, gap: 24, width: 3, word: 30, color: PAL.line, seed: 2032 });
        L.arrow(ctx, MX[2], y1 + 10, MX[2], y1 + 34, { color: PAL.lineGold, width: 2.5, head: 10, seed: 2033 });
      }
      for (let m = 0; m < 3; m++) burst(ctx, MX[m], MY - 20, t, MT[m], 150);
    },
    text(ctx, t, T) {
      const N = FILM.CFG.N, lab = { size: 30, weight: 600, color: PAL.lineGold };
      const nk = L.pop(t, MT[0]);
      if (nk > 0) {
        ctx.save(); ctx.translate(MX[0], MY); ctx.scale(nk, nk); ctx.translate(-MX[0], -MY);
        L.bigNumber(ctx, String(N), MX[0], MY + 56, 210, 1, { color: PAL.line, hatch: PAL.brand300, strokeW: 4 });
        ctx.restore();
        L.txt(ctx, 'كتاب', MX[0], MY + 150, { ...lab, size: 38 });
      }
      const lk = L.pop(t, MT[1]);
      if (lk > 0) {
        L.txt(ctx, 'ع', MX[1] + 58, MY + 4, { size: 84, weight: 700, color: PAL.line, scale: lk });
        L.txt(ctx, 'EN', MX[1] - 58, MY + 4, { size: 60, weight: 600, color: PAL.line, scale: lk });
        L.txt(ctx, 'عربي وإنجليزي', MX[1], MY + 150, lab);
      }
      const ck = L.pop(t, MT[2]);
      if (ck > 0) {
        L.clauseTag(ctx, MX[2], MY + 68, { size: 26, scale: ck, fill: PAL.lineGold, outline: PAL.line });
        L.txt(ctx, 'كل إجابة بمرجع', MX[2], MY + 150, lab);
      }
    },
  });
})();
