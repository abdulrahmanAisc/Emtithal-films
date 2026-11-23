// 08 ask, T 13.5 to 16.5, ILL. The gold view (G2) with the اسأل الكتاب panel; a finger taps the third suggested question.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd } = L;
  const CHIPS = [['ما أقصى مسافة سير إلى المخرج؟', 14.0, 700], ['كم مخرجًا يلزم للطابق؟', 14.25, 792], ['ما الحد الأدنى لعرض الدرج؟', 14.5, 884]];
  const TAP = 15.0, S0 = 15.25, S1 = 16.25;
  // small open-book glyph, its loose page turning on twos while searching
  function bookGlyph(ctx, cx, cy, s, T, turning) {
    const ph = turning ? Math.floor(T * 12 + 1e-6) % 4 : 0;
    L.poly(ctx, [[cx - s, cy - s * 0.55], [cx, cy - s * 0.4], [cx, cy + s * 0.6], [cx - s, cy + s * 0.45]], { fill: PAL.paper, width: 3, seed: 820 });
    L.poly(ctx, [[cx + s, cy - s * 0.55], [cx, cy - s * 0.4], [cx, cy + s * 0.6], [cx + s, cy + s * 0.45]], { fill: PAL.paper, width: 3, seed: 821 });
    L.hatch(ctx, [[cx + s, cy - s * 0.55], [cx, cy - s * 0.4], [cx, cy + s * 0.6], [cx + s, cy + s * 0.45]], { gap: 5, color: PAL.heroShade, width: 1.3, seed: 822 });
    for (let i = 0; i < 3; i++) L.line(ctx, cx - s * 0.85, cy - s * 0.25 + i * s * 0.26, cx - s * 0.15, cy - s * 0.14 + i * s * 0.26, { color: PAL.inkSoft, width: 1.6, seed: 823 + i, amp: 0.4 });
    if (turning) { const a = [0.9, 0.45, -0.45, -0.9][ph]; L.poly(ctx, [[cx, cy - s * 0.4], [cx + a * s, cy - s * (0.55 + (1 - Math.abs(a)) * 0.5)], [cx + a * s, cy + s * (0.45 - (1 - Math.abs(a)) * 0.5)], [cx, cy + s * 0.6]], { fill: PAL.brand400, width: 2.5, seed: 830 + ph }); }
  }
  FILM.defShot('ask', {
    draw(ctx, t, T) {
      const v = O.VIEW, searching = T >= S0 && T < S1, t2 = L.onTwos(T);
      L.paperPlate(ctx, { stripe: PAL.stripeGold, seed: 31, lines: 7 });
      // the book's pages behind the panel; they riffle while it searches
      for (let i = 7; i >= 0; i--) {
        const lift = searching ? Math.max(0, Math.sin(t2 * 12 * 1.1 - i * 0.8)) * 30 : 0;
        const x = v.x + 24 + i * 9, y = v.y - 14 - i * 11 - lift, w = v.w - 48 - i * 18;
        L.rrect(ctx, x, y, w, 70, 14, { fill: i % 2 ? PAL.paperShade : PAL.paper, width: 3, seed: 200 + i });
        L.scribble(ctx, x + w - 30, y + 14, w - 80, { lines: 1, color: PAL.inkFaint, width: 1.6, seed: 210 + i });
      }
      for (let i = 0; i < 9; i++) L.line(ctx, v.x + v.w + 8 + i * 5, v.y + 60 + i * 6, v.x + v.w + 8 + i * 5, v.y + v.h - 30 - i * 4, { color: i % 3 ? PAL.inkSoft : PAL.ink, width: 2, seed: 230 + i });
      if (searching) for (let i = 0; i < 5; i++) {                      // ovSlate motion lines over the riffling pages
        const ph = (Math.floor(T * 12) + i * 2) % 6, cx = 200 + i * 150 + ph * 8;
        L.arc(ctx, cx, v.y - 110 - (i % 2) * 26, 46 + ph * 5, -2.5, -0.7, { color: PAL.ovSlate, width: 3, alpha: 1 - ph / 7, seed: 240 + i });
      }
      O.goldView(ctx);
      // panel forms inside the view
      L.rrect(ctx, 130, 476, 740, 734, 24, { color: PAL.inkSoft, width: 2.2, seed: 250 });
      L.line(ctx, 160, 622, 840, 622, { color: PAL.heroShade, width: 3, seed: 251 });
      L.hatch(ctx, [150, 626, 700, 14], { gap: 6, color: PAL.hero, width: 1.6, seed: 252 });
      L.line(ctx, 160, 1088, 840, 1088, { color: PAL.inkFaint, width: 2, dash: [10, 8], seed: 253 });
      L.hatch(ctx, L.rrectPts(134, 1092, 732, 114, 20), { gap: 12, color: PAL.brand300, width: 1.6, seed: 254 });
      bookGlyph(ctx, 800, 986, 34, T, searching);
      if (T >= S0) {                                                    // progress strip, filling on twos
        const k = L.clamp((t2 - S0) / (S1 - S0));
        L.rrect(ctx, 160, 1034, 580, 16, 8, { color: PAL.inkSoft, width: 2, seed: 255 });
        if (k > 0) L.hatch(ctx, [740 - 580 * k, 1034, 580 * k, 16], { gap: 5, color: PAL.heroShade, width: 2, seed: 256 });
      }
      // drafting tools under the view, for density
      L.rect(ctx, 60, 1610, 620, 70, { fill: PAL.brand200, width: 4, double: true, seed: 260 });
      L.bracket(ctx, 70, 1612, 670, 1612, { color: PAL.ovInk, width: 2, tick: 0, ticks: 40, seed: 261 });
      L.hatch(ctx, [60, 1655, 620, 25], { gap: 8, color: PAL.inkSoft, width: 1.3, seed: 262 });
      L.poly(ctx, [[760, 1720], [1040, 1640], [1050, 1668], [770, 1748]], { fill: PAL.hero, width: 4, seed: 263 });
      L.hatch(ctx, [[760, 1734], [1045, 1654], [1050, 1668], [770, 1748]], { gap: 5, color: PAL.heroDeep, width: 1.4, seed: 264 });
      L.poly(ctx, [[760, 1720], [770, 1748], [726, 1746]], { fill: PAL.paperShade, width: 3, seed: 265 });
    },
    text(ctx, t, T) {
      O.goldViewText(ctx);
      L.txt(ctx, 'اسأل الكتاب', 840, 548, { size: 46, weight: 700, align: 'right', scale: 0.9 + 0.1 * Math.min(1, L.pop(T, 13.5) || 1) });
      L.txt(ctx, 'يجيب من نص ' + (FILM.CFG.CODE || 'SBC ___') + ' فقط مع ذكر البند', 840, 602, { size: 28, weight: 500, align: 'right', color: PAL.inkSoft, alpha: prog(T, 13.75, L.F(3)) });
      let tapped = null;
      CHIPS.forEach(([s, at, y], i) => {
        const hit = i === 2 && T >= TAP;
        const b = L.chip(ctx, s, 500, y, { size: 34, weight: hit ? 600 : 500, scale: L.pop(T, at), fill: hit ? PAL.brand400 : PAL.paper, outlineW: hit ? 4 : 2.5, h: 74 });
        if (i === 2) tapped = b;
      });
      const rp = L.pop(T, TAP);                                          // ovGold ring on the tapped chip
      if (rp > 0) L.rrect(ctx, tapped.x - 12, tapped.y - 12, tapped.w + 24, tapped.h + 24, 46, { color: PAL.ovGold, width: 5, seed: 270, alpha: T < S1 ? 1 : 0.6 });
      L.ripples(ctx, 500, 884, T, TAP, { n: 2, r: 300, dur: 0.5, width: 3 });
      if (T >= S0) L.txt(ctx, 'جارٍ البحث في الكتاب…', 740, 998, { size: 30, weight: 500, align: 'right', alpha: prog(T, S0, L.F(3)) });
      L.txtWrap(ctx, 'الإجابات من نص الكتاب فقط، وكل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه.', 500, 1140, 680, 44, { size: 26, weight: 400, color: PAL.inkSoft });
      // the finger (thobe cuff): in at 14.5, taps on 15.0, away by 15.75. Poses on twos.
      const t2 = L.onTwos(T);
      if (t2 >= 14.5 && t2 < 15.75) {
        const kin = ease.outCubic(prog(t2, 14.5, 0.42)), kout = ease.inCubic(prog(t2, 15.25, 0.5));
        const x = lerp(lerp(760, 452, kin), 800, kout), y = lerp(lerp(1560, 900, kin), 1640, kout);
        O.hand(ctx, x, y, { from: 58, scale: 0.82, press: T >= TAP && T < TAP + 0.125 ? 1 : 0, seed: 900 });
      }
    },
  });
})();
