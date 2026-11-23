// 02 page-storm, T 2.5 to 4.0, SCH. Also defines the shared page lattice (G4), reused by shot 07.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, rs, rnd, F, hash } = L;
  // G4: region x 80..1000, y 300..1320, cells 18 x 24 with 6 px gutters
  const LAT = O.LAT = { x: 87, y: 303, cw: 18, ch: 24, px: 24, py: 30, cols: 38, rows: 34 };
  O.latCell = (c, r) => [LAT.x + c * LAT.px, LAT.y + r * LAT.py];
  // opts: vis(c,r) -> scale 0..1, dx(c,r) -> px, rowFrom, wrap (wrap x inside the region), alpha
  O.lattice = (ctx, o = {}) => {
    const bf = FILM.bf, cells = [];
    for (let r = o.rowFrom || 0; r < LAT.rows; r++) for (let c = 0; c < LAT.cols; c++) {
      const s = o.vis ? o.vis(c, r) : 1; if (s <= 0) continue;
      let x = LAT.x + c * LAT.px + (o.dx ? o.dx(c, r) : 0);
      if (o.wrap) { const span = LAT.cols * LAT.px; x = ((((x - LAT.x) % span) + span) % span) + LAT.x; }
      cells.push([x + rs('lc', c, r, bf) * 0.6, LAT.y + r * LAT.py + rs('lc', r, c, bf, 2) * 0.6, Math.min(1.12, s), c, r]);
    }
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = PAL.bpLight; ctx.beginPath();
    for (const [x, y, s] of cells) { const w = LAT.cw * s, h = LAT.ch * s; ctx.rect(x + (LAT.cw - w) / 2, y + (LAT.ch - h) / 2, w, h); }
    ctx.fill();
    ctx.strokeStyle = PAL.lineGold; ctx.lineWidth = 1.3; ctx.globalAlpha *= 0.8; ctx.stroke();
    ctx.strokeStyle = PAL.line; ctx.lineWidth = 1.1; ctx.globalAlpha *= 0.6; ctx.beginPath();     // tiny text lines in every page
    for (const [x, y, s, c, r] of cells) {
      if (s < 0.9) continue;
      for (let l = 0; l < 4; l++) { const w = 6 + (hash(c, r, l) % 8); ctx.moveTo(x + LAT.cw - 3, y + 5 + l * 5); ctx.lineTo(x + LAT.cw - 3 - w, y + 5 + l * 5); }
    }
    ctx.stroke(); ctx.restore();
  };
  // one highlighted cell. fill colour + alpha, then a bright outline
  O.latLight = (ctx, c, r, o = {}) => {
    const [x, y] = O.latCell(c, r), g = o.grow ?? 3;
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.fillStyle = o.fill || PAL.lineGold; ctx.fillRect(x - g + (o.dx || 0), y - g, LAT.cw + g * 2, LAT.ch + g * 2); ctx.restore();
    L.rect(ctx, x - g + (o.dx || 0), y - g, LAT.cw + g * 2, LAT.ch + g * 2, { color: o.color || PAL.line, width: 2, seed: hash('ll', c, r), amp: 0.5, alpha: o.lineAlpha ?? 1 });
  };

  const HIT = [27, 9];
  FILM.defShot('page-storm', {
    draw(ctx, t, T) {
      L.blueprintPlate(ctx, { cx: 400, cy: 840, r: 620 });
      const books = O.tower(), t2 = L.onTwos(t);
      // the tower's outline in line, fading as its pages burst out
      const ta = t < 0.125 ? 0.9 : 0.9 - 0.74 * prog(t, 0.125, 0.75);
      for (const b of books) L.rect(ctx, b.x, b.y, b.w, b.h, { color: b.hero ? PAL.lineGold : PAL.line, width: 2.2, alpha: ta, seed: b.seed });
      L.line(ctx, 60, O.DESK_Y, 1020, O.DESK_Y, { color: PAL.line, width: 2, alpha: ta, seed: 201 });
      // lattice fills from the centre (the tower's heart) outward in rings on 16ths
      const cc = 13, cr = 17, maxR = 25;
      const born = (c, r) => 0.125 + Math.floor((Math.max(Math.abs(c - cc), Math.abs(r - cr) * 0.8) / maxR) * 7 + rnd('pb', c, r) * 0.9) * 0.125;
      O.lattice(ctx, { vis: (c, r) => L.pop(t, born(c, r), 3) });
      // burst strokes on each ring
      for (let k = 0; k < 8; k++) {
        const a = prog(t, 0.125 + k * 0.125, 0.125); if (a <= 0 || a >= 1) continue;
        for (let j = 0; j < 14; j++) { const an = (j / 14) * 6.2832 + k * 0.4, r0 = 60 + k * 62 + a * 60; L.line(ctx, 400 + Math.cos(an) * r0, 810 + Math.sin(an) * r0 * 1.1, 400 + Math.cos(an) * (r0 + 46), 810 + Math.sin(an) * (r0 + 46) * 1.1, { color: PAL.line, width: 2, alpha: 0.8 * (1 - a), seed: 210 + j + k * 20 }); }
      }
      // a bracket at the right edge measures the whole lattice, and one along the bottom runs off the frame: too big to hold
      const bk = L.drawOn(t, 0.5, 6);
      L.bracket(ctx, 1034, 300, 1034, 1320, { color: PAL.line, width: 2.5, k: bk, ticks: 34, tick: 14, seed: 220, alpha: 0.9 });
      L.bracket(ctx, 80, 1344, 1180, 1344, { color: PAL.lineGold, width: 2, k: L.drawOn(t, 0.75, 6), ticks: 46, tick: 10, seed: 221, alpha: 0.8 });
      for (let i = 0; i < 3; i++) L.arrow(ctx, 1034, 300 - i * 2, 1034, 250 - i * 14, { color: PAL.line, width: 2, k: bk, seed: 222 + i, alpha: 0.6, head: i === 2 ? 12 : 0 });
      // one cell: the `change` flash on T 3.5
      if (t >= 1.0) {
        const f = L.flash(t, 1.0, 12);
        O.latLight(ctx, HIT[0], HIT[1], { fill: f > 0 ? PAL.change : PAL.bpLight, alpha: f > 0 ? f : 1, color: PAL.line, grow: 4 });
        const [x, y] = O.latCell(HIT[0], HIT[1]);
        if (f > 0) { L.glowDot(ctx, x + 9, y + 12, 7, { color: PAL.change, alpha: f, rot: t2 * 3 }); L.ring(ctx, x + 9, y + 12, 60, { color: PAL.change, scale: 0.4 + (1 - f) * 1.2, alpha: f, width: 3, seed: 230 }); }
        L.ring(ctx, x + 9, y + 12, 34, { color: PAL.lineGold, scale: L.pop(t, 1.0), width: 2, dash: [8, 8], seed: 231, alpha: 0.9 });
      }
    },
    text(ctx, t, T) {},
  });
})();
