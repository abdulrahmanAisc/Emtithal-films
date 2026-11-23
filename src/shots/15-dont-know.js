// 15 dont-know, T 31.0 to 34.0, ILL, the trust beat. Calm on purpose. The engine holds the frame from T 33.25.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, F, rnd } = L;
  const ANSWER = 'لا أعرف: نص الكتاب لا يكفي للإجابة عن هذا السؤال.';
  const HINT = 'الإجابات من نص الكتاب فقط، وكل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه.';
  const CARD = { x: 150, y: 905, w: 700, h: 190 };
  FILM.defShot('dont-know', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t), v = O.VIEW;
      O.desk(ctx, { stripe: PAL.stripeSand });
      O.lamp(ctx);
      O.goldView(ctx);
      // panel furniture: a quiet rule under the title block and above the hint
      L.line(ctx, v.x + 50, 612, v.x + v.w - 50, 612, { color: PAL.brand300, width: 2.5, seed: 1801 });
      L.line(ctx, v.x + 50, 1128, v.x + v.w - 50, 1128, { color: PAL.brand300, width: 2.5, seed: 1802 });
      // the question bubble: typed on 32nds from T 31.5 (illegible scribble: a question the code does not cover)
      const typed = Math.min(6, Math.floor((t - 0.5) / 0.0625 + 1e-6) + 1) / 6;
      const bk = L.pop(t, 0.5);
      if (bk > 0) {
        ctx.save(); ctx.translate(850, 700); ctx.scale(bk, bk); ctx.translate(-850, -700);
        L.rrect(ctx, 330, 640, 520, 118, 30, { fill: PAL.brand200, width: 4, double: true, seed: 1810 });
        L.hatch(ctx, L.rrectPts(330, 714, 520, 44, 22), { gap: 8, color: PAL.brand300, width: 1.6, seed: 1811 });
        L.poly(ctx, [[820, 754], [860, 786], [780, 757]], { fill: PAL.brand200, width: 3.5, seed: 1812 });
        ctx.restore();
        if (t >= 0.5) {
          L.scribble(ctx, 812, 684, 440, { lines: 2, gap: 34, width: 4, word: 40, fill: typed, seed: 1813, color: PAL.ink });
          if (typed >= 1) L.ink(ctx, [[360, 672], [370, 660], [382, 664], [384, 678], [372, 690], [372, 702]], { width: 4, seed: 1814 });   // a drawn question mark
          if (typed >= 1) L.circle(ctx, 372, 716, 3.5, { fill: PAL.ink, width: 2, seed: 1815 });
        }
      }
      // the book glyph: searches on twos from T 32.0, stops on T 32.75
      if (t >= 1.0) {
        const cx = 500, cy = 830, searching = t < 1.75, ph = searching ? Math.floor((t2 - 1.0) * 12 + 1e-6) % 4 : 0;
        L.poly(ctx, [[cx - 78, cy - 34], [cx, cy - 22], [cx, cy + 40], [cx - 78, cy + 28]], { fill: PAL.paper, width: 3.5, seed: 1820 });
        L.poly(ctx, [[cx + 78, cy - 34], [cx, cy - 22], [cx, cy + 40], [cx + 78, cy + 28]], { fill: PAL.paper, width: 3.5, seed: 1821 });
        L.scribble(ctx, cx - 12, cy - 6, 52, { lines: 3, gap: 11, width: 1.6, word: 14, seed: 1822, color: PAL.inkSoft });
        L.scribble(ctx, cx + 68, cy - 6, 52, { lines: 3, gap: 11, width: 1.6, word: 14, seed: 1823, color: PAL.inkSoft });
        L.hatch(ctx, [[cx + 78, cy - 34], [cx + 40, cy - 28], [cx + 40, cy + 34], [cx + 78, cy + 28]], { gap: 6, color: PAL.heroShade, width: 1.4, seed: 1824 });
        L.line(ctx, cx - 80, cy + 34, cx, cy + 46, { color: PAL.hero, width: 5, seed: 1825 }); L.line(ctx, cx + 80, cy + 34, cx, cy + 46, { color: PAL.hero, width: 5, seed: 1826 });
        if (searching) {                                          // one page in the air, four drawings
          const px = [70, 30, -30, -70][ph], py = [-44, -74, -74, -44][ph];
          L.poly(ctx, [[cx, cy - 22], [cx + px, cy + py], [cx + px, cy + py + 60], [cx, cy + 40]], { fill: PAL.paperShade, width: 3, seed: 1827 + ph });
          for (let i = 0; i < 3; i++) L.arc(ctx, cx, cy - 20, 96 + i * 14, -2.4 + ph * 0.3, -1.6 + ph * 0.3, { color: PAL.ovSlate, width: 2.5, seed: 1832 + i });
        }
      }
      // overlay: a single quiet ovInk bracket around the answer card (fades in with it)
      const ck = prog(t, 2.0, F(6));
      if (ck > 0) {
        L.bracket(ctx, CARD.x - 30, CARD.y - 6, CARD.x - 30, CARD.y + CARD.h + 6, { color: PAL.ovInk, width: 3, tick: 12, alpha: ck, seed: 1840 });
        L.hatch(ctx, L.rrectPts(CARD.x + 10, CARD.y + 12, CARD.w, CARD.h, 26), { gap: 8, color: PAL.inkSoft, width: 1.4, alpha: 0.6 * ck, seed: 1841 });
      }
    },
    text(ctx, t, T) {
      const v = O.VIEW;
      O.goldViewText(ctx);
      L.txt(ctx, 'اسأل الكتاب', 850, 532, { size: 46, weight: 700, align: 'right', color: PAL.inkStrong });
      L.txt(ctx, 'يجيب من نص ' + FILM.slot(FILM.CFG.CODE) + ' فقط مع ذكر البند', 850, 584, { size: 25, weight: 400, align: 'right', dir: 'rtl', color: PAL.inkSoft });
      if (t >= 1.0 && t < 1.75) L.txt(ctx, 'جارٍ البحث في الكتاب…', 500, 912, { size: 26, weight: 500, color: PAL.inkSoft });
      // the plain card: no pop, no flash, a fade over 6 frames on T 33.0
      const ck = prog(t, 2.0, F(6));
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha = ck;
        L.card(ctx, CARD.x, CARD.y, CARD.w, CARD.h, { r: 26, fill: PAL.paper, outline: PAL.ink, outlineW: 4 });
        L.txtWrap(ctx, ANSWER, 500, CARD.y + 82, CARD.w - 90, 62, { size: 39, weight: 600, color: PAL.inkStrong });
        ctx.restore();
      }
      ['الإجابات من نص الكتاب فقط،', 'وكل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه.'].forEach((l, i) => L.txt(ctx, l, 500, 1168 + i * 38, { size: 24, weight: 400, color: PAL.inkSoft }));
    },
  });
})();
