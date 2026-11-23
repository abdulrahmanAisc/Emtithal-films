// 18 end-card, T 37.5 to 40.0, brand plate. Everything crisp and centred on x 500; no boil, no grain.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const DISC = ['يساعدك امتثال على قراءة كود البناء السعودي وفهمه،', 'ولا يغني عن المهندس المرخّص، ولا يمثّل اعتماداً رسمياً.'];
  FILM.defShot('end-card', {
    draw(ctx, t, T) {
      ctx.fillStyle = PAL.brand50; ctx.fillRect(0, 0, 1080, 1920);
      ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = PAL.brand300;
      for (let x = -2200; x < 1400; x += 300) { ctx.beginPath(); ctx.moveTo(x, 1920); ctx.lineTo(x + 1920, 0); ctx.lineTo(x + 2070, 0); ctx.lineTo(x + 150, 1920); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    text(ctx, t, T) {
      O.logoLockup(ctx, 500, 630, 120, PAL.inkStrong); O.byAisc(ctx, 500, 742, 34, PAL.inkStrong);                                   // T 37.5: hard cut, no effect
      const hk = L.pop(t, 0.5), sk = L.pop(t, 1.0);
      if (hk > 0) L.txt(ctx, 'اسأل الكود.', 500, 890, { size: 88, weight: 700, color: PAL.inkStrong, scale: hk });
      if (sk > 0) {
        L.txt(ctx, 'كود البناء السعودي، يجاوبك من نصّه.', 500, 974, { size: 40, weight: 500, color: PAL.ink, scale: sk });
        L.chip(ctx, FILM.CFG.cta, 500, 1110, { size: 46, weight: 700, fill: PAL.cta, color: PAL.inkStrong, outline: null, h: 108, padX: 76, scale: sk });
        L.txt(ctx, 'emtithal.aisc.sa', 500, 1222, { size: 34, weight: 600, color: PAL.ink, dir: 'ltr' });
        DISC.forEach((l, i) => L.txt(ctx, l, 500, 1318 + i * 46, { size: 26, weight: 400, color: PAL.ink, alpha: 0.8 }));
      }
    },
  });
})();
