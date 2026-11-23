// 11 verbatim-match, T 20.0 to 22.5, SCH. The answer's quote above, the book's line (G3) below, joined word by word.
(function () {
  const L = FILM.lib, PAL = L.PAL;
  const { rnd, lerp } = L;
  const X1 = 160, X2 = 840, TOPB = 620, BOTB = 820;
  // word boxes, right to left: real quote if confirmed, else identical seeded word bars (no invented text)
  function words(ctx) {
    const q = FILM.CFG.QUOTE;
    if (q) {
      let size = 44; while (size > 24 && L.measure(ctx, q, { size, weight: 600 }) > X2 - X1) size -= 2;
      return { size, list: L.wordBoxes(ctx, q, X2, { size, weight: 600 }) };
    }
    const list = []; let x = X2, i = 0;
    while (x > X1 + 40) { const w = Math.min(64 + rnd('vw', i) * 80, x - X1); list.push({ word: null, x, w }); x -= w + 26; i++; }
    return { size: 40, list };
  }
  FILM.defShot('verbatim-match', {
    draw(ctx, t, T) {
      L.blueprintPlate(ctx, { cx: 500, cy: 730, r: 560 });
      const W = words(ctx), n = W.list.length, at = (i) => 20.25 + (i * 1.5) / Math.max(1, n - 1), locked = T >= 22.0;
      // context: dim rows of the page and of the answer around the two lines
      for (const [y0, rows, seed] of [[330, 5, 600], [1010, 7, 620]]) for (let r = 0; r < rows; r++) L.scribble(ctx, X2, y0 + r * 44, X2 - X1, { lines: 1, color: PAL.lineGold, width: 2.4, alpha: 0.32, seed: seed + r, word: 40 });
      // two panels, stippled
      for (const [by, seed] of [[TOPB, 630], [BOTB, 640]]) {
        L.rect(ctx, X1 - 24, by - 70, X2 - X1 + 48, 104, { fill: PAL.bpLight, color: PAL.line, width: 2.5, alpha: 0.9, seed });
        L.stipple(ctx, X1 - 20, by - 66, X2 - X1 + 40, 96, 220, { color: PAL.lineGold, r: 1.1, alpha: 0.35, seed: seed + 1 });
      }
      L.bracket(ctx, X1 - 24, BOTB + 44, X2 + 24, BOTB + 44, { color: PAL.lineGold, width: 1.5, tick: 8, ticks: 30, alpha: 0.6, seed: 650 });
      // word bars when there is no confirmed quote
      W.list.forEach((b, i) => {
        const lit = T >= at(i), col = lit ? PAL.glow : PAL.line;
        if (!b.word) for (const by of [TOPB, BOTB]) L.rrect(ctx, b.x - b.w, by - 40, b.w, 42, 11, { fill: col, color: col, width: 1.5, alpha: lit ? 1 : 0.7, seed: 660 + i + by });
        // the tick joining this word in both lines
        const k = L.drawOn(T, at(i), 4), cx = b.x - b.w / 2;
        if (k > 0) {
          L.lineTo(ctx, cx, TOPB + 34, cx, BOTB - 70, k, { color: PAL.glow, width: 4, seed: 680 + i });
          if (k >= 1) { L.glowDot(ctx, cx, TOPB + 34, 5, { ticks: 6 }); L.glowDot(ctx, cx, BOTB - 70, 5, { ticks: 6 }); }
          L.rect(ctx, b.x - b.w - 7, BOTB - 50, b.w + 14, 62, { color: PAL.lineGold, width: 1.5, alpha: 0.7, seed: 700 + i, dash: [6, 6] });
          L.rect(ctx, b.x - b.w - 7, TOPB - 50, b.w + 14, 62, { color: PAL.lineGold, width: 1.5, alpha: 0.7, seed: 720 + i, dash: [6, 6] });
        }
      });
      // running count ticks under the lower line
      const done = W.list.filter((_, i) => T >= at(i)).length;
      for (let i = 0; i < n; i++) L.line(ctx, X2 - i * 26, BOTB + 76, X2 - i * 26, BOTB + 104, { color: i < done ? PAL.glow : PAL.bpGrid, width: 4, seed: 740 + i });
      // the lock on T 22.0: a short gold bar across the right ends of both lines, with one `change` flash
      if (locked) {
        const p = L.pop(T, 22.0);
        L.rrect(ctx, X2 + 36, lerp(730, TOPB - 74, p), 24, (BOTB + 38 - (TOPB - 74)) * p, 8, { fill: PAL.lineGold, color: PAL.line, width: 2.5, seed: 760 });
        L.line(ctx, X2 + 24, TOPB - 16, X2 + 36, TOPB - 16, { color: PAL.line, width: 3, seed: 761 }); L.line(ctx, X2 + 24, BOTB - 16, X2 + 36, BOTB - 16, { color: PAL.line, width: 3, seed: 762 });
        const fl = L.flash(T, 22.0);
        if (fl > 0) { for (const by of [TOPB, BOTB]) L.rect(ctx, X1 - 32, by - 78, X2 - X1 + 64, 120, { color: PAL.change, width: 6, alpha: fl, seed: 770 + by }); L.ripples(ctx, X2 + 47, 730, T, 22.0, { color: PAL.change, n: 2, r: 300, dur: 0.5 }); }
      }
    },
    text(ctx, t, T) {
      L.txt(ctx, 'اسأل الكتاب', X2 + 24, TOPB - 92, { size: 34, weight: 600, align: 'right', color: PAL.lineGold });
      L.txt(ctx, 'الصفحة الأصلية من الكتاب', X2 + 24, BOTB + 170, { size: 34, weight: 600, align: 'right', color: PAL.lineGold });
      const W = words(ctx), n = W.list.length;
      if (FILM.CFG.QUOTE) W.list.forEach((b, i) => { const lit = T >= 20.25 + (i * 1.5) / Math.max(1, n - 1); for (const by of [TOPB, BOTB]) L.txt(ctx, b.word, b.x, by - 6, { size: W.size, weight: 600, align: 'right', dir: 'rtl', color: lit ? PAL.glow : PAL.line }); });
    },
  });
})();
