// Shared by the two UI videos: loads the captured keyframes of the real Emtithal UI, draws the app window,
// the cursor, and provides sound helpers and frame export. Frames are a pure function of time.
(function () {
  const L = FILM.lib, PAL = L.PAL, { clamp, lerp, prog, ease, hexA } = L;
  const U = FILM.UI = { VW: 1440, VH: 900, BAR: 46, shots: {}, imgs: {} };
  U.load = async () => {
    await FILM.BRAND.load();
    await Promise.all(['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 40px "Noto Kufi Arabic"`, 'امتثال')).concat([document.fonts.load('400 40px "Inter"', 'Ag0'), document.fonts.load('600 40px "Inter"', 'Ag0')]));
    for (const s of FILM.UI_MANIFEST) U.shots[s.id] = s;
    await Promise.all(Object.entries(FILM.UI_IMAGES).map(([id, src]) => new Promise((res, rej) => { const im = new Image(); im.onload = () => { U.imgs[id] = im; res(); }; im.onerror = rej; im.src = src; })));
  };
  // rect of a named target in a keyframe (CSS px of the 1440x900 viewport); falls back to the viewport centre
  U.R = (id, name) => { const t = U.shots[id] && U.shots[id].targets && U.shots[id].targets[name]; return t || { x: 620, y: 400, w: 200, h: 100, missing: true }; };
  U.C = (id, name, fx = 0.5, fy = 0.5) => { const r = U.R(id, name); return [r.x + r.w * fx, r.y + r.h * fy]; };
  // value of a keyframed track at T: [[t, v...], ...] with inOut easing between keys
  U.track = (keys, T, e = ease.inOut) => {
    if (T <= keys[0][0]) return keys[0].slice(1); const n = keys.length; if (T >= keys[n - 1][0]) return keys[n - 1].slice(1);
    for (let i = 0; i < n - 1; i++) if (T < keys[i + 1][0]) { const a = keys[i], b = keys[i + 1], k = e((T - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, j) => lerp(v, b[j + 1], k)); }
  };
  // which keyframe image is showing at T: states = [[t, id], ...]; returns {a, b, k} for a short crossfade
  U.stateAt = (states, T, fade = 0.14) => { let i = 0; while (i < states.length - 1 && T >= states[i + 1][0]) i++; const k = i > 0 ? clamp((T - states[i][0]) / fade) : 1; return { a: i > 0 ? states[i - 1][1] : states[0][1], b: states[i][1], k }; };
  // the app window in its own coordinates: (0,0) is the top-left of the page content; the title bar sits above it
  U.window = (ctx, st, o = {}) => {
    const W = U.VW, H = U.VH, B = U.BAR, r = 16;
    ctx.save();
    ctx.shadowColor = 'rgba(26,32,41,0.28)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    L.rr(ctx, 0, -B, W, H + B, r); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.save(); L.rr(ctx, 0, -B, W, H + B, r); ctx.clip();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, -B, W, B);
    if (U.imgs[st.a] && st.k < 1) ctx.drawImage(U.imgs[st.a], 0, 0, W, H);
    if (U.imgs[st.b]) { ctx.globalAlpha = st.k; ctx.drawImage(U.imgs[st.b], 0, 0, W, H); ctx.globalAlpha = 1; }
    if (o.overlay) o.overlay(ctx);
    ctx.fillStyle = hexA(PAL.ink, 0.1); ctx.fillRect(0, -1, W, 1);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = [PAL.brand500, PAL.brand300, '#C9C3B4'][i]; ctx.beginPath(); ctx.arc(26 + i * 22, -B / 2, 6.5, 0, 7); ctx.fill(); }
    L.rr(ctx, W / 2 - 190, -B + 9, 380, B - 18, 9); ctx.fillStyle = '#F4F0E4'; ctx.fill();
    L.txt(ctx, 'emtithal.aisc.sa', W / 2, -B / 2 + 5, { size: 14, weight: 400, color: PAL.inkSoft });
    ctx.restore();
    ctx.save(); L.rr(ctx, 0, -B, W, H + B, r); ctx.strokeStyle = hexA(PAL.ink, 0.14); ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  };
  // arrow cursor, tip at (x, y). s = scale, press 0..1
  U.cursor = (ctx, x, y, s = 1, press = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - press * 0.12), s * (1 - press * 0.12));
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(5.2, 17.2); ctx.lineTo(9, 26); ctx.lineTo(12.6, 24.4); ctx.lineTo(8.9, 15.8); ctx.lineTo(16, 15.8); ctx.closePath();
    ctx.fillStyle = '#1A2029'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineWidth = 1.6; ctx.strokeStyle = '#FFFFFF'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  };
  // click ripple at (x, y), k = 0..1
  U.ripple = (ctx, x, y, k, s = 1) => { if (k <= 0 || k >= 1) return; ctx.save(); ctx.beginPath(); ctx.arc(x, y, (6 + ease.outCubic(k) * 22) * s, 0, 7); ctx.fillStyle = hexA(PAL.brand500, 0.28 * (1 - k)); ctx.fill(); ctx.strokeStyle = hexA(PAL.brand600, 0.8 * (1 - k)); ctx.lineWidth = 2 * s; ctx.stroke(); ctx.restore(); };
  // ---- sound: effects only ----
  U.audio = (ac, dur, build) => {
    const out = ac.createGain(); out.gain.value = 0.9; const lim = ac.createDynamicsCompressor(); lim.threshold.value = -8; lim.ratio.value = 8; out.connect(lim); lim.connect(ac.destination);
    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); { const d = nb.getChannelData(0), r = L.rng('ui'); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
    const tone = (T, f, d, g, o = {}) => { const os = ac.createOscillator(), gg = ac.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, T); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, T + d); gg.gain.setValueAtTime(0.0001, T); gg.gain.linearRampToValueAtTime(g, T + 0.004); gg.gain.exponentialRampToValueAtTime(0.0001, T + 0.004 + d); os.connect(gg); gg.connect(out); os.start(T); os.stop(T + d + 0.1); };
    const noise = (T, d, g, f0, f1, q = 1, swell = false) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(), gg = ac.createGain(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, T); f.frequency.exponentialRampToValueAtTime(f1 || f0, T + d); gg.gain.setValueAtTime(0.0001, T); if (swell) { gg.gain.exponentialRampToValueAtTime(g, T + d * 0.5); gg.gain.exponentialRampToValueAtTime(0.0001, T + d); } else { gg.gain.linearRampToValueAtTime(g, T + 0.003); gg.gain.exponentialRampToValueAtTime(0.0001, T + d); } s.connect(f); f.connect(gg); gg.connect(out); s.start(T, (L.hash('o', T) % 1000) / 1000); s.stop(T + d + 0.05); };
    const S = {
      click: (T) => { noise(T, 0.012, 0.5, 3200, 3200, 3); tone(T, 220, 0.04, 0.3, { to: 140 }); noise(T + 0.07, 0.01, 0.25, 4200, 4200, 3); },
      key: (T) => { noise(T, 0.012, 0.22, 3000, 3000, 3); tone(T, 700, 0.015, 0.1); },
      whoosh: (T, d = 0.5, g = 0.12) => noise(T, d, g, 400, 2600, 0.8, true),
      pop: (T, k = 0) => tone(T, 520 + k * 60, 0.05, 0.14, { to: 900 + k * 60 }),
      chime: (T, g = 0.14) => { tone(T, 880, 0.8, g); tone(T + 0.02, 1318.5, 0.8, g * 0.7); tone(T, 880 * 3.5, 0.15, g * 0.2); },
      thud: (T, g = 0.4) => { tone(T, 110, 0.2, g, { to: 45 }); noise(T, 0.06, g * 0.5, 400, 400, 1); },
      tick: (T, k = 0) => noise(T, 0.012, 0.25, 3000 + k * 300, 3000 + k * 300, 4),
      riffle: (T, d) => { const n = Math.round(d * 20); for (let i = 0; i < n; i++) noise(T + (d * i) / n, 0.03, 0.06, 2600 + L.rnd('rf', i) * 2200, 0, 1.5); },
    };
    build(S); return out;
  };
  U.offlineWav = async (dur, build) => {
    const ac = new OfflineAudioContext(2, 48000 * dur, 48000); U.audio(ac, dur, build); const buf = await ac.startRendering(), a = buf.getChannelData(0), b = buf.getChannelData(1), o = new Int16Array(buf.length * 2);
    for (let i = 0; i < buf.length; i++) { o[i * 2] = Math.max(-1, Math.min(1, a[i])) * 32767; o[i * 2 + 1] = Math.max(-1, Math.min(1, b[i])) * 32767; }
    let s = ''; const u = new Uint8Array(o.buffer); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s);
  };
  U.frameBlob = (canvas, draw, T) => new Promise((res) => { draw(T); canvas.toBlob((b) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(b); }, 'image/png'); });
  U.player = (V) => { let ac = null, t0 = 0, playing = false; const tick = () => { if (!playing) return; const T = ac.currentTime - t0; if (T >= V.DUR) { playing = false; ac.close(); V.draw(0); return; } V.draw(Math.max(0, T)); requestAnimationFrame(tick); }; const toggle = () => { if (window.__render) return; if (playing) { playing = false; ac.close(); return; } ac = new AudioContext(); const base = ac.currentTime + 0.1; U.audio(ac, V.DUR, (S) => V.sound(new Proxy(S, { get: (o, k) => (T, ...a) => o[k](base + T, ...a) }))); t0 = base; playing = true; tick(); }; document.getElementById('film').addEventListener('click', toggle); addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } }); };
})();
