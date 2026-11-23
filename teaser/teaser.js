// "من آلاف الصفحات" : a 16 s square brand teaser in the dark, gold-lit style of the second reference.
// Same method as the film: every frame is a pure function of time on a canvas, the sound is synthesised.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL, { clamp, lerp, prog, ease, rnd, rs, hexA } = L;
  const W = 1080, H = 1080, FPS = 30, DUR = 16;
  const TZ = FILM.TEASER = { W, H, FPS, DUR };
  const canvas = document.getElementById('film'), ctx = canvas.getContext('2d');
  const io = (T, a, b, fin = 0.25, fout = 0.25) => Math.min(prog(T, a, fin), 1 - prog(T, b - fout, fout));   // fade in/out window
  const WHITE = '#FBF6E8';

  function bg(T) {
    ctx.fillStyle = '#07090C'; ctx.fillRect(0, 0, W, H);
    const glow = (x, y, r, a, col = PAL.hero) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(0.5, hexA(col, a * 0.35)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const k = 0.75 + 0.25 * Math.sin(T * 0.9);
    glow(540 + Math.sin(T * 0.5) * 160, 980 + Math.cos(T * 0.4) * 60, 760, 0.34 * k);
    glow(160 + Math.cos(T * 0.35) * 120, 240, 620, 0.12, PAL.heroDeep);
    glow(940, 420 + Math.sin(T * 0.6) * 90, 520, 0.10 * k, PAL.brand400);
    const v = ctx.createRadialGradient(540, 540, 300, 540, 540, 800); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  // hero glyph: lines of code text, one of them found (gold). Right-aligned, like Arabic text.
  function glyph(cx, cy, s, o = {}) {
    const bars = [[1, 0], [0.74, 1], [0.5, 0]], h = s * 0.17, gap = s * 0.14, w = s, a = o.alpha ?? 1;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.rotate(o.rot ?? 0);
    bars.forEach(([f, gold], i) => {
      const y = (i - 1) * (h + gap) - h / 2, bw = w * f * (o.grow ? clamp(o.grow * 1.4 - i * 0.2) : 1); if (bw <= 0) return;
      const isGold = gold && (o.gold ?? 0) > 0;
      if (isGold) { ctx.shadowColor = hexA(PAL.brand400, 0.9 * o.gold); ctx.shadowBlur = s * 0.35 * o.gold; }
      ctx.fillStyle = isGold ? PAL.brand400 : (o.color || WHITE); if (gold && !isGold) ctx.fillStyle = o.color || WHITE;
      L.rr(ctx, w / 2 - bw, y, bw, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
    });
    ctx.restore();
  }
  function tile(cx, cy, s, o = {}) {       // dark app-like tile lit from below by gold
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    ctx.shadowColor = hexA(PAL.hero, 0.55); ctx.shadowBlur = s * 0.35; ctx.shadowOffsetY = s * 0.08;
    L.rr(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.24); const g = ctx.createLinearGradient(0, cy - s / 2, 0, cy + s / 2);
    g.addColorStop(0, '#1A2029'); g.addColorStop(0.55, '#1A2029'); g.addColorStop(1, PAL.hero); ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = Math.max(1.5, s * 0.008); ctx.strokeStyle = hexA(WHITE, 0.22); ctx.stroke();
    ctx.restore(); if (s > 2) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; O.logoMark(ctx, cx, cy - s * 0.03, s * 0.5, WHITE); ctx.restore(); }
  }
  function streaks(T, t0, t1) {            // pages rushing past on the diagonal
    const k = prog(T, t0, t1 - t0); if (k <= 0 || k >= 1) return; const env = Math.sin(k * Math.PI);
    ctx.save(); ctx.translate(540, 540); ctx.rotate(-Math.PI / 4); ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const sp = 1500 + rnd('st', i, 1) * 2600, y = rs('st', i, 2) * 760, len = (120 + rnd('st', i, 3) * 380) * env, th = 8 + rnd('st', i, 4) * 26;
      const x = ((rnd('st', i, 5) * 3000 + (T - t0) * sp) % 3000) - 1500, gold = rnd('st', i, 6) < 0.4;
      const g = ctx.createLinearGradient(x - len, 0, x, 0); const c = gold ? PAL.brand400 : WHITE; g.addColorStop(0, hexA(c, 0)); g.addColorStop(1, hexA(c, (0.35 + rnd('st', i, 7) * 0.6) * env));
      ctx.strokeStyle = g; ctx.lineWidth = th; ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
  }
  function sweep(T, t0, dur = 0.7) {       // macro pass of a huge soft bar, used as a transition
    const k = prog(T, t0, dur); if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.translate(540, 540); ctx.rotate(-Math.PI / 4); ctx.filter = 'blur(18px)';
    const x = lerp(-1900, 1900, ease.inOut(k)); ctx.fillStyle = hexA(WHITE, 0.85); L.rr(ctx, x - 600, -330, 1200, 300, 150); ctx.fill();
    ctx.fillStyle = hexA(PAL.brand400, 0.8); L.rr(ctx, x - 900, 60, 1100, 260, 130); ctx.fill(); ctx.restore();
  }
  function words(T, t0, line, y, size, o = {}) {      // word by word, right to left, each rising in over 6 frames
    const f = { size, weight: 700 }, w = L.measure(ctx, line, f);
    L.wordBoxes(ctx, line, 540 + w / 2, f).forEach((b, i) => {
      const k = ease.outCubic(prog(T, t0 + i * (o.step ?? 0.22), 0.2)) * (o.out != null ? 1 - prog(T, o.out + i * 0.04, 0.2) : 1); if (k <= 0) return;
      L.txt(ctx, b.word, b.x, y + (1 - k) * 18, { ...f, align: 'right', dir: 'rtl', color: o.gold && o.gold.includes(b.word) ? PAL.brand400 : WHITE, alpha: k });
    });
  }

  TZ.draw = (T) => {
    T = clamp(Math.round(T * FPS) / FPS, 0, DUR - 1e-4); FILM.bf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    bg(T);
    // 1. the code as people know it: a paper tile, a stack of books (0 to 2.7)
    if (T < 2.75) {
      const kin = ease.outBack(prog(T, 0.3, 0.35), 0.12), z = prog(T, 2.15, 0.6), s = 320 * kin * (1 + prog(T, 0.3, 2) * 0.12) * (1 + ease.inCubic(z) * 9);
      if (kin > 0) {
        ctx.save(); ctx.filter = z > 0 ? `blur(${(z * 26).toFixed(1)}px)` : 'none'; ctx.globalAlpha = 1 - ease.inCubic(prog(T, 2.5, 0.25));
        ctx.shadowColor = hexA(PAL.hero, 0.5); ctx.shadowBlur = 80; L.rr(ctx, 540 - s / 2, 520 - s / 2, s, s, s * 0.22); ctx.fillStyle = PAL.brand50; ctx.fill(); ctx.shadowBlur = 0;
        const u = s / 320; ctx.translate(540, 520); ctx.scale(u, u);
        [[-92, 34, 184, PAL.spineSlate], [-80, -2, 168, PAL.spineStone], [-96, -38, 176, PAL.spineSlate], [-84, -74, 172, PAL.hero]].forEach(([x, y, w, c]) => { ctx.fillStyle = c; L.rr(ctx, x, y - 30, w, 30, 5); ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.stroke(); });
        L.txt(ctx, 'كود البناء السعودي', 0, 112, { size: 27, weight: 700, color: PAL.ink });
        ctx.restore();
      }
    }
    // 2. thousands of pages rush past; one line is found (2.6 to 5.3)
    streaks(T, 2.7, 5.0);
    if (T >= 2.6 && T < 5.3) {
      const k = ease.outExpo(prog(T, 2.6, 0.6)), s = lerp(60, 250, k) * (1 + prog(T, 2.6, 2.7) * 0.25), found = prog(T, 4.2, 0.3);
      glyph(540, 520, s, { gold: found, grow: prog(T, 2.6, 0.9), rot: lerp(-0.5, 0, k) });
      const r = prog(T, 4.2, 0.7); if (r > 0 && r < 1) { ctx.strokeStyle = hexA(PAL.brand400, 1 - r); ctx.lineWidth = 5 * (1 - r) + 1; ctx.beginPath(); ctx.arc(540, 520, 120 + ease.outCubic(r) * 380, 0, 7); ctx.stroke(); }
    }
    // 3. it becomes the assistant: ask, and the answer comes with its clause (5.3 to 8.8)
    if (T >= 5.3 && T < 8.9) {
      const a = 1 - prog(T, 8.6, 0.3), back = ease.inOut(prog(T, 5.95, 0.6)), tin = ease.outBack(prog(T, 5.3, 0.3), 0.1);
      ctx.save(); ctx.globalAlpha = a;
      // phone
      const px = 250, py = lerp(1200, 150, back), pw = 580, ph = 1100;
      ctx.save(); ctx.globalAlpha *= back; L.rr(ctx, px, py, pw, ph, 78); ctx.fillStyle = '#0C0F15'; ctx.fill(); ctx.lineWidth = 5; const sg = ctx.createLinearGradient(px, py, px + pw, py + 500); sg.addColorStop(0, hexA(WHITE, 0.55)); sg.addColorStop(1, hexA(PAL.hero, 0.25)); ctx.strokeStyle = sg; ctx.stroke();
      L.rr(ctx, px + 215, py + 26, 150, 34, 17); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
      const ts = lerp(300, 86, back), tx = lerp(540, px + pw - 96, back), ty = lerp(520, py + 132, back);
      tile(tx, ty, ts * tin);
      if (back > 0.9) {
        L.txt(ctx, 'اسأل الكتاب', px + pw - 156, py + 144, { size: 30, weight: 700, color: WHITE, align: 'right', alpha: prog(T, 6.5, 0.2) });
        ctx.strokeStyle = hexA(WHITE, 0.12 * prog(T, 6.5, 0.2)); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 30, py + 200); ctx.lineTo(px + pw - 30, py + 200); ctx.stroke();
        const q = ease.outBack(prog(T, 6.7, 0.2), 0.08);           // the question, from the right (the asker)
        if (q > 0) L.chip(ctx, 'ما الحد الأدنى لعرض الدرج؟', px + pw - 250, py + 280, { size: 27, weight: 500, fill: PAL.hero, color: PAL.inkStrong, outline: null, scale: q, h: 70, r: 26, padX: 24 });
        if (T >= 7.1 && T < 7.6) for (let i = 0; i < 3; i++) { ctx.fillStyle = hexA(WHITE, 0.3 + 0.6 * Math.max(0, Math.sin((T - 7.1) * 14 - i * 0.9))); ctx.beginPath(); ctx.arc(px + 70 + i * 26, py + 380, 8, 0, 7); ctx.fill(); }
        const an = ease.outCubic(prog(T, 7.6, 0.3));               // the answer card: text lines, the found line, its clause
        if (an > 0) {
          ctx.save(); ctx.globalAlpha *= an; ctx.translate(0, (1 - an) * 30);
          L.rr(ctx, px + 36, py + 350, pw - 110, 330, 28); ctx.fillStyle = '#1A2029'; ctx.fill(); ctx.strokeStyle = hexA(WHITE, 0.16); ctx.lineWidth = 2; ctx.stroke();
          [[0.92, 0], [0.8, 1], [0.86, 0], [0.5, 0]].forEach(([f, g], i) => { const bw = (pw - 180) * f * clamp(prog(T, 7.7 + i * 0.12, 0.25)); if (bw <= 0) return; ctx.fillStyle = g ? PAL.brand400 : hexA(WHITE, 0.55); L.rr(ctx, px + pw - 110 - bw, py + 392 + i * 40, bw, 16, 8); ctx.fill(); });
          const c = ease.outBack(prog(T, 8.1, 0.2), 0.1);
          if (c > 0) { L.chip(ctx, 'البند ' + FILM.slot(FILM.CFG.CLAUSE), px + pw - 190, py + 590, { size: 24, weight: 600, fill: PAL.brand400, color: PAL.inkStrong, outline: null, scale: c }); L.chip(ctx, 'الصفحة الأصلية من الكتاب', px + 200, py + 590, { size: 21, weight: 500, fill: null, color: WHITE, outline: hexA(WHITE, 0.4), outlineW: 1.5, scale: c, padX: 16 }); }
          ctx.restore();
        }
      }
      ctx.restore();
    }
    // 4. the line (8.7 to 12.2)
    sweep(T, 8.5);
    if (T >= 8.9 && T < 12.3) { words(T, 9.0, 'من آلاف الصفحات..', 510, 60, { out: 11.8 }); words(T, 9.9, 'إلى إجابة واحدة، بمرجعها', 606, 60, { out: 11.9, gold: ['بمرجعها'] }); }
    // 5. end lockup (12.2 to 16)
    sweep(T, 11.9);
    if (T >= 12.3) {
      const k = ease.outBack(prog(T, 12.3, 0.35), 0.1), up = ease.inOut(prog(T, 13.0, 0.5));
      tile(540, lerp(520, 330, up), lerp(300, 190, up) * k);
      const a1 = prog(T, 13.3, 0.3), a2 = prog(T, 13.7, 0.3), a3 = prog(T, 14.1, 0.3);
      if (a1 > 0) { ctx.save(); ctx.globalAlpha = a1; O.logoLockup(ctx, 540, 530, 84, WHITE); O.byAisc(ctx, 540, 608, 24, hexA(WHITE, 0.8)); ctx.restore(); }
      L.txt(ctx, 'افهم كود البناء السعودي، وتنقّل فيه', 540, 690, { size: 40, weight: 600, color: WHITE, alpha: a2 });
      L.txt(ctx, 'بالذكاء الاصطناعي', 540, 752, { size: 40, weight: 700, color: PAL.brand400, alpha: a2 });
      L.txt(ctx, 'emtithal.aisc.sa', 540, 838, { size: 30, weight: 600, color: hexA(WHITE, 0.85), alpha: a3 });
      L.txt(ctx, 'يساعدك امتثال على قراءة كود البناء السعودي وفهمه،', 540, 978, { size: 19, color: hexA(WHITE, 0.55), alpha: a3 });
      L.txt(ctx, 'ولا يغني عن المهندس المرخّص، ولا يمثّل اعتماداً رسمياً.', 540, 1010, { size: 19, color: hexA(WHITE, 0.55), alpha: a3 });
    }
    if (FILM.CFG.draft) L.chip(ctx, 'مسودة · DRAFT', 110, 44, { size: 18, weight: 600, fill: null, color: hexA(WHITE, 0.6), outline: hexA(WHITE, 0.4), outlineW: 1.5, padX: 14 });
    const fo = prog(T, 15.6, 0.4); if (fo > 0) { ctx.fillStyle = `rgba(7,9,12,${fo})`; ctx.fillRect(0, 0, W, H); }
  };

  // ---- sound: effects only (no music): whooshes on the transitions, bells on the finds ----
  TZ.renderAudio = (ac, when = 0) => {
    const at = (T) => when + T, out = ac.createGain(); out.gain.value = 0.8; const lim = ac.createDynamicsCompressor(); lim.threshold.value = -8; lim.ratio.value = 8; out.connect(lim); lim.connect(ac.destination);
    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); { const d = nb.getChannelData(0), r = L.rng('tz'); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const tone = (T, f, dur, g, o = {}) => { const os = ac.createOscillator(), gg = ac.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, at(T)); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, at(T + dur)); gg.gain.setValueAtTime(0.0001, at(T)); gg.gain.linearRampToValueAtTime(g, at(T + (o.a ?? 0.006))); gg.gain.exponentialRampToValueAtTime(0.0001, at(T + (o.a ?? 0.006) + dur)); let n = gg; if (o.lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; gg.connect(f2); n = f2; } os.connect(gg); n.connect(out); os.start(at(T)); os.stop(at(T + dur + (o.a ?? 0) + 0.1)); };
    const whoosh = (T, dur, g, f0 = 300, f1 = 4000) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(), gg = ac.createGain(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(f0, at(T)); f.frequency.exponentialRampToValueAtTime(f1, at(T + dur * 0.6)); f.frequency.exponentialRampToValueAtTime(f0 * 2, at(T + dur)); gg.gain.setValueAtTime(0.0001, at(T)); gg.gain.exponentialRampToValueAtTime(g, at(T + dur * 0.55)); gg.gain.exponentialRampToValueAtTime(0.0001, at(T + dur)); s.connect(f); f.connect(gg); gg.connect(out); s.start(at(T)); s.stop(at(T + dur + 0.05)); };
    const bell = (T, n, g = 0.14, dur = 1.4) => { tone(T, midi(n), dur, g); tone(T, midi(n) * 2.76, dur * 0.3, g * 0.3); };
    const pad = (T, notes, dur, g) => notes.forEach((n) => [-6, 6].forEach((d) => { const os = ac.createOscillator(), gg = ac.createGain(), f = ac.createBiquadFilter(); os.type = 'sawtooth'; os.frequency.value = midi(n); os.detune.value = d; f.type = 'lowpass'; f.frequency.setValueAtTime(300, at(T)); f.frequency.linearRampToValueAtTime(900, at(T + dur * 0.5)); f.frequency.linearRampToValueAtTime(400, at(T + dur)); gg.gain.setValueAtTime(0.0001, at(T)); gg.gain.linearRampToValueAtTime(g, at(T + dur * 0.3)); gg.gain.setValueAtTime(g, at(T + dur * 0.7)); gg.gain.linearRampToValueAtTime(0.0001, at(T + dur)); os.connect(f); f.connect(gg); gg.connect(out); os.start(at(T)); os.stop(at(T + dur + 0.05)); }));
    bell(0.3, 74, 0.12); tone(0.3, 110, 0.3, 0.3, { to: 55 });
    whoosh(2.0, 0.9, 0.35); for (let i = 0; i < 18; i++) { whoosh(2.8 + i * 0.12, 0.3, 0.05 + (i % 3) * 0.02, 1200 + i * 90, 5000); }
    bell(4.2, 86, 0.16); bell(4.22, 93, 0.1); tone(4.2, 220, 0.2, 0.3, { to: 150 });
    tone(5.3, 120, 0.25, 0.4, { to: 50 }); whoosh(5.8, 0.7, 0.14, 300, 2000);
    tone(6.7, 520, 0.06, 0.14, { to: 900 }); for (let i = 0; i < 4; i++) tone(7.1 + i * 0.12, 1800, 0.02, 0.05);
    bell(7.6, 81, 0.12); bell(8.1, 86, 0.14); bell(8.12, 90, 0.08);
    whoosh(8.4, 0.9, 0.3);
    whoosh(11.8, 0.9, 0.3); tone(12.3, 110, 0.4, 0.45, { to: 45 });
    bell(12.3, 86, 0.1, 1.2);
    return out;
  };
  TZ.offlineWav = async () => {
    const ac = new OfflineAudioContext(2, 48000 * DUR, 48000); TZ.renderAudio(ac, 0); const buf = await ac.startRendering(), a = buf.getChannelData(0), b = buf.getChannelData(1), o = new Int16Array(buf.length * 2);
    for (let i = 0; i < buf.length; i++) { const fade = Math.min(1, (buf.length - i) / 14400); o[i * 2] = Math.max(-1, Math.min(1, a[i] * fade)) * 32767; o[i * 2 + 1] = Math.max(-1, Math.min(1, b[i] * fade)) * 32767; }
    let s = ''; const u = new Uint8Array(o.buffer); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s);
  };
  TZ.frameBlob = (i) => new Promise((res) => { TZ.draw(i / FPS); canvas.toBlob((b) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(b); }, 'image/png'); });
  TZ.ready = (async () => { await FILM.BRAND.load(); await Promise.all(['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 40px "Noto Kufi Arabic"`, 'امتثال')).concat([document.fonts.load('600 40px "Inter"', 'Ag0')])); TZ.draw(0); return true; })();
  // player: click or space to play
  let ac = null, t0 = 0, playing = false;
  const tick = () => { if (!playing) return; const T = ac.currentTime - t0; if (T >= DUR) { playing = false; ac.close(); TZ.draw(0); return; } TZ.draw(Math.max(0, T)); requestAnimationFrame(tick); };
  const toggle = () => { if (window.__render) return; if (playing) { playing = false; ac.close(); return; } ac = new AudioContext(); TZ.renderAudio(ac, ac.currentTime + 0.1); t0 = ac.currentTime + 0.1; playing = true; tick(); };
  canvas.addEventListener('click', toggle); addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
})();
