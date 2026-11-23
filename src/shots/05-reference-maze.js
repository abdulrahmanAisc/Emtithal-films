// 05 reference-maze, T 6.5 to 8.0, SCH. One clause, lines to other books, and from those to more: a tangle.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd, F } = L;
  const C = [520, 760];
  const BK = [[150, 380], [470, 330], [840, 400], [960, 640], [900, 930], [640, 1210], [330, 1260], [120, 1080], [100, 720], [700, 560], [300, 560], [330, 960]];
  // lines: [from, to] with -1 = the clause node. Traced one after another on 16ths (three per 16th).
  const LN = [];
  for (let i = 0; i < 9; i++) LN.push([-1, i]);
  for (let i = 0; i < 21; i++) { const a = L.hash('mz', i) % 12; let b = L.hash('mz', i, 2) % 12; if (b === a) b = (a + 5) % 12; LN.push([a, b]); }
  function bookGlyph(ctx, x, y, s, a, seed) {
    if (a <= 0) return;
    L.rect(ctx, x - 26 * s, y - 34 * s, 52 * s, 68 * s, { fill: PAL.bpLight, color: PAL.line, width: 2.4, alpha: a, seed });
    L.line(ctx, x + 16 * s, y - 34 * s, x + 16 * s, y + 34 * s, { color: PAL.lineGold, width: 2, alpha: a, seed: seed + 1 });
    L.scribble(ctx, x + 10 * s, y - 16 * s, 30 * s, { lines: 3, gap: 11 * s, color: PAL.line, width: 1.5, alpha: a * 0.8, seed: seed + 2, word: 12 });
  }
  function path(i) {
    const [a, b] = LN[i], p0 = a < 0 ? C : BK[a], p1 = BK[b];
    const mx = (p0[0] + p1[0]) / 2 + rs('mzm', i) * 190, my = (p0[1] + p1[1]) / 2 + rs('mzm', i, 2) * 190;
    const m2x = lerp(mx, p1[0], 0.5) + rs('mzm', i, 3) * 90, m2y = lerp(my, p1[1], 0.5) + rs('mzm', i, 4) * 90;
    return [p0, [mx, my], [m2x, m2y], p1];
  }
  function partial(pts, k) {
    const out = [pts[0]], segs = pts.length - 1, f = k * segs;
    for (let i = 0; i < segs; i++) { if (f >= i + 1) out.push(pts[i + 1]); else if (f > i) { out.push([lerp(pts[i][0], pts[i + 1][0], f - i), lerp(pts[i][1], pts[i + 1][1], f - i)]); break; } }
    return out;
  }
  FILM.defShot('reference-maze', {
    draw(ctx, t, T) {
      if (t >= 1.25) FILM.bf = Math.floor(7.75 * 12 + 1e-6);          // T 7.75: everything freezes
      const tt = Math.min(t, 1.25);
      L.blueprintPlate(ctx, { cx: C[0], cy: C[1], r: 600 });
      // faint lattice of rectangular cells behind: the code as data
      ctx.save(); ctx.strokeStyle = PAL.bpGrid; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let y = 300; y < 1330; y += 30) for (let x = 84; x < 1000; x += 24) if (L.hash('bgc', x, y) % 3) ctx.rect(x, y, 18, 24);
      ctx.stroke(); ctx.restore();
      const knot = L.flash(t, 1.25, 6);
      // the viewer's project: a small floor-plan glyph, isolated, connected to nothing
      const px = 850, py = 1210;
      L.circle(ctx, px, py, 108, { color: PAL.lineGold, width: 1.6, dash: [8, 10], alpha: 0.7, seed: 590, n: 36 });
      L.rect(ctx, px - 64, py - 50, 128, 100, { fill: PAL.bpLight, color: PAL.line, width: 3, seed: 591 });
      L.line(ctx, px - 10, py - 50, px - 10, py + 10, { color: PAL.line, width: 2.4, seed: 592 }); L.line(ctx, px - 64, py + 10, px + 20, py + 10, { color: PAL.line, width: 2.4, seed: 593 });
      L.line(ctx, px + 20, py + 10, px + 20, py + 50, { color: PAL.line, width: 2.4, seed: 594 });
      for (let i = 0; i < 4; i++) L.line(ctx, px + 28 + i * 9, py - 44, px + 28 + i * 9, py - 8, { color: PAL.lineGold, width: 1.6, seed: 595 + i });
      L.arc(ctx, px - 10, py + 10, 22, 0, 1.57, { color: PAL.lineGold, width: 1.6, seed: 599 });
      L.stipple(ctx, px - 60, py + 14, 76, 32, 26, { color: PAL.line, r: 1.2, alpha: 0.7, seed: 600 });
      // lines trace outward on 16ths, crossing and tangling; each ends in a tiny arrow with no label
      for (let i = 0; i < LN.length; i++) {
        const t0 = Math.floor(i / 3) * 0.125, k = ease.outCubic(prog(tt, t0, 0.125)); if (k <= 0) continue;
        const pts = partial(path(i), k), gold = knot > 0;
        L.ink(ctx, pts, { color: gold ? PAL.lineGold : i < 9 ? PAL.line : PAL.lineGold, width: gold ? 2.4 + knot * 2.5 : i < 9 ? 2.4 : 1.7, alpha: gold ? 1 : i < 9 ? 0.85 : 0.6, seed: 510 + i, amp: 1.1 });
        if (k >= 1) { const a = pts[pts.length - 2], b = pts[pts.length - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), ex = b[0] - Math.cos(an) * 44, ey = b[1] - Math.sin(an) * 44; L.arrow(ctx, ex - Math.cos(an) * 10, ey - Math.sin(an) * 10, ex, ey, { color: gold ? PAL.lineGold : PAL.line, width: 2.2, head: 13, seed: 540 + i }); }
      }
      // book glyphs appear when the first line reaches them
      BK.forEach((b, j) => { let first = 99; LN.forEach((l, i) => { if (l[1] === j) first = Math.min(first, Math.floor(i / 3) * 0.125 + 0.125); }); bookGlyph(ctx, b[0], b[1], 1, L.pop(tt, first - 0.0417, 3) > 0 ? 1 : 0, 560 + j * 5); });
      // the clause node at centre
      L.circle(ctx, C[0], C[1], 60, { fill: PAL.bpLight, color: PAL.line, width: 3, seed: 580, n: 30 });
      L.circle(ctx, C[0], C[1], 78, { color: PAL.lineGold, width: 1.5, dash: [6, 8], seed: 581, n: 30 });
      L.glowDot(ctx, C[0], C[1], 11, { rot: L.onTwos(tt) * 2, ticks: 10 });
      L.scribble(ctx, C[0] + 38, C[1] + 32, 76, { lines: 2, gap: 10, color: PAL.line, width: 1.6, seed: 583, word: 14 });
      if (knot > 0) { L.circle(ctx, C[0], C[1], 60 + (1 - knot) * 200, { color: PAL.lineGold, width: 4, alpha: knot, seed: 585, n: 40 }); }
    },
    text(ctx, t, T) {},
  });
})();
