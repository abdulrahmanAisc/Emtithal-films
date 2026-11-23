// Audio gate helpers: per-second RMS of each stem, trust-beat silence, clipping.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'emtithal-ask-the-code.html')); await p.evaluate(() => { window.__render = true; return FILM.ready; });
  const r = await p.evaluate(async () => {
    const out = {};
    for (const [name, mix] of [['music', { sfx: 0, amb: 0, vo: 0 }], ['sfx', { music: 0, amb: 0, vo: 0 }], ['amb', { music: 0, sfx: 0, vo: 0 }], ['vo', { music: 0, sfx: 0, amb: 0 }], ['mix', null]]) {
      const ac = new OfflineAudioContext(2, 48000 * 40, 48000); FILM.renderAudio(ac, 0, await FILM.voBuffer(ac), mix); const buf = await ac.startRendering(); const d = buf.getChannelData(0);
      const rms = (a, z) => { let s = 0; for (let i = Math.floor(a * 48000); i < Math.floor(z * 48000); i++) s += d[i] * d[i]; return Math.round(10 * Math.log10(s / ((z - a) * 48000) + 1e-12)); };
      let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
      out[name] = { sec: Array.from({ length: 40 }, (_, i) => rms(i, i + 1)).join(' '), trust: rms(33.05, 33.98), stop: rms(7.78, 7.98), peak: +(20 * Math.log10(pk)).toFixed(1) };
    }
    return out;
  });
  for (const k in r) console.log(k.padEnd(6), 'peak', r[k].peak, '| 7.75 stop', r[k].stop, '| trust 33-34', r[k].trust, '\n   ', r[k].sec);
  await b.close();
})();
