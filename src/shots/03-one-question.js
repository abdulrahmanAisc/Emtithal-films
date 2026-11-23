// 03 one-question, T 4.0 to 5.0, ILL. The desk again; one tiny note in front of the tower.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, F } = L;
  const NX = 770, NY = 1222, NS = 76;
  FILM.defShot('one-question', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t), books = O.tower();
      O.desk(ctx, { stripe: PAL.stripeSand });
      const sh = [[230, O.DESK_Y], [610, O.DESK_Y], [610 + 840 * 0.42, O.DESK_Y + 60], [330 + 840 * 0.3, O.DESK_Y + 74]];
      L.hatch(ctx, sh, { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.75, seed: 140 });
      L.hatch(ctx, sh, { gap: 8, angle: 105, color: PAL.deskDeep, width: 1.4, seed: 141 });
      for (const b of books) O.book(ctx, b);
      O.lamp(ctx);
      // overlay: the tower's height against the note's (absurd scale)
      const bk = L.drawOn(t, 0.25, 6);
      L.bracket(ctx, 132, O.DESK_Y, 132, 420, { color: PAL.ovInk, width: 3, tick: 18, ticks: 28, seed: 160 });
      L.bracket(ctx, 676, O.DESK_Y, 676, 420, { color: PAL.ovInk, width: 3.5, tick: 18, k: bk, seed: 301 });
      L.bracket(ctx, NX + 74, NY + NS / 2, NX + 74, NY - NS / 2, { color: PAL.ovInk, width: 3.5, tick: 12, k: bk, seed: 302 });
      L.line(ctx, 676, 420, NX + 74, NY - NS / 2, { color: PAL.ovSlate, width: 1.6, dash: [12, 10], alpha: 0.8 * bk, seed: 303 });
      L.line(ctx, 676, O.DESK_Y, NX + 74, NY + NS / 2, { color: PAL.ovSlate, width: 1.6, dash: [12, 10], alpha: 0.8 * bk, seed: 304 });
      // the note is set down on T 4.25, then flutters once on twos
      const down = t2 >= 0.25, k = ease.outCubic(prog(t2, 0, 0.25));
      const ny = down ? NY : lerp(NY - 150, NY, k), nx = down ? NX : lerp(NX + 90, NX, k);
      const fl = down ? Math.max(0, 1 - (t2 - 0.25) / F(6)) * (Math.floor((t2 - 0.25) * 12) % 2 ? 0.4 : 1) : 0.5;
      if (down) L.hatch(ctx, [[NX - 40, NY + 36], [NX + 52, NY + 36], [NX + 70, NY + 52], [NX - 26, NY + 54]], { gap: 5, color: PAL.ink, width: 1.5, seed: 305 });
      O.note(ctx, nx, ny, NS, { rot: down ? -0.08 : -0.08 - (1 - k) * 0.3, flutter: fl });
      // the hand (white thobe cuff) sets it down and withdraws to the right
      const out = down ? ease.outCubic(prog(t2, 0.33, 0.42)) : 0;
      O.hand(ctx, nx + 30 + out * 260, ny - 22 - out * 40, { from: 12 + out * 6, cuff: 'thobe', scale: 0.62, press: down && t2 < 0.34 ? 1 : 0 });
      // ovGold ring around the note
      const rp = L.pop(t, 0.25);
      if (rp > 0) { L.ring(ctx, NX, NY, 78, { scale: rp, width: 5, seed: 310 }); L.ring(ctx, NX, NY, 96, { scale: rp, width: 2, dash: [14, 10], seed: 311 }); }
      L.ripples(ctx, NX, NY, t, 0.25, { n: 2, r: 150, dur: 0.5, width: 3 });
    },
    text(ctx, t, T) {},
  });
})();
