// 13 links-web, T 25.5 to 28.0, SCH. The tangle of shot 05, now ordered: the clause and its labelled links.
(function () {
  const L = FILM.lib, PAL = L.PAL;
  const { prog, rs, rnd, lerp } = L;
  const C = [500, 800];
  const NODES = [
    { at: 25.75, x: 760, y: 560, label: () => 'الاستثناءات', icon: 'list' },
    { at: 26.25, x: 240, y: 560, label: () => 'الجدول ' + FILM.slot(FILM.CFG.TABLE_N), icon: 'table' },
    { at: 26.75, x: 240, y: 1040, label: () => 'الشكل ' + FILM.slot(FILM.CFG.FIGURE_N), icon: 'figure' },
    { at: 27.25, x: 760, y: 1040, label: () => 'مرتبط بهذا البند', icon: 'link' },
    { at: 27.5, x: 500, y: 1200, label: () => 'كتب مرتبطة', icon: 'book' },
  ];
  const drift = (T) => -26 * prog(T, 27.5, 0.5);                         // slight right-to-left drift as the web settles (24 fps)
  function icon(ctx, kind, x, y, s) {
    const o = { color: PAL.line, width: 2.5 };
    if (kind === 'list') { for (let i = 0; i < 3; i++) { L.line(ctx, x + 22, y - 16 + i * 16, x - 14, y - 16 + i * 16, { ...o, seed: s + i }); L.circle(ctx, x - 24, y - 16 + i * 16, 3, { fill: PAL.line, width: 0, seed: s + 5 + i }); } }
    else if (kind === 'table') { L.rect(ctx, x - 26, y - 20, 52, 40, { ...o, seed: s }); L.line(ctx, x - 26, y - 6, x + 26, y - 6, { ...o, width: 1.8, seed: s + 1 }); L.line(ctx, x - 26, y + 7, x + 26, y + 7, { ...o, width: 1.8, seed: s + 2 }); L.line(ctx, x - 8, y - 20, x - 8, y + 20, { ...o, width: 1.8, seed: s + 3 }); L.line(ctx, x + 9, y - 20, x + 9, y + 20, { ...o, width: 1.8, seed: s + 4 }); }
    else if (kind === 'figure') { L.poly(ctx, [[x - 26, y + 20], [x + 26, y + 20], [x + 26, y - 20]], { ...o, seed: s }); L.line(ctx, x - 26, y + 20, x - 26, y - 22, { ...o, width: 1.6, dash: [5, 5], seed: s + 1 }); L.arc(ctx, x - 26, y + 20, 22, -0.66, 0, { ...o, width: 1.6, seed: s + 2 }); }
    else if (kind === 'link') { L.ellipse(ctx, x - 12, y, 18, 11, { ...o, seed: s }); L.ellipse(ctx, x + 12, y, 18, 11, { ...o, seed: s + 1 }); }
    else { for (let i = 0; i < 3; i++) { L.rect(ctx, x - 28 + i * 20, y - 24 + (i === 1 ? 6 : 0), 16, 48 - (i === 1 ? 6 : 0), { ...o, seed: s + i, fill: i === 1 ? PAL.bpGrid : null }); L.line(ctx, x - 28 + i * 20, y - 10, x - 12 + i * 20, y - 10, { ...o, width: 1.5, seed: s + 4 + i }); } }
  }
  FILM.defShot('links-web', {
    draw(ctx, t, T) {
      L.blueprintPlate(ctx, { cx: C[0], cy: C[1], r: 560 });
      ctx.translate(drift(T), 0);
      // ghost of the shot 05 tangle, straightening out of the way in the first two beats
      const gh = 1 - prog(T, 25.5, 0.75);
      if (gh > 0) for (let i = 0; i < 14; i++) { const pts = [[C[0], C[1]]]; for (let j = 1; j < 5; j++) pts.push([C[0] + rs('tg', i, j) * 150 * j, C[1] + rs('tg', i, j, 2) * 170 * j]); L.ink(ctx, pts, { color: PAL.lineGold, width: 1.6, alpha: gh * 0.45, seed: 1400 + i }); }
      // orbit rings and radial ticks around the clause
      L.circle(ctx, C[0], C[1], 150, { color: PAL.line, width: 2, alpha: 0.6, seed: 1420, n: 44 });
      L.circle(ctx, C[0], C[1], 174, { color: PAL.lineGold, width: 1.5, alpha: 0.5, dash: [4, 10], seed: 1421, n: 44 });
      for (let i = 0; i < 36; i++) { const a = (i / 36) * 6.2832; L.line(ctx, C[0] + Math.cos(a) * 186, C[1] + Math.sin(a) * 186, C[0] + Math.cos(a) * (i % 3 ? 196 : 208), C[1] + Math.sin(a) * (i % 3 ? 196 : 208), { color: PAL.lineGold, width: 1.4, alpha: 0.6, seed: 1430 + i, amp: 0.4 }); }
      L.rrect(ctx, C[0] - 128, C[1] - 52, 256, 104, 22, { fill: PAL.bpLight, color: PAL.line, width: 3.5, double: true, seed: 1470 });
      L.stipple(ctx, C[0] - 120, C[1] - 46, 240, 92, 120, { color: PAL.lineGold, r: 1.1, alpha: 0.45, seed: 1471 });
      // the links: straight, clean, one elbow each
      NODES.forEach((n, i) => {
        const k = L.drawOn(T, n.at); if (k <= 0) return;
        const sx = n.x === C[0] ? C[0] : C[0] + Math.sign(n.x - C[0]) * 128, sy = n.x === C[0] ? C[1] + 52 : C[1] + Math.sign(n.y - C[1]) * 26;
        const ex = n.x, ey = n.x === C[0] ? n.y - 62 : n.y + (n.y < C[1] ? 62 : -62);
        const mid = n.x === C[0] ? [sx, ey] : [ex, sy], l1 = Math.hypot(mid[0] - sx, mid[1] - sy), l2 = Math.hypot(ex - mid[0], ey - mid[1]), d = k * (l1 + l2);
        const st = { color: PAL.line, width: 3.2, alpha: 0.9, seed: 1480 + i };
        L.lineTo(ctx, sx, sy, mid[0], mid[1], Math.min(1, d / Math.max(1, l1)), st);
        if (d > l1 && l2 > 0) L.lineTo(ctx, mid[0], mid[1], ex, ey, (d - l1) / l2, { ...st, seed: 1490 + i });
        L.glowDot(ctx, sx, sy, 4, { ticks: 0 });
        const p = L.pop(T, n.at + L.F(3)); if (p <= 0) return;
        L.circle(ctx, n.x, n.y, 62 * p, { fill: PAL.bpLight, color: PAL.line, width: 3.5, double: true, seed: 1500 + i, n: 30 });
        L.circle(ctx, n.x, n.y, 76 * p, { color: PAL.lineGold, width: 1.4, alpha: 0.6, dash: [6, 8], seed: 1510 + i, n: 30 });
        icon(ctx, n.icon, n.x, n.y, 1520 + i * 10);
        L.glowDot(ctx, ex, ey, 5, { ticks: 6 });
        L.ripples(ctx, n.x, n.y, T, n.at + L.F(3), { color: PAL.lineGold, n: 1, r: 150, dur: 0.375, width: 2 });
        // small satellites: the link's own content, stippled
        for (let j = 0; j < 3; j++) { const sx2 = n.x + (n.x < C[0] ? -1 : 1) * (n.x === C[0] ? (j - 1) * 150 : 20 + j * 0) + (n.x === C[0] ? 0 : 0), sy2 = n.y + (n.x === C[0] ? 0 : (j - 1) * 0); if (n.x === C[0] && j !== 1) { L.line(ctx, n.x + (j - 1) * 76, n.y, sx2, sy2, { color: PAL.lineGold, width: 1.5, alpha: 0.6, seed: 1560 + i * 3 + j }); L.rect(ctx, sx2 - 16 + (j - 1) * 16, sy2 - 22, 32, 44, { color: PAL.lineGold, width: 1.6, alpha: 0.7, seed: 1570 + j }); } }
      });
      // resolved on T 27.5: a calm outer frame (lineGold, not `change`)
      const fk = L.drawOn(T, 27.5);
      if (fk > 0) { L.bracket(ctx, 110, 430, 890, 430, { color: PAL.lineGold, width: 1.6, tick: 10, ticks: 26, k: fk, alpha: 0.8, seed: 1590 }); L.bracket(ctx, 96, 470, 96, 1130, { color: PAL.lineGold, width: 1.6, tick: 10, ticks: 22, k: fk, alpha: 0.8, seed: 1591 }); }
    },
    text(ctx, t, T) {
      ctx.translate(drift(T), 0);
      L.clauseTag(ctx, C[0], C[1], { size: 36, outline: PAL.bpDeep, padX: 28 });
      NODES.forEach((n) => {
        const p = L.pop(T, n.at + L.F(3)); if (p <= 0) return;
        const up = n.y < C[1];
        L.chip(ctx, n.label(), n.x, n.y + (up ? -112 : 112), { size: 32, weight: 600, fill: PAL.bp, color: PAL.line, outline: PAL.lineGold, outlineW: 2, scale: p, h: 60, padX: 22 });
      });
    },
  });
})();
