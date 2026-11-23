// Score, sound effects and voice mix (brief section 11). Everything except the voice is synthesised in Web Audio.
// FILM.renderAudio(ac, startT, voBuffer, mix, when) schedules the whole film into any BaseAudioContext.
//   mix: { music, sfx, amb, vo } gains (1 = on, 0 = off) so the same code renders each stem.
(function () {
  const L = FILM.lib;
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const dB = (d) => Math.pow(10, d / 20);

  FILM.renderAudio = function (ac, startT = 0, voBuffer = null, mix = null, when = 0) {
    mix = Object.assign({ music: 1, sfx: 1, amb: 1, vo: 1 }, FILM.CFG.mix || {}, mix || {});
    const at = (T) => when + (T - startT), live = (T) => T >= startT - 1e-6;
    const master = ac.createGain(); master.gain.value = 0.75;
    const lim = ac.createDynamicsCompressor(); lim.threshold.value = -8; lim.ratio.value = 8; lim.attack.value = 0.003; lim.release.value = 0.12; lim.knee.value = 6;
    master.connect(lim); lim.connect(ac.destination);
    const bus = (g) => { const n = ac.createGain(); n.gain.value = g; return n; };
    const music = bus(1), sfx = bus(1), amb = bus(1), vo = bus(1), pre = bus(1);          // pre: the reveal pre-roll, never ducked or stopped
    const mOut = bus(mix.music * 1.5), sOut = bus(mix.sfx * 1.1), aOut = bus(mix.amb), vOut = bus(mix.vo * 1.5);
    const eq = ac.createBiquadFilter(); eq.type = 'peaking'; eq.frequency.value = 2000; eq.Q.value = 0.7; eq.gain.value = 0;
    music.connect(eq); eq.connect(mOut); mOut.connect(master); sfx.connect(sOut); pre.connect(sOut); sOut.connect(master); amb.connect(aOut); aOut.connect(master); vOut.connect(master);

    // seeded noise (no Math.random anywhere)
    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); { const d = nb.getChannelData(0), r = L.rng('noise'); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }

    // ---- ducking under every VO line (11.2), and the trust-beat silence ----
    const ramp = (p, T, v, dur) => { if (!live(T)) { p.setValueAtTime(v, Math.max(0, at(Math.max(T + dur, startT)))); return; } p.setValueAtTime(p._v ?? p.value, at(T)); p.linearRampToValueAtTime(v, at(T + dur)); p._v = v; };
    if (mix.vo > 0) FILM.SUBS.forEach((c, i) => {                       // no voice in the mix, nothing to duck under
      const a = c.n === 1 ? 0.25 : c.in, z = c.out, nx = FILM.SUBS[i + 1];
      const rel = Math.min(0.25, nx ? nx.in - 0.05 - z : 0.25);                  // never let a release run into the next duck
      const prevOpen = i > 0 && c.in - 0.05 - FILM.SUBS[i - 1].out < 0.06;
      if (!prevOpen) { ramp(music.gain, a - 0.04, dB(-9), 0.04); ramp(sfx.gain, a - 0.04, dB(c.n === 1 ? -9 : -4), 0.04); ramp(eq.gain, a - 0.04, -3, 0.04); }
      if (rel >= 0.06) { ramp(music.gain, z, 1, rel); ramp(sfx.gain, z, 1, rel); ramp(eq.gain, z, 0, rel); }
    });
    const hush = bus(1), hushS = bus(1); mOut.disconnect(); mOut.connect(hush); hush.connect(master); sOut.disconnect(); sOut.connect(hushS); hushS.connect(master);
    for (const h of [hush, hushS]) { ramp(h.gain, 7.75, 0, 0.012); ramp(h.gain, 7.995, 1, 0.005); ramp(h.gain, 32.97, 0, 0.03); ramp(h.gain, 33.995, 1, 0.005); }
    const preOut = bus(mix.sfx * 1.1); pre.disconnect(); pre.connect(preOut); preOut.connect(master);

    // ---- voices ----
    const env = (g, T, a, d, peak, sus = 0.0001) => { g.gain.setValueAtTime(0.0001, at(T)); g.gain.linearRampToValueAtTime(peak, at(T + a)); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), at(T + a + d)); };
    const tone = (out, T, f, dur, o = {}) => {
      if (!live(T)) return;
      const os = ac.createOscillator(), g = ac.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, at(T));
      if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, at(T + (o.glide ?? dur)));
      env(g, T, o.attack ?? 0.004, dur, o.gain ?? 0.3); os.connect(g);
      if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; g.connect(fl); fl.connect(out); } else g.connect(out);
      os.start(at(T)); os.stop(at(T + (o.attack ?? 0.004) + dur + 0.05));
    };
    const noise = (out, T, dur, o = {}) => {
      if (!live(T)) return;
      const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f ?? 3000, at(T)); f.Q.value = o.q ?? 1;
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, at(T + dur));
      if (o.swell) { g.gain.setValueAtTime(0.0001, at(T)); g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, at(T + dur * 0.92)); g.gain.linearRampToValueAtTime(0.0001, at(T + dur)); }
      else env(g, T, o.attack ?? 0.003, dur, o.gain ?? 0.3);
      s.connect(f); f.connect(g); g.connect(out); s.start(at(T), (L.hash('n', T) % 1000) / 1000); s.stop(at(T + dur + 0.06));
    };
    const bell = (out, T, f, dur, gain = 0.2, ratio = 3.5, idx = 2) => {
      if (!live(T)) return;
      const c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
      c.frequency.value = f; m.frequency.value = f * ratio; mg.gain.setValueAtTime(f * idx, at(T)); mg.gain.exponentialRampToValueAtTime(1, at(T + dur * 0.6));
      m.connect(mg); mg.connect(c.frequency); env(g, T, 0.006, dur, gain); c.connect(g); g.connect(out);
      c.start(at(T)); m.start(at(T)); c.stop(at(T + dur + 0.1)); m.stop(at(T + dur + 0.1));
    };
    // instruments
    const piano = (T, n, dur = 1.2, g = 0.22) => { tone(music, T, midi(n), dur, { type: 'triangle', gain: g, attack: 0.008, lp: 1400 }); tone(music, T, midi(n) * 2, dur * 0.5, { gain: g * 0.25, attack: 0.008 }); };
    const marimba = (T, n, g = 0.2) => { tone(music, T, midi(n), 0.35, { gain: g }); tone(music, T, midi(n) * 4, 0.07, { gain: g * 0.35 }); };
    const pizz = (T, n, g = 0.14) => tone(music, T, midi(n), 0.2, { type: 'sawtooth', gain: g, lp: 1500 });
    const pad = (T, notes, dur, g = 0.05, lp = 700) => { for (const n of notes) for (const det of [-5, 6]) { if (!live(T)) continue; const os = ac.createOscillator(), gg = ac.createGain(), fl = ac.createBiquadFilter(); os.type = 'sawtooth'; os.frequency.value = midi(n); os.detune.value = det; fl.type = 'lowpass'; fl.frequency.value = lp; gg.gain.setValueAtTime(0.0001, at(T)); gg.gain.linearRampToValueAtTime(g, at(T + Math.min(0.4, dur * 0.3))); gg.gain.setValueAtTime(g, at(T + dur - 0.25)); gg.gain.linearRampToValueAtTime(0.0001, at(T + dur)); os.connect(fl); fl.connect(gg); gg.connect(music); os.start(at(T)); os.stop(at(T + dur + 0.05)); } };
    const sub = (T, n, dur, g = 0.26) => tone(music, T, midi(n), dur, { gain: g, attack: 0.01 });
    const kick = (T, g = 0.5) => tone(music, T, 110, 0.14, { to: 45, glide: 0.09, gain: g });
    const hat = (T, g = 0.05) => noise(music, T, 0.025, { type: 'highpass', f: 6000, gain: g });

    // ---- sound vocabulary (11.3) ----
    const S = {
      bookThud: (T, k = 0, deep = false) => { tone(sfx, T, deep ? 70 : 80 + k * 2, deep ? 0.3 : 0.14, { to: deep ? 36 : 45, glide: 0.12, gain: deep ? 0.9 : 0.6 }); noise(sfx, T, 0.09, { type: 'lowpass', f: 500, gain: 0.5 }); tone(sfx, T, 400 + k * 8, 0.04, { gain: 0.22 }); },
      foundChime: (T, step = 0) => { const r = Math.pow(2, [0, 2, 4][step] / 12); bell(sfx, T, 880 * r, 0.8, 0.16); bell(sfx, T + 0.02, 1318.5 * r, 0.8, 0.11); },
      tick: (T, k = 0) => noise(sfx, T, 0.012, { f: 3000 + k * 350, q: 4, gain: 0.3 }),
      matchLock: (T, g = 1) => { noise(sfx, T, 0.015, { f: 4000, q: 3, gain: 0.5 * g }); tone(sfx, T, 220, 0.14, { to: 160, gain: 0.5 * g }); bell(sfx, T + 0.01, midi(86), 0.7, 0.2 * g); },
      frameSnap: (T) => { noise(sfx, T, 0.02, { f: 2500, q: 3, gain: 0.5 }); tone(sfx, T, 300, 0.05, { to: 220, gain: 0.4 }); },
      rulerSnap: (T, out = sfx, g = 1) => { noise(out, T, 0.014, { f: 1800, q: 4, gain: 0.5 * g }); tone(out, T, 160, 0.04, { gain: 0.35 * g }); },
      pageFlip: (T, g = 0.22, dark = false) => { const d = dark ? 0.22 : 0.07; noise(sfx, T, d, { f: dark ? 1600 : 2400, to: dark ? 2600 : 4800, q: 0.9, gain: g }); noise(sfx, T + d * 0.5, d * 0.6, { f: 3500, q: 1.2, gain: g * 0.5 }); },
      pageRiffle: (T, dur, g = 0.1, slow = false) => { const n = Math.round(dur * 22); for (let i = 0; i < n; i++) { const u = i / n; noise(sfx, T + dur * (slow ? Math.pow(u, 0.6) : u), 0.03, { f: 2600 + L.rnd('rf', T, i) * 2200, q: 1.5, gain: g * (slow ? 1 - u * 0.7 : 0.6 + u * 0.4) }); } },
      pencil: (T, dur = 0.1, g = 0.12) => noise(sfx, T, dur, { f: 2000, to: 4000, q: 1.2, gain: g, attack: 0.01 }),
      keyTap: (T, g = 0.2) => { noise(sfx, T, 0.012, { f: 3000, q: 3, gain: g }); tone(sfx, T, 700, 0.015, { gain: g * 0.5 }); },
      tap: (T) => { noise(sfx, T, 0.006, { type: 'highpass', f: 4000, gain: 0.4 }); tone(sfx, T, 180, 0.05, { to: 120, gain: 0.45 }); },
      confirm: (T, g = 0.14) => { tone(sfx, T + 0.03, midi(86), 0.06, { gain: g }); tone(sfx, T + 0.09, midi(93), 0.1, { gain: g }); },
      pop: (T, k = 0) => tone(sfx, T, 520 + k * 60, 0.05, { to: 900 + k * 60, glide: 0.03, gain: 0.16 }),
      selectSweep: (T) => noise(sfx, T, 0.35, { f: 1500, to: 3000, q: 2, gain: 0.14, attack: 0.05 }),
      nodeBell: (T, n) => bell(sfx, T, midi(n), 0.9, 0.14, 2.76, 1.2),
      clockTick: (T, tock) => { noise(sfx, T, 0.012, { f: 3500, q: 5, gain: 0.3 }); tone(sfx, T, tock ? 800 : 900, 0.025, { gain: 0.22 }); },
      whoosh: (T, dur = 0.4, g = 0.2) => noise(sfx, T - dur * 0.4, dur, { f: 500, to: 3200, q: 0.8, gain: g, attack: dur * 0.4 }),
      hit: (T, k) => { tone(sfx, T, 80, 0.22, { to: 42, glide: 0.14, gain: 0.7 }); noise(sfx, T, 0.07, { type: 'lowpass', f: 600, gain: 0.4 }); bell(sfx, T, midi([81, 86, 90][k]), 0.9, 0.2); },
    };

    // ---- beds: lamp hum and room tone (amb) ----
    const bed = (T0, T1, f, g) => { const a = Math.max(T0, startT); if (a >= T1) return; const os = ac.createOscillator(), gg = ac.createGain(); os.frequency.value = f; gg.gain.setValueAtTime(0.0001, at(a)); gg.gain.linearRampToValueAtTime(g, at(a + 0.05)); gg.gain.setValueAtTime(g, at(T1 - 0.05)); gg.gain.linearRampToValueAtTime(0.0001, at(T1)); os.connect(gg); gg.connect(amb); os.start(at(a)); os.stop(at(T1 + 0.01)); };
    const air = (T0, T1, g, f = 400) => { const a = Math.max(T0, startT); if (a >= T1) return; const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const fl = ac.createBiquadFilter(), gg = ac.createGain(); fl.type = 'lowpass'; fl.frequency.value = f; gg.gain.setValueAtTime(0.0001, at(a)); gg.gain.linearRampToValueAtTime(g, at(a + 0.1)); gg.gain.setValueAtTime(g, at(T1 - 0.1)); gg.gain.linearRampToValueAtTime(0.0001, at(T1)); s.connect(fl); fl.connect(gg); gg.connect(amb); s.start(at(a)); s.stop(at(T1 + 0.01)); };
    for (const [a, z] of [[0, 2.5], [4, 6.5], [31, 34]]) { bed(a, z, 100, dB(-36) * 2.5); air(a, z, 0.012); }
    air(36.5, 37.5, 0.016, 900); bed(36.5, 37.0, 100, dB(-36) * 2.5);

    // ---- score: 120 bpm, D minor to D major at T 8.0 ----
    // act 1: sparse and tense, a ticking pulse and unresolved suspensions
    for (let T = 0; T < 7.75; T += 0.5) if (T < 4 || T >= 5) hat(T + 0.25, 0.03);
    piano(0, 50, 2, 0.2); piano(0, 57, 2, 0.12); piano(1, 64, 1.5, 0.14); piano(2, 46, 2, 0.18); piano(2.5, 65, 1.2, 0.12); piano(3.5, 67, 1, 0.1);
    pad(0, [38, 57], 4, 0.035, 500); pad(4, [62], 1, 0.04, 600);                 // shot 03: the score thins to a held note
    piano(5, 50, 1, 0.18); piano(5.5, 64, 0.8, 0.14); piano(6, 49, 1, 0.16); piano(6.25, 67, 0.6, 0.12);
    pad(6.5, [50, 56, 61, 64], 1.25, 0.06, 900); for (let i = 0; i < 5; i++) pizz(6.5 + i * 0.25, 62 + i * 3, 0.1);     // tense rising pad
    // the reveal and the groove
    const CH = [[38, [62, 66, 69]], [43, [62, 67, 71]], [47, [62, 66, 71]], [45, [61, 64, 69]]];                          // D, G, Bm, A
    const groove = (T0, T1, lv) => {
      for (let T = T0; T < T1 - 1e-6; T += 0.5) {
        const bar = Math.floor((T - 8) / 2), beat = Math.round(((T - 8) % 2) / 0.5), [root, tri] = CH[((bar % 4) + 4) % 4];
        if (beat === 0 || beat === 2) kick(T, 0.42); if (beat === 1 || beat === 3) S.rulerSnap(T, music, 0.55);
        hat(T, 0.045); hat(T + 0.25, 0.03);
        if (beat === 0) { sub(T, root, 0.9, 0.24); pad(T, tri, 2, 0.035); } if (beat === 2) sub(T + 0.25, root, 0.5, 0.18);
        if (lv >= 1) { pizz(T, tri[beat % 3] - 12, 0.11); pizz(T + 0.25, tri[(beat + 1) % 3], 0.09); }
        if (lv >= 2 && (beat === 1 || beat === 3)) marimba(T + 0.25, tri[(beat + bar) % 3] + 12, 0.1);
        if (lv >= 3 && beat === 0) for (const n of tri) piano(T, n, 1.4, 0.09);
        if (lv >= 4) { marimba(T, tri[(beat * 2) % 3] + 12, 0.12); if (beat === 0) piano(T, root + 12, 1.5, 0.14); }
      }
    };
    for (const n of [50, 57, 62, 66, 69]) piano(8, n, 2.4, 0.14); sub(8, 26, 1.6, 0.3);
    [62, 66, 69, 74].forEach((n, i) => marimba(8 + i * 0.5, n + 12, 0.24));       // the motif, first heard complete
    groove(8, 10.5, 0); groove(10.5, 13.5, 1); groove(13.5, 22.5, 2); groove(22.5, 31, 3);
    for (const n of [62, 66, 69, 74]) piano(27.5, n, 1.6, 0.12);                  // shot 13 resolves into a major chord
    pad(31, [50, 57], 1.9, 0.03, 500);                                            // trust beat: the music thins, then silence from 33.0
    piano(34, 62, 1.2, 0.2);                                                      // one warm note returns
    groove(34.5, 36.5, 4);
    pad(36.5, [50, 57, 66], 1, 0.035);
    for (const n of [38, 50, 57, 62, 66, 69]) piano(37.5, n, 2.4, 0.13); sub(37.5, 26, 2, 0.28); pad(37.5, [50, 57, 62, 66], 2.4, 0.04);
    [62, 66, 69, 74].forEach((n, i) => marimba(37.5 + i * 0.25, n + 12, 0.2));    // the motif again on the end card

    // ---- SFX cue sheet (11.4) ----
    for (let i = 0; i < 7; i++) S.bookThud(i * 0.25, i, i === 6);
    noise(sfx, 1.5, 0.3, { type: 'highpass', f: 5000, gain: 0.12, attack: 0.02 });                                        // paper-dust puff
    S.whoosh(2.5, 0.45, 0.2); for (let i = 0; i < 16; i++) noise(sfx, 2.5 + i * 0.0625, 0.035, { f: 2400 + i * 180, q: 1.5, gain: 0.05 + i * 0.008 }); S.keyTap(3.5, 0.3);
    noise(sfx, 4.25, 0.03, { f: 2800, q: 2, gain: 0.18 });                                                                // a tiny paper tap
    for (let T = 5; T < 6.5 - 1e-6; T += 0.125) S.pageFlip(T, 0.2); [5, 5.5, 6].forEach((T, i) => S.clockTick(T, i % 2));
    for (let T = 6.5; T < 7.75 - 1e-6; T += 0.125) S.pencil(T, 0.1, 0.12);
    noise(pre, 7.5, 0.5, { f: 600, to: 5000, q: 0.7, gain: 0.3, swell: true });                                           // revealSwell: pre-roll into T 8.0
    for (const n of [74, 78, 81, 86]) bell(sfx, 8, midi(n), 1.4, 0.07); S.whoosh(8.0, 0.3, 0.12);
    noise(sfx, 9, 0.16, { f: 700, to: 1400, q: 6, gain: 0.22, attack: 0.03 }); S.confirm(9.5, 0.08);
    for (const [a, z] of [[10.75, 11], [11.5, 12], [12.5, 13]]) for (let T = a; T < z - 1e-6; T += 0.0625) S.keyTap(T, 0.16);
    [11, 12, 13].forEach((T, i) => S.foundChime(T, i));
    [14, 14.25, 14.5].forEach((T, i) => S.pop(T, i)); S.tap(15); S.confirm(15); S.pageRiffle(15.25, 1, 0.07);
    for (let T = 16.5; T < 17 - 1e-6; T += 0.125) S.pencil(T, 0.1, 0.12); S.rulerSnap(17); S.foundChime(17.5, 0);
    S.pageFlip(18, 0.22, true); noise(sfx, 18.5, 0.22, { f: 2600, to: 900, q: 1, gain: 0.12, attack: 0.05 }); S.frameSnap(19);
    const words = FILM.CFG.QUOTE ? FILM.CFG.QUOTE.split(' ').length : (() => { let x = 840, i = 0; while (x > 200) { x -= Math.min(64 + L.rnd('vw', i) * 80, x - 160) + 26; i++; } return i; })();   // same word bars as shot 11 for (let i = 0; i < words; i++) S.tick(20.25 + (i * 1.5) / Math.max(1, words - 1), i); S.matchLock(22);
    S.selectSweep(22.75); [23.5, 23.5625, 23.625, 23.6875, 23.75].forEach((T, i) => S.pop(T, i)); S.tap(24); S.confirm(24);
    for (let i = 0; i < 7; i++) tone(sfx, 24.5 + i * 0.1, midi([86, 85, 83, 81, 78, 76, 74][i]), 0.16, { gain: 0.08 }); for (const n of [62, 66, 69]) bell(sfx, 25.2, midi(n + 12), 0.6, 0.05);
    [25.75, 26.25, 26.75, 27.25, 27.5].forEach((T, i) => S.nodeBell(T, [74, 78, 81, 86, 90][i]));
    S.tap(28.5); S.whoosh(29, 0.5, 0.2); tone(sfx, 30, 140, 0.1, { to: 90, gain: 0.4 }); bell(sfx, 30.01, midi(93), 0.4, 0.08);
    for (let T = 31.5; T < 31.875 - 1e-6; T += 0.0625) S.keyTap(T, 0.16); S.pageRiffle(32, 0.75, 0.07, true);
    [34.5, 35.25, 36].forEach((T, i) => S.hit(T, i));
    noise(sfx, 37, 0.01, { f: 2200, q: 4, gain: 0.4 }); tone(sfx, 37, 500, 0.02, { gain: 0.2 });                          // lamp click
    S.matchLock(38, 0.45);

    // ---- the voice: high-pass 80 Hz, gentle compression, light de-ess, 0.6 s room on the paper plate, dry on blueprint ----
    if (voBuffer && mix.vo > 0) {
      const src = ac.createBufferSource(); src.buffer = voBuffer;
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
      const de = ac.createBiquadFilter(); de.type = 'peaking'; de.frequency.value = 7000; de.Q.value = 2; de.gain.value = -3;
      const cp = ac.createDynamicsCompressor(); cp.ratio.value = 3; cp.threshold.value = -20; cp.attack.value = 0.01; cp.release.value = 0.15;
      src.connect(hp); hp.connect(de); de.connect(cp); cp.connect(vo); vo.connect(vOut);
      const ir = ac.createBuffer(2, Math.round(ac.sampleRate * 0.6), ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch), r = L.rng('ir' + ch); for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
      const cv = ac.createConvolver(); cv.normalize = true; cv.buffer = ir; const send = ac.createGain(); send.gain.value = 0;
      cp.connect(send); send.connect(cv); cv.connect(vOut);
      for (const s of FILM.TIMELINE) if (s.start >= startT) send.gain.setValueAtTime(s.mode === 'SCH' ? 0 : 0.12, at(s.start));
      if (startT > 0) send.gain.setValueAtTime(FILM.shotAt(startT).mode === 'SCH' ? 0 : 0.12, Math.max(0, when));
      src.start(Math.max(0, when), Math.min(startT, voBuffer.duration - 0.01));
    }
    return master;
  };
})();
