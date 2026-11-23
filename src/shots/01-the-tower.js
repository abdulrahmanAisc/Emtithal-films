// 01 the-tower, T 0.0 to 2.5, ILL, hook. Landings are drawn at 24 fps (on-twos waived for this shot only).
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd, F } = L;
  const landT = (i, N) => 0.0625 + (i * (1.5 - 0.0625)) / (N - 1);
  FILM.defShot('the-tower', {
    draw(ctx, t, T) {
      const N = FILM.CFG.N, books = O.tower(N);
      O.desk(ctx, { stripe: PAL.stripeSand });
      // cast shadow of the tower on the desk, hatched (light from upper left)
      const landed = books.filter((b) => t >= landT(b.i, N)).length, topY = landed ? books[landed - 1].y : O.DESK_Y;
      if (landed) {
        const sh = [[230, O.DESK_Y], [610, O.DESK_Y], [610 + (O.DESK_Y - topY) * 0.42, O.DESK_Y + 60], [330 + (O.DESK_Y - topY) * 0.3, O.DESK_Y + 74]];
        L.hatch(ctx, sh, { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.75, seed: 140 });
        L.hatch(ctx, sh, { gap: 8, angle: 105, color: PAL.deskDeep, width: 1.4, seed: 141 });
      }
      // sway once on T 1.5, settled by T 2.0
      const k = prog(t, 1.5, 0.5), sway = k > 0 && k < 1 ? Math.sin(k * Math.PI * 2) * (1 - k) * (1 - k) * 34 : 0;
      for (const b of books) {
        const lt = landT(b.i, N), p = (t - (lt - 0.22)) / 0.22;
        if (p < 0) continue;
        const hf = (O.DESK_Y - b.y) / (O.DESK_Y - 420);
        if (p < 1) O.book(ctx, b, { dy: -(1 - p * p) * 1000, rot: (1 - p) * rs('fall', b.i) * 0.16, dx: (1 - p) * rs('fall', b.i, 2) * 40 });
        else O.book(ctx, b, { dy: t - lt < F(2) ? 5 : 0, dx: sway * Math.pow(hf, 1.6), rot: sway * hf * 0.0012 });
      }
      // impact marks at the newest landing
      for (const b of books) {
        const a = t - landT(b.i, N);
        if (a >= 0 && a < F(3)) for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) { const x0 = b.x + (sx > 0 ? b.w : 0) + sx * (10 + a * 200), y0 = b.y + b.h - j * 9; L.line(ctx, x0, y0, x0 + sx * (18 + j * 8), y0 - 6 + j * 5, { color: PAL.ink, width: 2.5, seed: 150 + j + b.i }); }
      }
      O.lamp(ctx);
      // overlay: ovInk ruler up the tower's left side, ticks climbing with the stack
      const rk = (O.DESK_Y - topY) / (O.DESK_Y - 420);
      if (rk > 0) {
        const ry = lerp(O.DESK_Y, 420, rk);
        L.bracket(ctx, 132, O.DESK_Y, 132, ry, { color: PAL.ovInk, width: 3, tick: 18, ticks: Math.max(2, Math.round(rk * 28)), seed: 160 });
        L.line(ctx, 114, ry, 640, ry, { color: PAL.ovSlate, width: 1.5, alpha: 0.7, dash: [10, 10], seed: 161 });
      }
      // paper-dust puff on T 1.5
      const d = prog(t, 1.5, 0.4);
      if (d > 0 && d < 1) for (let j = 0; j < 9; j++) { const a = -0.2 - (j / 8) * 2.7, r0 = 250 + ease.outCubic(d) * (70 + rnd('dust', j) * 60); L.arc(ctx, 400 + Math.cos(a) * r0, O.DESK_Y - 10 + Math.sin(a) * r0 * 0.22, 16 + rnd('dust', j, 2) * 14, a - 1, a + 1.2, { color: PAL.inkSoft, width: 2.5, alpha: 1 - d, seed: 170 + j }); }
      // ovGold ring pops around the number on T 1.5
      const rp = L.pop(t, 1.5);
      if (rp > 0) { L.ring(ctx, 790, 722, 196, { scale: rp, width: 5, seed: 180 }); L.ring(ctx, 790, 722, 214, { scale: rp, width: 2, seed: 181, dash: [16, 12] }); }
    },
    text(ctx, t, T) {
      const N = FILM.CFG.N;
      // label and number are on screen from frame 0 (G1; label set in two lines so it stays inside the safe area)
      L.txt(ctx, 'كود البناء', 790, 512, { size: 56, weight: 700 });
      L.txt(ctx, 'السعودي', 790, 584, { size: 56, weight: 700 });
      let landed = 0; for (let i = 0; i < N; i++) if (t >= landT(i, N)) landed++;
      L.bigNumber(ctx, String(N), 790, 816, 260, landed / N);
    },
  });
})();
