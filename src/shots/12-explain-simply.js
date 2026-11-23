// 12 explain-simply, T 22.5 to 25.5, ILL. Select two lines, the menu blooms, اشرح ببساطة is tapped, the paragraph re-forms.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs } = L;
  const MENU = ['اسأل الوكيل', 'اشرح ببساطة', 'بنود مرتبطة', 'كيف يُفحص على المخطط؟', 'هل ينطبق على مشروعي؟'];
  const MT = [23.5, 23.5625, 23.625, 23.6875, 23.75], TAP = 24.0;
  const XR = 850, PW = 700, LY = 520, LG = 34, SEL = [3, 4];                // paragraph lines; the two selected ones
  const MX = 420, MY = 716, MW = 430, MH = 66;                              // menu
  FILM.defShot('explain-simply', {
    draw(ctx, t, T) {
      const v = O.VIEW, t2 = L.onTwos(T);
      L.paperPlate(ctx, { stripe: PAL.stripeGold, seed: 51, lines: 7 });
      for (let i = 4; i >= 1; i--) L.rrect(ctx, v.x + i * 9, v.y + i * 8, v.w, v.h, v.r, { fill: i % 2 ? PAL.paperDeep : PAL.paperShade, width: 2.5, seed: 1200 + i });
      O.goldView(ctx);
      const k = ease.inOut(L.clamp((t2 - 24.5) / 0.75));                    // re-form on twos
      // clause heading and margin rule
      L.scribble(ctx, XR, 492 - 4, 320, { lines: 1, color: PAL.ink, width: 5, seed: 1210, word: 46 });
      L.line(ctx, 880, 470, 880, 470 + 300, { color: PAL.hero, width: 4, seed: 1211 });
      // selection band (brand-400 at 55%), dragged right to left at 24 fps from T 22.75
      const sk = ease.outCubic(prog(T, 22.75, 0.5));
      if (sk > 0) { ctx.save(); ctx.globalAlpha = 0.55 * (1 - k * 0.5); ctx.fillStyle = PAL.brand400; ctx.fillRect(XR - PW * sk, LY + SEL[0] * LG - 18, PW * sk, LG * 2 + 2); ctx.restore();
        if (sk >= 1) for (const [x, y] of [[XR, LY + SEL[0] * LG - 18], [XR - PW, LY + SEL[1] * LG + 18]]) { L.line(ctx, x, y - 6, x, y + 6 + 0, { color: PAL.heroDeep, width: 4, seed: 1215 + x }); L.circle(ctx, x, y + (x === XR ? -10 : 10), 7, { fill: PAL.hero, width: 2.5, seed: 1216 + x }); } }
      // the dense paragraph: nine tight lines; it compresses and fades as the simple one forms
      for (let i = 0; i < 9; i++) L.scribble(ctx, XR, LY + i * LG * (1 - k * 0.18), PW, { lines: 1, color: SEL.includes(i) ? PAL.ink : PAL.inkSoft, width: 2.6, seed: 1220 + i, word: 20, alpha: 1 - k * 0.55 });
      if (k < 1) for (let i = 0; i < 9; i++) L.scribble(ctx, XR - 8, LY + 12 + i * LG, PW - 20, { lines: 1, color: PAL.inkFaint, width: 1.6, seed: 1240 + i, word: 14, alpha: (1 - k) * 0.8 });   // the fine print between the lines
      if (k < 1) L.scribble(ctx, XR, 880, PW, { lines: 8, gap: LG, color: PAL.inkSoft, width: 2.6, seed: 1250, word: 20, alpha: (1 - Math.min(1, k * 3)) * 0.8 });   // the next paragraph
      // the simple version: three short clean lines, wider spaced, untangling from knots into straight strokes
      if (t2 >= 24.5) {
        L.rrect(ctx, 150, 880, 700, 290, 26, { fill: PAL.paper, color: PAL.ink, width: 4, double: true, seed: 1260, alpha: Math.min(1, k * 3) });
        L.hatch(ctx, L.rrectPts(150, 1110, 700, 60, 20), { gap: 8, color: PAL.brand300, width: 1.6, seed: 1261, alpha: k });
        for (let i = 0; i < 3; i++) {
          const y = 978 + i * 62, w = [600, 540, 380][i], pts = [];
          for (let j = 0; j <= 24; j++) { const u = j / 24, tang = (1 - k) * 34; pts.push([XR - 50 - u * w * (0.35 + 0.65 * k) + Math.sin(u * 19 + i * 2) * tang, y + Math.cos(u * 23 + i) * tang + (1 - k) * (i - 1) * -40]); }
          L.ink(ctx, pts, { color: PAL.ink, width: 7, seed: 1270 + i, amp: 0.8 });
          L.circle(ctx, XR - 22, y, 8, { fill: PAL.hero, width: 2.5, seed: 1280 + i, alpha: k });
        }
        // ovInk bracket from the dense block to the simple one
        const bk = L.drawOn(T, 25.0);
        L.bracket(ctx, 122, LY - 10, 122, 1160, { color: PAL.ovInk, width: 3, tick: 14, k: bk, seed: 1290 });
        if (T >= 25.25) L.ripples(ctx, 500, 1025, T, 25.25, { n: 2, r: 420, dur: 0.25, width: 3 });
      }
      // foot of the view
      L.line(ctx, 150, 1188, 850, 1188, { color: PAL.inkFaint, width: 2, dash: [10, 8], seed: 1295 });
      L.scribble(ctx, XR, 1214, 420, { lines: 1, color: PAL.inkFaint, width: 2, seed: 1296 });
      // desk details under the view
      L.rect(ctx, 400, 1620, 640, 64, { fill: PAL.brand200, width: 4, double: true, seed: 1300 });
      L.bracket(ctx, 410, 1622, 1030, 1622, { color: PAL.ovInk, width: 2, tick: 0, ticks: 42, seed: 1301 });
      L.hatch(ctx, [400, 1660, 640, 24], { gap: 8, color: PAL.inkSoft, width: 1.3, seed: 1302 });
    },
    text(ctx, t, T) {
      O.goldViewText(ctx);
      const t2 = L.onTwos(T), open = T >= MT[0] && T < 24.375;
      if (T >= 24.5) L.chip(ctx, 'اشرح ببساطة', 720, 918, { size: 30, weight: 600, fill: PAL.brand400, scale: L.pop(T, 24.5), h: 58 });
      // the selection menu blooms from the highlight: five product options
      if (open) {
        const n = MENU.filter((_, i) => T >= MT[i]).length, h = n * MH + 20, a = 1 - prog(T, 24.25, L.F(3));
        ctx.save(); ctx.globalAlpha = a;
        ctx.save(); ctx.globalAlpha *= 0.3; ctx.fillStyle = PAL.ink; L.rr(ctx, MX + 10, MY + 12, MW, h, 22); ctx.fill(); ctx.restore();
        L.card(ctx, MX, MY, MW, h, { fill: PAL.paper, outlineW: 4, r: 22 });
        MENU.forEach((s, i) => {
          const p = L.pop(T, MT[i]); if (p <= 0) return;
          const cy = MY + 10 + MH * i + MH / 2, hit = i === 1 && T >= TAP;
          if (hit) { ctx.fillStyle = PAL.brand400; L.rr(ctx, MX + 8, cy - MH / 2 + 3, MW - 16, MH - 6, 14); ctx.fill(); }
          if (i > 0) { ctx.strokeStyle = PAL.brand300; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(MX + 20, cy - MH / 2); ctx.lineTo(MX + MW - 20, cy - MH / 2); ctx.stroke(); }
          L.txt(ctx, s, MX + MW - 30, cy + 11, { size: 30, weight: hit ? 700 : 500, align: 'right', scale: 0.9 + 0.1 * p });
        });
        ctx.restore();
        if (T >= TAP) L.rrect(ctx, MX - 4, MY + 10 + MH - 6, MW + 8, MH + 12, 20, { color: PAL.ovGold, width: 5, seed: 1310, alpha: a });   // ovGold ring on the chosen option
        L.ripples(ctx, MX + MW / 2, MY + 10 + MH * 1.5, T, TAP, { n: 2, r: 300, dur: 0.375, width: 3 });
      }
      // the finger: drags the selection (24 fps for the stroke), then taps the option on 24.0
      if (T >= 22.5 && T < 24.5) {
        let x, y, press = 0, from = 62; const tx = MX + 60, ty = MY + 10 + MH * 1.5 + 6;
        if (T < 22.75) { const k = ease.outCubic(prog(t2, 22.5, 0.25)); x = lerp(980, XR + 6, k); y = lerp(1300, LY + SEL[0] * LG + 4, k); }
        else if (T < 23.25) { const k = ease.outCubic(prog(T, 22.75, 0.5)); x = XR + 6 - PW * k; y = LY + SEL[0] * LG + 4 + LG * k; press = 1; }
        else if (T < 23.75) { const k = ease.inOut(prog(t2, 23.25, 0.5)); x = lerp(XR + 6 - PW, 300, k); y = lerp(LY + SEL[1] * LG + 4, 1020, k); from = lerp(62, 118, k); }
        else if (T < 24.125) { const k = ease.outCubic(prog(t2, 23.75, 0.25)); x = lerp(300, tx, k); y = lerp(1020, ty, k); press = T >= TAP ? 1 : 0; from = 118; }
        else { const k = ease.inCubic(prog(t2, 24.125, 0.375)); x = lerp(tx, 200, k); y = lerp(ty, 1700, k); from = 118; }
        O.hand(ctx, x, y, { from, scale: 0.8, press, seed: 900 });
      }
    },
  });
})();
