// UI video 1: a walkthrough of the real Emtithal reader (captured keyframes), with a cursor, clicks and a camera.
// Flow: knowledge base -> SBC 201 -> search by clause number -> clause 1011.2 -> select text -> ask the book -> cited answer.
(function () {
  const L = FILM.lib, O = FILM.obj, U = FILM.UI, PAL = L.PAL, { clamp, lerp, prog, ease, hexA } = L;
  const SIZE = [1080, 1080], W = SIZE[0], H = SIZE[1];
  const V = FILM.V = { DUR: 14, FPS: 60 };
  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  const MID = (U.VH - U.BAR) / 2;
  // which captured state is on screen
  const STATES = [[0, 'k01'], [1.95, 'k02'], [2.75, 'k04'], [3.6, 'k05'], [5.0, 'k06'], [5.45, 'k07'], [5.95, 'k08'], [7.45, 'k09'], [8.3, 'k08'], [9.05, 'k10'], [9.85, 'k11'], [10.9, 'k12'], [11.75, 'k13']];
  // clicks (time, window x, y) and the cursor path that reaches them
  const CLICKS = [[1.3, 900, 193], [2.6, 643, 358], [3.5, 1177, 40], [4.3, 1180, 231], [8.2, 1290, 700], [9.0, 92, 856], [9.8, 170, 394]];
  const CUR = [[0, 980, 620], [0.5, 980, 620], [1.25, 900, 193], [1.95, 880, 215], [2.55, 643, 358], [2.9, 660, 380], [3.45, 1177, 40], [3.7, 1185, 60], [4.25, 1180, 231], [5.4, 1150, 250], [6.2, 900, 600], [6.85, 801, 545], [6.95, 801, 545], [7.4, 967, 545], [7.7, 990, 560], [8.15, 1290, 700], [8.4, 1290, 700], [8.95, 92, 856], [9.2, 100, 850], [9.75, 170, 394], [10.2, 200, 460], [11.0, 210, 500], [11.7, 286, 437], [12.6, 286, 437], [13.4, 520, 620], [14, 520, 620]];
  // camera: window point at the frame centre, and zoom
  const CAM = [[0, 720, MID, 0.7], [0.9, 720, MID, 0.7], [1.6, 800, 330, 1.15], [2.2, 850, 320, 1.3], [2.7, 850, 320, 1.3], [3.2, 720, MID, 0.72], [3.9, 720, MID, 0.72], [4.5, 850, 380, 1.0], [5.6, 850, 380, 1.0], [6.3, 760, 520, 1.05], [6.7, 760, 520, 1.05], [7.3, 884, 620, 1.5], [8.1, 884, 620, 1.5], [8.7, 720, 500, 0.85], [9.0, 720, 500, 0.85], [9.5, 430, 560, 1.15], [10.5, 430, 560, 1.15], [11.2, 250, 400, 1.7], [12.5, 250, 400, 1.7], [13.4, 720, MID, 0.7], [14, 720, MID, 0.7]];
  const CAPS = [[0.2, 2.7, 'قاعدة المعرفة: كتب كود البناء السعودي'], [3.0, 5.8, 'ابحث برقم البند'], [6.0, 8.3, 'حدّد أي نص من البند'], [8.6, 10.7, 'اسأل الكتاب'], [11.0, 13.9, 'إجابة من نص الكود، مع بندها']];
  function backdrop() {
    ctx.fillStyle = PAL.brand200; ctx.fillRect(0, 0, W, H); ctx.fillStyle = PAL.brand300; ctx.globalAlpha = 0.5;
    for (let x = -H; x < W + 300; x += 300) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.lineTo(x + H + 150, 0); ctx.lineTo(x + 150, H); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  V.draw = (T) => {
    T = clamp(Math.round(T * V.FPS) / V.FPS, 0, V.DUR - 1e-4); FILM.bf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; backdrop();
    const [cx, cy, z] = U.track(CAM, T), [mx, my] = U.track(CUR, T), st = U.stateAt(STATES, T);
    ctx.save(); ctx.translate(W / 2, H / 2 - 20); ctx.scale(z, z); ctx.translate(-cx, -cy);
    U.window(ctx, st, { overlay: (c) => {            // the selection growing under the drag, before the real selected state appears
      if (T >= 6.95 && T < 7.45) { c.fillStyle = 'rgba(37,99,235,0.85)'; c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(120,160,255,0.55)'; c.fillRect(801, 532, clamp(mx - 801, 0, 167), 27); c.globalCompositeOperation = 'source-over'; }
    } });
    let press = 0;
    for (const [t, x, y] of CLICKS) { U.ripple(ctx, x, y, prog(T, t, 0.45), 1 / Math.sqrt(z)); if (T >= t - 0.05 && T < t + 0.1) press = 1; }
    if (T >= 6.95 && T < 7.42) press = 1;
    U.cursor(ctx, mx, my, 1.5 / Math.sqrt(z), press);
    ctx.restore();
    // brand: the logo above the window whenever the camera is pulled back
    const far = clamp((0.9 - z) / 0.15);
    if (far > 0) { ctx.save(); ctx.globalAlpha = far; O.logoLockup(ctx, 540, 96, 48, PAL.inkStrong); ctx.restore(); }
    // captions (sound-off reading)
    for (const [a, b, s] of CAPS) {
      const k = Math.min(L.pop(T, a, 8), 1 - prog(T, b - 0.15, 0.15)); if (k <= 0) continue;
      L.chip(ctx, s, 540, 986, { size: 40, weight: 600, fill: PAL.inkStrong, color: PAL.brand50, outline: null, scale: 0.9 + 0.1 * Math.min(1, k), alpha: clamp(k), h: 92, r: 26, padX: 40 });
    }
    if (FILM.CFG.draft) L.chip(ctx, 'مسودة · DRAFT', 110, 40, { size: 17, weight: 600, fill: PAL.brand100, color: PAL.inkSoft, outline: PAL.inkSoft, outlineW: 1.5, padX: 13 });
  };
  V.sound = (S) => {
    for (const [t] of CLICKS) S.click(t);
    S.whoosh(0.9, 0.7, 0.08); for (let i = 0; i < 7; i++) S.key(1.42 + i * 0.07); S.pop(1.95, 1);
    S.whoosh(2.7, 0.5, 0.08); S.pop(3.6, 0);
    for (let i = 0; i < 6; i++) S.key(4.5 + i * 0.08); S.key(5.4); S.pop(5.45, 2); S.chime(5.95, 0.1);
    S.whoosh(6.7, 0.6, 0.07); for (let i = 0; i < 5; i++) S.tick(6.97 + i * 0.09, i); S.pop(7.45, 3);
    S.whoosh(8.1, 0.6, 0.07); S.pop(9.05, 1); S.riffle(9.95, 0.9); S.chime(10.9, 0.14); S.pop(11.75, 4); S.whoosh(12.5, 0.9, 0.08);
  };
  V.ready = U.load().then(() => { V.draw(0); U.player(V); return true; });
})();
