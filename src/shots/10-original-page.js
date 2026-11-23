// 10 original-page, T 18.0 to 20.0, ILL. Match cut on G3: the bracket's span is now the clause line on the book's page.
(function () {
  const L = FILM.lib, PAL = L.PAL;
  const { ease, prog, lerp } = L;
  const G3 = { x1: 160, x2: 840, top: 786, bot: 832 };
  const PG = { x: 110, y: 318, w: 780, h: 1030 };
  FILM.defShot('original-page', {
    draw(ctx, t, T) {
      L.paperPlate(ctx, { stripe: PAL.stripeGold, seed: 41, lines: 7 });
      // the sheets behind, then the scanned page
      for (let i = 3; i >= 1; i--) L.rect(ctx, PG.x + i * 10, PG.y + i * 9, PG.w, PG.h, { fill: i % 2 ? PAL.paperDeep : PAL.paperShade, width: 3, seed: 500 + i });
      L.hatch(ctx, [PG.x + PG.w, PG.y + 30, 34, PG.h], { gap: 6, color: PAL.inkSoft, width: 1.4, seed: 505 });
      L.rect(ctx, PG.x, PG.y, PG.w, PG.h, { fill: PAL.paperShade, width: 5, double: true, seed: 506 });
      L.hatch(ctx, [[PG.x, PG.y], [PG.x + 150, PG.y], [PG.x, PG.y + 210]], { gap: 12, color: PAL.brand300, width: 1.6, seed: 507 });   // scan warmth in the corner
      L.hatch(ctx, [PG.x + PG.w - 26, PG.y, 26, PG.h], { gap: 8, color: PAL.inkFaint, width: 1.3, seed: 508 });
      // running head, clause heading, dense text lines (inkSoft), a small table
      L.scribble(ctx, 840, 362, 300, { lines: 1, color: PAL.inkFaint, width: 2, seed: 510 });
      L.line(ctx, 150, 384, 850, 384, { color: PAL.inkSoft, width: 2, seed: 511 });
      L.scribble(ctx, 840, 432, 380, { lines: 1, color: PAL.ink, width: 4.5, seed: 512, word: 44 });
      L.scribble(ctx, 840, 476, 680, { lines: 9, gap: 32, color: PAL.inkSoft, width: 2.4, seed: 513 });
      L.scribble(ctx, 840, 809, 660, { lines: 1, color: PAL.ink, width: 3.4, seed: 514, word: 34, fill: 1 });                            // the clause line (G3)
      L.scribble(ctx, 840, 862, 680, { lines: 2, gap: 32, color: PAL.inkSoft, width: 2.4, seed: 515 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { L.rect(ctx, 150 + c * 76, 480 + r * 34, 76, 34, { color: PAL.inkSoft, width: 1.6, seed: 520 + r * 4 + c, amp: 0.5, fill: r === 0 ? PAL.paperDeep : null }); }
      ctx.save(); ctx.fillStyle = PAL.paperShade; ctx.restore();
      L.scribble(ctx, 840, 940, 680, { lines: 11, gap: 32, color: PAL.inkSoft, width: 2.4, seed: 530 });
      // the product's highlight band on the clause, there from the cut; the gold frame snaps on T 19.0
      ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = PAL.brand400; ctx.fillRect(G3.x1, G3.top, G3.x2 - G3.x1, G3.bot - G3.top); ctx.restore();
      L.scribble(ctx, 840, 809, 660, { lines: 1, color: PAL.ink, width: 3.4, seed: 514, word: 34 });
      const fp = L.pop(T, 19.0);
      if (fp > 0) {
        const gx = 12 * fp, gy = 10 * fp;
        L.rect(ctx, G3.x1 - gx, G3.top - gy, G3.x2 - G3.x1 + gx * 2, G3.bot - G3.top + gy * 2, { color: PAL.ovGold, width: 7, double: true, seed: 540 });
        for (const [cx, cy] of [[G3.x1 - gx, G3.top - gy], [G3.x2 + gx, G3.top - gy], [G3.x1 - gx, G3.bot + gy], [G3.x2 + gx, G3.bot + gy]]) L.rect(ctx, cx - 8, cy - 8, 16, 16, { fill: PAL.hero, width: 2.5, seed: 541 + cx + cy });
        L.ripples(ctx, 500, 809, T, 19.0, { n: 2, r: 380, dur: 0.5 });
      }
      // margin bracket marking where the clause sits (ovInk)
      L.bracket(ctx, 936, G3.top - 6, 936, G3.bot + 6, { color: PAL.ovInk, width: 3, tick: 12, k: L.drawOn(T, 19.0), seed: 550 });
      // ovInk arrow from the answer card up to the frame
      L.arrow(ctx, 500, 932, 500, 856, { color: PAL.ovInk, width: 4, head: 20, k: L.drawOn(T, 18.75), seed: 551 });
    },
    text(ctx, t, T) {
      L.txt(ctx, 'الصفحة الأصلية من الكتاب', 890, 296, { size: 38, weight: 600, align: 'right' });
      if (FILM.CFG.PAGE != null) L.txt(ctx, String(FILM.CFG.PAGE), 170, 366, { size: 26, weight: 600, align: 'left', color: PAL.inkSoft });
      // G6 answer card slides in right to left on T 18.5
      if (T >= 18.5) {
        const k = ease.outExpo(prog(T, 18.5, L.F(6))), dx = (1 - k) * 1000;
        ctx.save(); ctx.translate(dx, 0);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = PAL.ink; L.rr(ctx, 132, 954, 760, 380, 28); ctx.fill(); ctx.restore();
        L.card(ctx, 120, 940, 760, 380, { fill: PAL.brand100, outlineW: 5, r: 28 });
        L.txt(ctx, 'اسأل الكتاب', 840, 1000, { size: 30, weight: 700, align: 'right' });
        L.clauseTag(ctx, 250, 990, { size: 28 });
        L.scribble(ctx, 840, 1050, 680, { lines: 4, gap: 36, color: PAL.inkSoft, width: 3, seed: 560, boil: false });
        ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = PAL.brand400; ctx.fillRect(330, 1070, 510, 32); ctx.restore();
        L.scribble(ctx, 840, 1086, 500, { lines: 1, color: PAL.ink, width: 3.2, seed: 561, boil: false });
        ctx.strokeStyle = PAL.inkFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, 1218); ctx.lineTo(850, 1218); ctx.stroke();
        L.txt(ctx, 'المصادر', 840, 1276, { size: 30, weight: 600, align: 'right' });
        const sp = L.pop(T, 19.5);
        L.chip(ctx, 'الصفحة الأصلية من الكتاب', 470, 1266, { size: 26, weight: 500, fill: sp > 0 ? PAL.brand400 : PAL.paper, scale: T >= 19.5 ? sp : 1, h: 56 });
        ctx.restore();
      }
    },
  });
})();
