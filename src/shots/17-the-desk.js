// 17 the-desk, T 36.5 to 37.5, ILL, loop. The tower is gone: one gold book, morning light, the lamp clicks off on T 37.0.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, F, rnd } = L;
  const BK = { x: 250, y: 850, w: 300, h: 410 };
  FILM.defShot('the-desk', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t), on = t < 0.5, day = on ? 0.75 : 1;
      O.desk(ctx, { stripe: PAL.stripeGold, lampOn: on, day });
      // morning light: a flat band from the window across the wall and desk (never a gradient)
      const band = [[256, 250], [256, 570], [1100, 1330], [1100, 820]];
      ctx.save(); ctx.globalAlpha = on ? 0.4 : 0.7; ctx.fillStyle = PAL.lampGlow; ctx.beginPath(); L.pathOf(ctx, band); ctx.fill(); ctx.restore();
      L.line(ctx, 256, 250, 1100, 820, { color: PAL.ovGold, width: 2, alpha: 0.7, dash: [16, 12], seed: 2100 });
      L.line(ctx, 256, 570, 1100, 1330, { color: PAL.ovGold, width: 2, alpha: 0.7, dash: [16, 12], seed: 2101 });
      // where the tower stood: a faint ghost outline and its old ruler
      L.rect(ctx, 180, 420, 440, 840, { color: PAL.inkFaint, width: 2, alpha: 0.6, dash: [12, 14], seed: 2110 });
      L.bracket(ctx, 132, O.DESK_Y, 132, 420, { color: PAL.ovInk, width: 2.5, tick: 16, ticks: 28, alpha: 0.45, seed: 2111 });
      // the one gold book, standing, cover to us (gentle settle on twos)
      const dy = -10 * (1 - ease.outCubic(prog(t2, 0, 0.25)));
      ctx.save(); ctx.translate(0, dy);
      const sh = [[BK.x + 20, O.DESK_Y], [BK.x + BK.w + 30, O.DESK_Y], [BK.x + BK.w + 250, O.DESK_Y + 62], [BK.x + 200, O.DESK_Y + 70]];
      L.hatch(ctx, sh, { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.7, seed: 2120 }); L.hatch(ctx, sh, { gap: 8, angle: 105, color: PAL.deskDeep, width: 1.4, seed: 2121 });
      const pg = [[BK.x + BK.w, BK.y], [BK.x + BK.w + 46, BK.y + 22], [BK.x + BK.w + 46, BK.y + BK.h - 6], [BK.x + BK.w, BK.y + BK.h]];
      L.poly(ctx, pg, { fill: PAL.paperShade, width: 4, seed: 2122 });
      for (let i = 1; i < 7; i++) L.line(ctx, BK.x + BK.w + i * 6.5, BK.y + i * 3 + 4, BK.x + BK.w + i * 6.5, BK.y + BK.h - i - 4, { color: PAL.inkSoft, width: 1.5, seed: 2123 + i, amp: 0.5 });
      L.rrect(ctx, BK.x, BK.y, BK.w, BK.h, 8, { fill: PAL.hero, width: 0 });
      L.hatch(ctx, [BK.x + BK.w * 0.64, BK.y, BK.w * 0.36, BK.h], { gap: 6, color: PAL.heroShade, width: 1.6, seed: 2131 });
      L.hatch(ctx, [BK.x, BK.y + BK.h * 0.7, BK.w, BK.h * 0.3], { gap: 6, color: PAL.heroShade, width: 1.5, seed: 2132 });
      L.hatch(ctx, [BK.x + BK.w * 0.82, BK.y + BK.h * 0.5, BK.w * 0.18, BK.h * 0.5], { gap: 6, angle: 105, color: PAL.heroDeep, width: 1.5, seed: 2133 });
      L.line(ctx, BK.x + 26, BK.y + 4, BK.x + 26, BK.y + BK.h - 4, { color: PAL.heroDeep, width: 3, seed: 2134 });
      L.rrect(ctx, BK.x + 50, BK.y + 44, BK.w - 84, BK.h - 88, 6, { color: PAL.heroDeep, width: 2.5, seed: 2135 });
      L.rrect(ctx, BK.x + 78, BK.y + 84, 144, 156, 16, { fill: PAL.brand100, color: PAL.ink, width: 3, seed: 2137 });      // plate for the mark
      L.scribble(ctx, BK.x + BK.w - 70, BK.y + 300, 150, { lines: 2, gap: 16, color: PAL.ink, width: 2.6, seed: 2138 });
      L.rrect(ctx, BK.x, BK.y, BK.w, BK.h, 8, { width: 5, double: true, seed: 2136 });
      ctx.restore();
      // the sticky note from shot 03, now carrying a gold clause tag (drawn in the crisp layer)
      O.note(ctx, 740, 1196, 150, { rot: -0.07, seed: 2140 });
      O.lamp(ctx, { on });
      // lamp click on T 37.0: small tick marks at the lamp head
      const ck = prog(t, 0.5, F(5));
      if (ck > 0 && ck < 1) for (let i = 0; i < 5; i++) { const a = 1.2 + i * 0.5; L.line(ctx, 840 + Math.cos(a) * (70 + ck * 30), 440 + Math.sin(a) * (40 + ck * 20), 840 + Math.cos(a) * (96 + ck * 30), 440 + Math.sin(a) * (58 + ck * 20), { color: PAL.ovInk, width: 3, alpha: 1 - ck, seed: 2150 + i }); }
      // overlay: ovGold ring on the book as the voice says the name
      const rp = L.pop(t, 0.25);
      if (rp > 0) { L.ring(ctx, BK.x + 150, BK.y + 162, 132, { scale: rp, width: 4.5, seed: 2160 }); L.ring(ctx, 740, 1196, 118, { scale: L.pop(t, 0.5), width: 3, dash: [12, 10], seed: 2161 }); }
    },
    text(ctx, t, T) {
      const dy = -10 * (1 - L.ease.outCubic(L.prog(L.onTwos(t), 0, 0.25)));
      O.logoMark(ctx, BK.x + 150, BK.y + 162 + dy, 74, PAL.ink);
      L.clauseTag(ctx, 740, 1236, { size: 20, padX: 14 });
    },
  });
})();
