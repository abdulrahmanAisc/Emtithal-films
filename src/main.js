// Frame loop and player. window.renderAt(T) paints the complete frame for global time T; it depends on T only.
(function () {
  const L = FILM.lib, O = FILM.obj, W = FILM.W, H = FILM.H, FPS = FILM.FPS;
  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  FILM.ctx = ctx;
  FILM.shotAt = (T) => { const tl = FILM.TIMELINE; for (const s of tl) if (T >= s.start && T < s.end) return s; return tl[tl.length - 1]; };
  // the one freeze in the film: T 33.25 to 34.0, boil and grain held (brief 6.1). Driven by T, so deterministic.
  const frozen = (T) => (T >= 33.25 && T < 34 ? 33.25 : T);

  FILM.draw = (T) => {
    T = Math.max(0, Math.min(FILM.DURATION - 1e-4, Math.round(T * FPS) / FPS));
    const Tq = frozen(T), s = FILM.shotAt(Tq), def = FILM.shots[s.id];
    FILM.bf = Math.floor(Tq * 12 + 1e-6); FILM.shot = s;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]);
    ctx.clearRect(0, 0, W, H);
    const t = Math.min(Tq, s.end) - s.start;
    ctx.save();
    if (def && def.draw) def.draw(ctx, t, Tq); else { (s.mode === 'SCH' ? L.blueprintPlate : L.paperPlate)(ctx); }
    ctx.restore();
    if (s.mode !== 'BRAND') L.grain(ctx, s.mode);
    ctx.save(); if (def && def.text) def.text(ctx, t, Tq); ctx.restore();
    O.draftTag(ctx, s.mode);
    if (FILM.CFG.subs) L.drawSubtitle(ctx, T, s.mode);
  };
  window.renderAt = async (T) => { FILM.draw(T); };

  FILM.ready = (async () => {
    const faces = ['400', '500', '600', '700'].map((w) => `${w} 40px "Noto Kufi Arabic"`).concat(['400 40px "Inter"', '600 40px "Inter"']);
    await Promise.all(faces.map((f) => document.fonts.load(f, f.includes('Inter') ? 'Ag0' : 'امتثال')));
    await document.fonts.ready;
    await FILM.BRAND.load();
    FILM.draw(0);
    return true;
  })();

  // ---- helpers for the render tool ----
  FILM.frameBlob = (i, type = 'image/png', q) => new Promise((res) => { FILM.draw(i / FPS); canvas.toBlob((b) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(b); }, type, q); });
  FILM.voBuffer = async (ac) => {
    if (!FILM.VO_B64) return null;
    const bin = atob(FILM.VO_B64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return await ac.decodeAudioData(u.buffer);
  };
  FILM.offlineWav = async (mix) => {
    const sr = 48000, ac = new OfflineAudioContext(2, sr * FILM.DURATION, sr);
    const vo = await FILM.voBuffer(ac);
    FILM.renderAudio(ac, 0, vo, mix);
    const buf = await ac.startRendering(), n = buf.length, a = buf.getChannelData(0), b = buf.getChannelData(1);
    const out = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) { out[i * 2] = Math.max(-1, Math.min(1, a[i])) * 32767; out[i * 2 + 1] = Math.max(-1, Math.min(1, b[i])) * 32767; }
    let s = ''; const u8 = new Uint8Array(out.buffer); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    return btoa(s);
  };

  // ---- player: space = play/pause, arrows = step a frame, ?shot=<id> loops one shot, ?subs=0 hides subtitles ----
  const q = new URLSearchParams(location.search), loopId = q.get('shot');
  const loop = loopId ? FILM.TIMELINE.find((s) => s.id === loopId) : null;
  let playing = false, T0 = loop ? loop.start : 0, ac = null, acStart = 0, master = null;
  const hud = document.getElementById('hud');
  const show = (T) => { FILM.draw(T); const s = FILM.shotAt(T); hud.textContent = `${T.toFixed(2)}s  f${Math.round(T * FPS)}  ${s.id}` + (playing ? '' : '  (space: play)'); };
  async function play() {
    if (!ac) ac = new AudioContext({ sampleRate: 48000 });
    await ac.resume();
    const vo = await FILM.voBuffer(ac);
    master = FILM.renderAudio(ac, T0, vo, null, ac.currentTime + 0.08);
    acStart = ac.currentTime + 0.08 - T0; playing = true; requestAnimationFrame(tick);
  }
  function stop() { playing = false; if (master) { try { master.disconnect(); } catch (e) {} master = null; } if (ac) { T0 = Math.max(0, ac.currentTime - acStart); ac.close(); ac = null; } show(T0); }
  function tick() {
    if (!playing) return;
    const T = ac.currentTime - acStart, end = loop ? loop.end : FILM.DURATION;
    if (T >= end) { stop(); T0 = loop ? loop.start : 0; show(T0); if (loop) play(); return; }
    show(Math.max(0, T)); requestAnimationFrame(tick);
  }
  addEventListener('keydown', (e) => {
    if (window.__render) return;
    if (e.code === 'Space') { e.preventDefault(); playing ? stop() : play(); }
    if (!playing && e.code === 'ArrowRight') { T0 = Math.min(FILM.DURATION - 1 / FPS, T0 + 1 / FPS); show(T0); }
    if (!playing && e.code === 'ArrowLeft') { T0 = Math.max(0, T0 - 1 / FPS); show(T0); }
  });
  canvas.addEventListener('click', () => { if (!window.__render) (playing ? stop() : play()); });
  FILM.ready.then(() => show(T0));
})();
