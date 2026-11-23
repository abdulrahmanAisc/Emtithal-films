// 14 my-project, T 28.0 to 31.0, ILL. A reading, never a verdict: only the clause card on the plan and the note.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, F, rnd, rs } = L;
  const PH = { x: 470, y: 250, w: 440, h: 450 };                 // phone
  const SH = { x: 80, y: 745, w: 920, h: 590 };                  // plan sheet
  const ST = { x: 182, y: 985, w: 150, h: 200 };                 // stair on the plan
  const NOTE = 'قراءة الوكيل من بيانات المشروع المسجّلة، وليست نتيجة فحص.';
  // card centre: out of the phone on t 1.0, right to left, then down; attached on t 2.0
  const cardPos = (t) => [lerp(690, 320, ease.inOut(prog(t, 1.0, 0.5))), lerp(585, 880, ease.inOut(prog(t, 1.5, 0.5)))];
  function wall(ctx, x, y, w, h, s) {
    L.rect(ctx, x, y, w, h, { fill: PAL.paperShade, width: 0 });
    L.hatch(ctx, [x, y, w, h], { gap: 5, color: PAL.ink, width: 1.5, seed: s });
    L.rect(ctx, x, y, w, h, { width: 3, seed: s + 1 });
  }
  FILM.defShot('my-project', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t);
      // drafting desk seen from above
      ctx.fillStyle = PAL.desk; ctx.fillRect(0, 0, 1080, 1920);
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = PAL.deskDeep;
      for (let x = -2200; x < 1400; x += 300) { ctx.beginPath(); ctx.moveTo(x, 1920); ctx.lineTo(x + 1920, 0); ctx.lineTo(x + 2070, 0); ctx.lineTo(x + 150, 1920); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      for (let i = 0; i < 46; i++) { const y = 20 + i * 42 + rs('g14', i) * 12, x0 = rnd('g14', i, 1) * 500 - 40; L.line(ctx, x0, y, x0 + 420 + rnd('g14', i, 2) * 700, y + rs('g14', i, 3) * 6, { color: PAL.deskDeep, width: 1.7, alpha: 0.75, seed: 1400 + i }); }
      L.hatch(ctx, [0, 1500, 1080, 420], { gap: 8, color: PAL.ink, width: 1.4, alpha: 0.35, seed: 1450 });
      // set square and pencil, upper left
      const sq = [[70, 300], [70, 660], [400, 660]];
      L.poly(ctx, sq, { fill: PAL.brand300, width: 4, double: true, seed: 1460 });
      L.hatch(ctx, [[70, 480], [70, 660], [400, 660], [240, 480]], { gap: 8, color: PAL.heroShade, width: 1.5, seed: 1461 });
      L.poly(ctx, [[120, 440], [120, 612], [278, 612]], { fill: PAL.desk, width: 3, seed: 1462 });
      for (let i = 1; i < 12; i++) L.line(ctx, 70, 300 + i * 30, 70 + (i % 4 ? 12 : 22), 300 + i * 30, { width: 2, seed: 1463 + i, amp: 0.4 });
      L.poly(ctx, [[250, 268], [410, 300], [404, 326], [244, 294]], { fill: PAL.hero, width: 3.5, seed: 1480 });
      L.poly(ctx, [[410, 300], [440, 320], [404, 326]], { fill: PAL.paperShade, width: 3, seed: 1481 });
      L.hatch(ctx, [[250, 281], [410, 313], [404, 326], [244, 294]], { gap: 5, color: PAL.heroDeep, width: 1.4, seed: 1482 });
      // plan sheet with a cast shadow
      L.hatch(ctx, [SH.x + 16, SH.y + 18, SH.w, SH.h], { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.6, seed: 1500 });
      L.rect(ctx, SH.x, SH.y, SH.w, SH.h, { fill: PAL.paper, width: 4, double: true, seed: 1501 });
      for (let i = 0; i < 4; i++) L.line(ctx, SH.x, SH.y + 60 + i * 150, SH.x + SH.w, SH.y + 70 + i * 150 + rs('cl', i) * 30, { color: PAL.inkFaint, width: 1.1, alpha: 0.4, seed: 1505 + i });
      // villa plan: hatched walls
      const X0 = 150, X1 = 930, Y0 = 800, Y1 = 1230, W = 16;
      wall(ctx, X0, Y0, X1 - X0, W, 1510); wall(ctx, X0, Y1 - W, 300, W, 1512); wall(ctx, X0 + 400, Y1 - W, X1 - X0 - 400, W, 1513);
      wall(ctx, X0, Y0, W, Y1 - Y0, 1514); wall(ctx, X1 - W, Y0, W, Y1 - Y0, 1516);
      wall(ctx, 360, Y0, 12, 110, 1518); wall(ctx, 360, 990, 12, Y1 - 990, 1519);
      wall(ctx, 372, 1010, 190, 12, 1520); wall(ctx, 650, 1010, X1 - 650 - W, 12, 1521);
      wall(ctx, 650, Y0, 12, 120, 1522);
      // doors (arcs), windows
      L.arc(ctx, 366, 910, 80, Math.PI / 2, Math.PI, { color: PAL.inkSoft, width: 2, seed: 1530 }); L.line(ctx, 366, 910, 286, 910, { width: 2.5, seed: 1531 });
      L.arc(ctx, 562, 1016, 88, 0, Math.PI / 2, { color: PAL.inkSoft, width: 2, seed: 1532 }); L.line(ctx, 562, 1016, 562, 1104, { width: 2.5, seed: 1533 });
      L.arc(ctx, 656, 920, 90, -Math.PI / 2, 0, { color: PAL.inkSoft, width: 2, seed: 1534 }); L.line(ctx, 656, 920, 746, 920, { width: 2.5, seed: 1535 });
      L.arc(ctx, 450, Y1 - 8, 100, Math.PI, Math.PI * 1.5, { color: PAL.inkSoft, width: 2, seed: 1536 });
      for (const [wx, wy, ww] of [[450, Y0, 130], [730, Y0, 120], [700, Y1 - W, 150]]) { L.rect(ctx, wx, wy, ww, W, { fill: PAL.paper, width: 2.5, seed: 1540 + wx }); L.line(ctx, wx, wy + W / 2, wx + ww, wy + W / 2, { width: 2, seed: 1541 + wx }); }
      // furniture hints and room labels (illegible)
      L.rect(ctx, 760, 840, 130, 150, { color: PAL.inkSoft, width: 2.5, seed: 1550 }); L.rect(ctx, 770, 848, 110, 40, { color: PAL.inkSoft, width: 2, seed: 1551 });
      L.hatch(ctx, [760, 900, 130, 90], { gap: 12, color: PAL.inkFaint, width: 1.3, seed: 1552 });
      L.rrect(ctx, 420, 850, 190, 70, 14, { color: PAL.inkSoft, width: 2.5, seed: 1553 }); L.circle(ctx, 515, 960, 28, { color: PAL.inkSoft, width: 2.5, seed: 1554 });
      L.rect(ctx, 700, 1060, 180, 110, { color: PAL.inkSoft, width: 2.5, seed: 1555 }); for (let i = 0; i < 3; i++) L.circle(ctx, 730 + i * 60, 1045, 12, { color: PAL.inkSoft, width: 2, seed: 1556 + i });
      L.hatch(ctx, [420, 1040, 120, 160], { gap: 12, color: PAL.inkFaint, width: 1.2, seed: 1559 });
      L.scribble(ctx, 600, 890, 90, { lines: 1, seed: 1560, color: PAL.inkFaint }); L.scribble(ctx, 870, 1010 - 30, 80, { lines: 1, seed: 1561, color: PAL.inkFaint }); L.scribble(ctx, 640, 1130, 80, { lines: 1, seed: 1562, color: PAL.inkFaint });
      // the stair
      L.rect(ctx, ST.x, ST.y, ST.w, ST.h, { fill: PAL.brand200, width: 3.5, double: true, seed: 1570 });
      for (let i = 1; i < 10; i++) L.line(ctx, ST.x, ST.y + i * 20, ST.x + ST.w, ST.y + i * 20, { width: 2.2, seed: 1571 + i, amp: 0.6 });
      L.line(ctx, ST.x + ST.w / 2, ST.y, ST.x + ST.w / 2, ST.y + ST.h, { width: 3, seed: 1585 });
      L.arrow(ctx, ST.x + 38, ST.y + ST.h - 12, ST.x + 38, ST.y + 24, { color: PAL.inkSoft, width: 2.2, head: 12, seed: 1586 });
      L.hatch(ctx, [ST.x + ST.w / 2, ST.y, ST.w / 2, ST.h], { gap: 8, color: PAL.inkSoft, width: 1.3, seed: 1587 });
      // dimension brackets around the plan
      L.bracket(ctx, X0, 772, X1, 772, { color: PAL.ovInk, width: 2.5, tick: 12, ticks: 26, seed: 1590 });
      L.bracket(ctx, 118, Y0, 118, Y1, { color: PAL.ovInk, width: 2.5, tick: 12, ticks: 14, seed: 1591 });
      // phone body (the screen UI is in the crisp layer)
      L.hatch(ctx, L.rrectPts(PH.x + 14, PH.y + 18, PH.w, PH.h, 46), { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.6, seed: 1600 });
      L.rrect(ctx, PH.x, PH.y, PH.w, PH.h, 46, { fill: PAL.spineSlate, width: 5, double: true, seed: 1601 });
      L.hatch(ctx, L.rrectPts(PH.x, PH.y, PH.w, PH.h, 46), { gap: 6, color: PAL.inkStrong, width: 1.5, seed: 1602 });
      L.rrect(ctx, PH.x + 20, PH.y + 24, PH.w - 40, PH.h - 48, 28, { fill: PAL.brand100, width: 3.5, seed: 1603 });
      // overlay: ovInk dashed trajectory from the phone to the plan, drawn on with the card
      const a = prog(t, 1.0, 0.5), b = prog(t, 1.5, 0.5);
      if (a > 0) L.line(ctx, 690, 715, lerp(690, 320, ease.inOut(a)), 715, { color: PAL.ovInk, width: 3, dash: [14, 12], seed: 1610, boil: false });
      if (b > 0) L.arrow(ctx, 320, 715, 320, lerp(715, 960, ease.inOut(b)), { color: PAL.ovInk, width: 3, dash: [14, 12], seed: 1611, head: b >= 1 ? 18 : 0 });
      // ovSlate speed lines behind the travelling card
      if (t >= 1.0 && t < 2.0) { const [cx, cy] = cardPos(t), hz = t < 1.5; for (let i = 0; i < 5; i++) { const o = (i - 2) * 26; if (hz) L.line(ctx, cx + 170, cy + o, cx + 250 + rnd('sp', i, FILM.bf) * 50, cy + o, { color: PAL.ovSlate, width: 3, seed: 1620 + i }); else L.line(ctx, cx + o * 2, cy - 90, cx + o * 2, cy - 150 - rnd('sp', i, FILM.bf) * 50, { color: PAL.ovSlate, width: 3, seed: 1630 + i }); } }
      // overlay: ovGold ring around the stair once the card attaches (T 30.0); attach ticks
      const rp = L.pop(t, 2.0);
      if (rp > 0) { L.ring(ctx, ST.x + ST.w / 2, ST.y + ST.h / 2, 150, { scale: rp, width: 5, seed: 1640 }); L.ring(ctx, ST.x + ST.w / 2, ST.y + ST.h / 2, 168, { scale: rp, width: 2, dash: [14, 12], seed: 1641 }); }
      const at = prog(t, 2.0, F(6));
      if (at > 0 && at < 1) for (let i = 0; i < 8; i++) { const an = (i / 8) * 6.283, r0 = 26 + at * 40; L.line(ctx, 250 + Math.cos(an) * r0, 962 + Math.sin(an) * r0, 250 + Math.cos(an) * (r0 + 22), 962 + Math.sin(an) * (r0 + 22), { color: PAL.ovGold, width: 3.5, alpha: 1 - at, seed: 1650 + i }); }
      // T 30.5: the stair's width is measured (reading the clause against the plan)
      const bk = L.drawOn(t, 2.5);
      if (bk > 0) L.bracket(ctx, ST.x, ST.y + 110, ST.x + ST.w, ST.y + 110, { k: bk, color: PAL.ovGold, width: 6, tick: 16, seed: 1660 });
      void t2;
    },
    text(ctx, t, T) {
      const t2 = L.onTwos(t), sx = PH.x + 20, sw = PH.w - 40, cx = sx + sw / 2;
      // phone screen: the product's menu option, then the project picker
      const tapped = t >= 0.5;
      L.txt(ctx, 'بنود مرتبطة', cx, 318, { size: 20, weight: 500, color: PAL.inkFaint });
      L.chip(ctx, 'هل ينطبق على مشروعي؟', cx, 372, { size: 27, weight: 600, fill: tapped ? PAL.brand400 : PAL.paper, outline: PAL.ink, w: sw - 36, h: 62 });
      const rk = L.pop(t, 0.5);
      if (rk > 0) for (let i = 0; i < 2; i++) {
        const ry = 462 + i * 84, sel = i === 0 && t >= 0.75;
        ctx.save(); ctx.translate(cx, ry); ctx.scale(rk, rk); ctx.translate(-cx, -ry);
        L.card(ctx, sx + 18, ry - 34, sw - 36, 68, { r: 16, fill: sel ? PAL.brand300 : PAL.paper, outline: sel ? PAL.heroShade : PAL.inkSoft, outlineW: sel ? 4 : 2 });
        const gx = sx + sw - 62;                                 // small plan glyph
        ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5; ctx.strokeRect(gx - 20, ry - 18, 40, 36); ctx.beginPath(); ctx.moveTo(gx - 4, ry - 18); ctx.lineTo(gx - 4, ry + 2); ctx.lineTo(gx + 20, ry + 2); ctx.stroke();
        L.scribble(ctx, gx - 36, ry - 6, 190 - i * 40, { lines: 2, gap: 14, seed: 1700 + i, boil: false, color: PAL.inkSoft });
        if (sel) { ctx.fillStyle = PAL.heroShade; ctx.beginPath(); ctx.arc(sx + 50, ry, 9, 0, 6.2832); ctx.fill(); }
        ctx.restore();
      }
      // the hand (work-shirt cuff): taps the option on T 28.5, the project on T 28.75, then leaves
      let hx, hy;
      if (t2 < 0.5) { const k = ease.outCubic(prog(t2, 0.0, 0.42)); hx = lerp(940, 800, k); hy = lerp(470, 384, k); }
      else if (t2 < 0.75) { hx = 800; hy = 384; }
      else if (t2 < 1.0) { hx = 790; hy = 470; }
      else { const k = ease.outCubic(prog(t2, 1.0, 0.5)); hx = lerp(790, 1120, k); hy = lerp(470, 600, k); }
      const press = (t >= 0.5 && t < 0.5 + F(3)) || (t >= 0.75 && t < 0.75 + F(3)) ? 1 : 0;
      for (const tt of [0.5, 0.75]) { const k = prog(t, tt, F(6)); if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = PAL.ovGold; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(tt === 0.5 ? 800 : 790, tt === 0.5 ? 384 : 470, 26 + k * 50, 0, 6.2832); ctx.stroke(); ctx.restore(); } }
      O.hand(ctx, hx, hy, { from: 22, cuff: 'shirt', press, scale: 0.8, seed: 1750 });
      // the clause card: leaves the phone on T 29.0, attaches to the stair on T 30.0
      const ck = L.pop(t, 1.0);
      if (ck > 0) {
        const [x, y] = cardPos(t), w = 300, h = 150;
        ctx.save(); ctx.translate(x, y); ctx.scale(ck, ck); ctx.translate(-x, -y);
        if (t >= 2.0) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(250, y + h / 2); ctx.lineTo(250, 985); ctx.stroke(); ctx.fillStyle = PAL.hero; ctx.beginPath(); ctx.arc(250, 985, 11, 0, 6.2832); ctx.fill(); ctx.stroke(); }
        L.card(ctx, x - w / 2, y - h / 2, w, h, { r: 22, fill: PAL.brand100, outline: PAL.ink, outlineW: 4 });
        L.clauseTag(ctx, x + 40, y - 34, { size: 26 });
        L.scribble(ctx, x + w / 2 - 26, y + 16, w - 56, { lines: 3, gap: 18, seed: 1760, boil: false, color: PAL.inkSoft });
        ctx.restore();
      }
      // the note, legible, from T 30.25: a reading, not a check result
      const nk = prog(t, 2.25, F(6));
      if (nk > 0) {
        const o = { size: 31, weight: 600, color: PAL.inkStrong }, lines = ['قراءة الوكيل من بيانات المشروع المسجّلة،', 'وليست نتيجة فحص.'];
        const y0 = 1296 - (lines.length - 1) * 46, wmax = Math.max(...lines.map((l) => L.measure(ctx, l, o)));
        ctx.save(); ctx.globalAlpha = nk;
        L.card(ctx, 500 - wmax / 2 - 26, y0 - 44, wmax + 52, (lines.length - 1) * 46 + 66, { r: 20, fill: PAL.brand100, outline: PAL.ink, outlineW: 3 });
        lines.forEach((l, i) => L.txt(ctx, l, 500, y0 + i * 46, o));
        ctx.restore();
      }
    },
  });
})();
