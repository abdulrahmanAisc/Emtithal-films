// UI video 2: a design-system reveal (grid lines on black, palette, logo construction, the real UI, title).
// Uses the brand tokens from the product repo, the team's logo files and the captured keyframes of the real UI.
(function () {
  const L = FILM.lib, O = FILM.obj, U = FILM.UI, PAL = L.PAL, { clamp, lerp, prog, ease, hexA } = L;
  const SIZE = [1080, 1350], W = SIZE[0], H = SIZE[1];
  const V = FILM.V = { DUR: 10, FPS: 30 };
  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  const BG = '#0B0D11', LINE = '#39414F', PAPER = PAL.brand50;
  const TOK = [['brand-50', '#FFFEF2'], ['brand-100', '#FBF6E8'], ['brand-200', '#F4F0E4'], ['brand-300', '#E6D9AE'], ['brand-400', '#E8C55A'], ['brand-500', '#DBA61C'], ['brand-600', '#C9910A'], ['brand-700', '#AF8516'], ['brand-900', '#8F6A09'], ['ink', '#252D3B'], ['ink-strong', '#1A2029']];
  // panel rect per scene [t, x, y, w, h]; grid lines run along its edges to the frame
  const FULL = [60, 70, 960, 1210];
  const PANEL = [[0, 470, 600, 140, 150], [0.55, 470, 600, 140, 150], [1.0, ...FULL], [7.8, ...FULL], [8.1, 0, 470, 1080, 330], [10, 0, 470, 1080, 330]];
  const cut = (T, t) => T >= t;
  function grid(p, a = 1) {
    ctx.save(); ctx.strokeStyle = LINE; ctx.globalAlpha = a; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const x of [p[0], p[0] + p[2]]) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (const y of [p[1], p[1] + p[3]]) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
    ctx.stroke(); ctx.restore();
  }
  const ids = () => FILM.UI_MANIFEST.map((s) => s.id);
  function backdrop(p) {            // warm paper with wide diagonal stripes, the film's plate
    ctx.save(); ctx.beginPath(); ctx.rect(p[0], p[1], p[2], p[3]); ctx.clip(); ctx.fillStyle = PAL.brand200; ctx.fillRect(p[0], p[1], p[2], p[3]);
    ctx.fillStyle = PAL.brand300; ctx.globalAlpha = 0.55; for (let x = -H; x < W + 300; x += 300) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.lineTo(x + H + 150, 0); ctx.lineTo(x + 150, H); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // draw the app window so that the window point (wx, wy) sits at the panel centre at scale z
  function app(p, st, wx, wy, z) {
    ctx.save(); ctx.beginPath(); ctx.rect(p[0], p[1], p[2], p[3]); ctx.clip();
    ctx.translate(p[0] + p[2] / 2, p[1] + p[3] / 2); ctx.scale(z, z); ctx.translate(-wx, -wy); U.window(ctx, st); ctx.restore();
  }

  V.draw = (T) => {
    T = clamp(Math.round(T * V.FPS) / V.FPS, 0, V.DUR - 1e-4); FILM.bf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    const p = U.track(PANEL, T, ease.outExpo), K = ids();
    if (T < 1.3) {                                   // 1. a small paper square opens; the logo passes through it, huge
      ctx.save(); ctx.beginPath(); ctx.rect(p[0], p[1], p[2], p[3]); ctx.clip(); ctx.fillStyle = PAPER; ctx.fillRect(p[0], p[1], p[2], p[3]);
      const h = lerp(420, 300, prog(T, 0, 1.3)); O.logoLockup(ctx, lerp(1250, 300, ease.inOut(prog(T, 0, 1.3))), 675, h, PAL.inkStrong); ctx.restore();
    } else if (T < 3.0) {                            // 2. the palette, token by token
      const rh = p[3] / TOK.length;
      TOK.forEach(([name, hex], i) => {
        const k = ease.outExpo(prog(T, 1.3 + i * 0.07, 0.4)); if (k <= 0) return;
        const y = p[1] + i * rh; ctx.fillStyle = hex; ctx.fillRect(p[0], y, p[2] * k, rh + 1);
        const dark = i >= 5, c = dark ? '#FFFEF2' : '#252D3B';
        L.txt(ctx, name, p[0] + 28, y + 42, { size: 24, weight: 600, align: 'left', color: c, alpha: k });
        L.txt(ctx, hex, p[0] + 28, y + 72, { size: 17, weight: 400, align: 'left', color: c, alpha: k * 0.75 });
        L.txt(ctx, String(i + 1).padStart(2, '0'), p[0] + p[2] - 28, y + 42, { size: 17, weight: 400, align: 'right', color: c, alpha: k * 0.6 });
      });
    } else if (T < 4.6) {                            // 3. the logo and its construction lines
      ctx.fillStyle = PAPER; ctx.fillRect(p[0], p[1], p[2], p[3]);
      const lh = 150, lw = (lh * FILM.BRAND.emtithal.w) / FILM.BRAND.emtithal.h, cx = 540, cy = 640, x0 = cx - lw / 2, y0 = cy - lh / 2, mk = (lh * 60.8) / 64;
      const k = ease.outExpo(prog(T, 3.0, 0.7));
      ctx.save(); ctx.strokeStyle = hexA(PAL.ink, 0.28); ctx.lineWidth = 1.5; ctx.beginPath();
      for (const y of [y0 + lh * 0.058, y0 + lh * 0.993, y0 + lh * 0.5]) { ctx.moveTo(p[0], y); ctx.lineTo(p[0] + p[2] * k, y); }
      for (const x of [x0, x0 + mk, x0 + lw * 0.325, x0 + lw]) { ctx.moveTo(x, p[1]); ctx.lineTo(x, p[1] + p[3] * k); }
      ctx.stroke(); ctx.restore();
      const r = prog(T, 3.25, 0.6);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y0 - 20, (lw + 20) * ease.inOut(r), lh + 40); ctx.clip(); O.logoLockup(ctx, cx, cy, lh, PAL.inkStrong); ctx.restore();
      const a = prog(T, 3.8, 0.3);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; O.byAisc(ctx, cx, cy + 150, 34, PAL.inkStrong); ctx.restore(); L.txt(ctx, 'Noto Kufi Arabic · Inter', cx, p[1] + p[3] - 50, { size: 20, weight: 400, color: PAL.inkSoft, alpha: a }); L.txt(ctx, '#252D3B', x0, y0 - 34, { size: 17, weight: 400, align: 'left', color: PAL.inkSoft, alpha: a }); }
    } else if (T < 6.2) {                            // 4. the real UI, close: the header and the book list, then the reader
      backdrop(p);
      const second = T >= 5.4, id = second ? 'k08' : K[0], st = { a: id, b: id, k: 1 };
      const r = second ? U.R(id, 'clauseInReader') : U.R(id, 'bookCard');
      const z = (second ? 1.25 : 1.45) + prog(T, second ? 5.4 : 4.6, 0.8) * 0.08;
      app(p, st, r.x + r.w / 2, r.y + r.h / 2, z);
    } else if (T < 7.8) {                            // 5. the whole window, stepping through the flow
      backdrop(p);
      const n = K.length, i = Math.min(n - 1, Math.floor(prog(T, 6.2, 1.5) * n)), st = { a: K[Math.max(0, i - 1)], b: K[i], k: clamp((T - (6.2 + (i * 1.5) / n)) / 0.12) };
      app(p, st, U.VW / 2, U.VH / 2 - U.BAR / 2, 0.6 + prog(T, 6.2, 1.6) * 0.03);
    } else {                                         // 6. title
      const a1 = ease.outCubic(prog(T, 7.9, 0.4)), a2 = ease.outCubic(prog(T, 8.2, 0.4)), a3 = prog(T, 8.6, 0.4);
      L.txt(ctx, 'اقرأ الكود.', 540, 610 + (1 - a1) * 16, { size: 116, weight: 700, color: PAPER, alpha: a1 });
      L.txt(ctx, 'افهم البند.', 540, 760 + (1 - a2) * 16, { size: 116, weight: 700, color: PAL.brand400, alpha: a2 });
      ctx.save(); ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; ctx.globalAlpha = a1; ctx.beginPath(); ctx.moveTo(0, 635.5); ctx.lineTo(W, 635.5); ctx.stroke(); ctx.restore();
      L.txt(ctx, 'كود البناء السعودي، يجاوبك من نصّه.', 540, 930, { size: 36, weight: 500, color: hexA(PAPER, 0.9), alpha: a3 });
      if (a3 > 0) { ctx.save(); ctx.globalAlpha = a3; O.logoLockup(ctx, 540, 1150, 64, PAPER); O.byAisc(ctx, 540, 1216, 22, hexA(PAPER, 0.8)); ctx.restore(); L.txt(ctx, 'emtithal.aisc.sa', 540, 1290, { size: 22, weight: 400, color: hexA(PAPER, 0.6), alpha: a3 }); }
    }
    grid(p);
    if (FILM.CFG.draft) L.chip(ctx, 'مسودة · DRAFT', 110, 36, { size: 16, weight: 600, fill: BG, color: hexA(PAPER, 0.6), outline: hexA(PAPER, 0.4), outlineW: 1.5, padX: 12 });
  };
  V.sound = (S) => {
    S.thud(0.02, 0.3); S.whoosh(0.5, 0.7, 0.14); S.thud(1.3, 0.35);
    TOK.forEach((t, i) => S.tick(1.3 + i * 0.07, i));
    S.thud(3.0, 0.35); S.whoosh(3.2, 0.6, 0.08); S.pop(3.8, 2);
    S.thud(4.6, 0.35); S.whoosh(4.6, 0.8, 0.1); S.click(5.4);
    S.thud(6.2, 0.3); for (let i = 0; i < FILM.UI_MANIFEST.length; i++) S.click(6.2 + (i * 1.5) / FILM.UI_MANIFEST.length);
    S.thud(7.8, 0.5); S.chime(8.2, 0.12); S.pop(8.6, 3);
  };
  V.ready = U.load().then(() => { V.draw(0); U.player(V); return true; });
})();
