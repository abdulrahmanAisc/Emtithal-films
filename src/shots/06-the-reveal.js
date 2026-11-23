// 06 the-reveal, T 8.0 to 10.5, ILL, the hinge. The tower folds into one gold book, which opens into the gold view (G2).
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd, F } = L;
  const HC = [500, 900];
  const CODES = ['201', '301', '401', '801'];
  const cardRect = (i) => { const col = i % 4, row = Math.floor(i / 4); return [690 - col * 180, 690 + row * 262, 160, 232]; };   // right to left
  const cardT = (i) => 1.75 + i * F(1);
  // closed hero book in 3/4 view, 600 x 420 centred on (cx, cy)
  function heroClosed(ctx, cx, cy, sc) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    const cover = [[-280, -200], [262, -214], [296, 168], [-300, 186]];
    L.hatch(ctx, [[-290, 196], [330, 180], [372, 236], [-250, 250]], { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.8, seed: 600 });
    L.poly(ctx, [[-300, 186], [296, 168], [300, 206], [-296, 224]], { fill: PAL.paper, width: 4, seed: 601 });
    for (let i = 1; i < 4; i++) L.line(ctx, -296, 186 + i * 9, 298, 168 + i * 9, { color: PAL.inkSoft, width: 1.5, seed: 602 + i });
    L.poly(ctx, [[262, -214], [300, -196], [334, 190], [296, 168]], { fill: PAL.heroShade, width: 4, seed: 606 });
    L.hatch(ctx, [[262, -214], [300, -196], [334, 190], [296, 168]], { gap: 5, color: PAL.heroDeep, width: 1.6, seed: 607 });
    L.poly(ctx, [[296, 168], [334, 190], [338, 226], [300, 206]], { fill: PAL.paperShade, width: 3.5, seed: 608 });
    L.poly(ctx, cover, { fill: PAL.hero, width: 5.5, double: true, seed: 609 });
    L.hatch(ctx, [[60, -210], [262, -214], [296, 168], [80, 176]], { gap: 8, color: PAL.heroShade, width: 1.7, seed: 610 });
    L.hatch(ctx, [[-300, 60], [296, 44], [296, 168], [-300, 186]], { gap: 6, color: PAL.heroShade, width: 1.6, seed: 611 });
    L.hatch(ctx, [[150, 60], [296, 50], [296, 168], [150, 174]], { gap: 6, angle: 105, color: PAL.heroDeep, width: 1.6, seed: 612 });
    L.poly(ctx, [[-244, -166], [226, -178], [256, 134], [-262, 150]], { color: PAL.ink, width: 2.5, seed: 613 });
    L.scribble(ctx, 190, -90, 330, { lines: 2, gap: 34, color: PAL.ink, width: 5, seed: 614, word: 60, boil: false });
    L.scribble(ctx, 190, 30, 220, { lines: 2, gap: 20, color: PAL.inkStrong, width: 2.5, seed: 615, word: 30 });
    for (const y of [-150, -40, 70]) L.line(ctx, 244, y - 8, 250, y + 60, { color: PAL.ink, width: 3, seed: 616 + y });
    ctx.restore();
  }
  // the book opening: a in (0,1], the leaf swings from over the right half to flat on the left
  function heroOpen(ctx, a) {
    const th = a * Math.PI, c = Math.cos(th), s = Math.sin(th), X = 500, T0 = 640, B0 = 1160;
    L.hatch(ctx, [[110, B0 + 4], [910, B0 - 10], [950, B0 + 52], [150, B0 + 62]], { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.8, seed: 620 });
    const R = [[X, T0], [890, T0 - 16], [904, B0 - 14], [X, B0]];
    for (let k = 3; k >= 1; k--) L.poly(ctx, R.map(([x, y], i) => [x + (i === 1 || i === 2 ? k * 6 : 0), y + k * 7]), { fill: k === 3 ? PAL.hero : PAL.paperShade, width: 3, seed: 621 + k });
    L.poly(ctx, R, { fill: PAL.brand100, width: 5, double: true, seed: 625 });
    L.hatch(ctx, [[X, T0], [X + 90, T0 - 4], [X + 96, B0 - 2], [X, B0]], { gap: 8, color: PAL.inkFaint, width: 1.4, seed: 626 });
    for (let b = 0; b < 3; b++) L.scribble(ctx, 860, T0 + 80 + b * 150, 300, { lines: 5, gap: 20, seed: 627 + b, width: 2.4 });
    const leaf = [[X, T0], [X + c * 390, T0 - 16 - s * 250], [X + c * 404, B0 - 14 - s * 250], [X, B0]];
    const inside = th > Math.PI / 2;
    if (inside) for (let k = 2; k >= 1; k--) L.poly(ctx, leaf.map(([x, y], i) => [x - (i === 1 || i === 2 ? k * 6 : 0), y + k * 7]), { fill: k === 2 ? PAL.hero : PAL.paperShade, width: 3, seed: 630 + k });
    L.poly(ctx, leaf, { fill: inside ? PAL.brand100 : PAL.hero, width: 5, double: true, seed: 633 });
    if (inside) { L.hatch(ctx, [[X, T0], [X + c * 90, T0 - 4 - s * 58], [X + c * 96, B0 - 2 - s * 58], [X, B0]], { gap: 8, color: PAL.inkFaint, width: 1.4, seed: 634 }); for (let b = 0; b < 3; b++) L.scribble(ctx, X + c * 60, T0 + 80 + b * 150 - s * 120, 300 * Math.abs(c), { lines: 5, gap: 20, seed: 635 + b, width: 2.4 }); }
    else { L.hatch(ctx, leaf, { gap: 8, color: PAL.heroShade, width: 1.7, seed: 638 }); L.hatch(ctx, [leaf[1], leaf[2], [X + c * 250, B0 - s * 160], [X + c * 250, T0 - s * 160]], { gap: 6, angle: 105, color: PAL.heroDeep, width: 1.5, seed: 639 }); }
    L.line(ctx, X, T0, X, B0, { width: 6, seed: 640 });
  }
  FILM.defShot('the-reveal', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t), v = O.VIEW;
      O.desk(ctx, { stripe: PAL.stripeGold, day: 1, window: false, seed: 23 });
      O.lamp(ctx);
      if (t < 0.25) {                                                     // T 8.0: the tower collapses inward (outExpo, 6 frames)
        const k = ease.outExpo(prog(t, 0, 0.25)), books = O.tower();
        for (const b of books) {
          const bx = b.x + b.w / 2, by = b.y + b.h / 2, x = lerp(bx, HC[0], k), y = lerp(by, HC[1] - 60, k), s = 1 - k * 0.94;
          ctx.save(); ctx.translate(x, y); ctx.rotate(k * rs('col', b.i) * 0.5); ctx.scale(s, s); ctx.translate(-bx, -by); O.book(ctx, b); ctx.restore();
        }
        for (let j = 0; j < 16; j++) { const a = (j / 16) * 6.2832, r0 = 520 - k * 330; L.line(ctx, HC[0] + Math.cos(a) * r0, HC[1] - 60 + Math.sin(a) * r0, HC[0] + Math.cos(a) * (r0 - 90), HC[1] - 60 + Math.sin(a) * (r0 - 90), { color: PAL.ink, width: 3, alpha: 1 - k * 0.6, seed: 650 + j }); }
        if (k > 0.3) heroClosed(ctx, HC[0], HC[1] - 60 * k, 0.25 + 0.75 * k);
      } else if (t2 < 1.0) {                                              // T 8.5: the hero book lands centred
        const k = prog(t, 0.25, 0.25), dy = t < 0.5 ? -60 - 50 * Math.sin(k * Math.PI) * (1 - k) - 0 + 60 * k * k : 0;
        heroClosed(ctx, HC[0], HC[1] + (t < 0.5 ? dy : (t - 0.5 < F(2) ? 6 : 0)), 1);
        const a = t - 0.5;
        if (a >= 0 && a < F(4)) for (const sx of [-1, 1]) for (let j = 0; j < 4; j++) { const x0 = HC[0] + sx * (330 + a * 260), y0 = HC[1] + 200 - j * 16; L.line(ctx, x0, y0, x0 + sx * (30 + j * 12), y0 - 10 + j * 8, { width: 3.5, seed: 670 + j }); }
      } else if (t2 < 1.5) {                                              // T 9.0: it opens on twos, three drawings
        heroOpen(ctx, t2 < 1 + F(2) ? 0.3 : t2 < 1 + F(4) ? 0.62 : 1);
      } else {                                                            // T 9.5: the spread flattens into the gold view
        const k = ease.outExpo(prog(t, 1.5, 0.25));
        if (k < 0.999) {
          const x = lerp(106, v.x, k), y = lerp(624, v.y, k), w = lerp(798, v.w, k), h = lerp(536, v.h, k);
          L.hatch(ctx, L.rrectPts(x + 16, y + 20, w, h, lerp(8, v.r, k)), { gap: 6, color: PAL.inkSoft, width: 1.6, alpha: 0.7, seed: 130 });
          L.rrect(ctx, x, y, w, h, lerp(8, v.r, k), { fill: PAL.brand100, width: 5, double: true, seed: 131 });
          L.line(ctx, x + w / 2, y + 8, x + w / 2, y + h - 8, { color: PAL.inkSoft, width: 3, alpha: 1 - k, seed: 680 });
          L.line(ctx, x + 5, y + 20, x + w - 5, y + 20, { color: PAL.hero, width: 5, seed: 134 });
        } else O.goldView(ctx);
        // book cards pop in, right to left
        for (let i = 0; i < 8; i++) {
          const s = L.pop(t, cardT(i)); if (s <= 0) continue;
          const [x, y, w, h] = cardRect(i), cx = x + w / 2, cy = y + h / 2;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
          L.hatch(ctx, [x + 8, y + 10, w, h], { gap: 5, color: PAL.inkSoft, width: 1.4, seed: 700 + i });
          L.rrect(ctx, x, y, w, h, 12, { fill: i === 0 ? PAL.brand400 : PAL.paper, width: 3.5, double: true, seed: 710 + i });
          L.rect(ctx, x + w - 24, y + 4, 20, h - 8, { fill: PAL.hero, width: 2, seed: 720 + i });
          L.hatch(ctx, [x + w - 24, y + h * 0.5, 20, h * 0.5 - 4], { gap: 5, color: PAL.heroDeep, width: 1.4, seed: 730 + i });
          L.hatch(ctx, [x + 4, y + h * 0.66, w - 30, h * 0.34 - 4], { gap: 7, color: PAL.inkFaint, width: 1.3, seed: 740 + i });
          L.scribble(ctx, x + w - 36, y + (i < 4 ? 140 : 60), w - 56, { lines: i < 4 ? 3 : 6, gap: i < 4 ? 20 : 24, seed: 750 + i, width: 2.2, word: 18 });
          ctx.restore();
        }
        // overlay: one ovInk construction line traces the view's outline
        const tr = prog(t, 1.5, 0.5), per = L.rrectPts(v.x - 16, v.y - 16, v.w + 32, v.h + 32, v.r + 12), n = Math.floor(tr * per.length);
        if (n > 1 && t < 2.25) L.ink(ctx, per.slice(0, n + 1).concat(tr >= 1 ? [per[0]] : []), { color: PAL.ovInk, width: 1.8, dash: [16, 10], alpha: t < 2 ? 0.9 : 0.9 * (1 - prog(t, 2, 0.25)), seed: 690 });
        for (const [cx, cy] of [[v.x - 16, v.y - 16], [v.x + v.w + 16, v.y - 16], [v.x - 16, v.y + v.h + 16], [v.x + v.w + 16, v.y + v.h + 16]]) if (tr > 0 && t < 2.25) { L.line(ctx, cx - 22, cy, cx + 22, cy, { color: PAL.ovInk, width: 2, seed: 691 + cx }); L.line(ctx, cx, cy - 22, cx, cy + 22, { color: PAL.ovInk, width: 2, seed: 692 + cy }); }
      }
      // overlay: ovGold rings expand from the book as it opens and as the view settles
      L.ripples(ctx, HC[0], HC[1], t, 1.0, { n: 3, r: 520, dur: 0.6 });
      L.ripples(ctx, HC[0], 800, t, 1.5, { n: 2, r: 640, dur: 0.6, width: 3 });
      const rp = L.pop(t, 2.25);
      if (rp > 0) { const [x, y, w, h] = cardRect(0); L.ring(ctx, x + w / 2, y + h / 2, 150, { scale: rp, width: 4, seed: 695 }); }
    },
    text(ctx, t, T) {
      const v = O.VIEW;
      if (t < 1.75) return;
      const a = prog(t, 1.75, F(3));
      O.goldViewText(ctx, { alpha: a });
      L.txt(ctx, 'قاعدة المعرفة', 500, 548, { size: 58, weight: 700, alpha: a, color: PAL.inkStrong });
      const b = prog(t, 1.875, F(3));
      L.txtWrap(ctx, 'كتب كود البناء السعودي بنسختيها العربية والإنجليزية', 500, 616, 730, 44, { size: 29, weight: 500, alpha: b, color: PAL.inkSoft });
      for (let i = 0; i < 4; i++) {
        const s = L.pop(t, cardT(i)); if (s <= 0) continue;
        const [x, y, w, h] = cardRect(i), cx = x + w / 2 - 12;
        L.txt(ctx, 'SBC', cx, y + 52, { size: 22, weight: 600, color: PAL.inkSoft, scale: s });
        L.txt(ctx, CODES[i], cx, y + 104, { size: 46, weight: 600, color: PAL.inkStrong, scale: s });
      }
    },
  });
})();
