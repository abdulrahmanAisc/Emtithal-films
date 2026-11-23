// Frame-exact render (brief 14.3): headless Chromium seeks frame i as t = i / 24, the score is rendered offline
// with the voice mixed in, and ffmpeg muxes.
//   node tools/render.cjs                  draft master + clean + phone + stems + cover + SRT
//   node tools/render.cjs --final          refuses unless every ledger item in src/config.js / src/brand.js is confirmed
//   node tools/render.cjs --only master    (master | clean)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..'); const EX = path.join(root, 'exports');
const args = process.argv.slice(2); const final = args.includes('--final'); const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const ff = (a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: 'inherit' });
(async () => {
  execFileSync('node', [path.join(__dirname, 'build.cjs')], { stdio: 'inherit' });
  fs.mkdirSync(path.join(EX, 'audio'), { recursive: true });
  const url = 'file://' + path.join(root, 'emtithal-ask-the-code.html');
  const browser = await chromium.launch();
  const open = async (q) => { const p = await browser.newPage(); p.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); process.exitCode = 1; }); await p.goto(url + q); await p.evaluate(() => { window.__render = true; return FILM.ready; }); return p; };
  const p0 = await open(final ? '?draft=0' : '');
  const cfg = await p0.evaluate(() => ({ cfg: FILM.CFG, brand: !!(FILM.BRAND.emtithal && FILM.BRAND.emtithal.img) }));
  if (final) {
    const miss = []; if (!cfg.cfg.nConfirmed) miss.push('{N} (CFG.nConfirmed)'); for (const k of ['CODE', 'CLAUSE', 'QUOTE']) if (cfg.cfg[k] == null) miss.push('CFG.' + k); if (!cfg.brand) miss.push('logo paths (src/brand.js)');
    if (miss.length) { console.error('FINAL RENDER BLOCKED. Unconfirmed: ' + miss.join(', ')); process.exit(2); }
  }
  // audio: mix and stems
  if (!only) for (const [name, mix] of [['mix', null], ['vo', { music: 0, sfx: 0, amb: 0, vo: 1 }], ['music', { music: 1, sfx: 0, amb: 0, vo: 0 }], ['sfx', { music: 0, vo: 0 }]]) {
    const b64 = await p0.evaluate((m) => FILM.offlineWav(m), mix); const raw = path.join(root, 'build', name + '.s16');
    fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
    ff(['-f', 's16le', '-ar', '48000', '-ac', '2', '-i', raw, path.join(EX, 'audio', name + '.wav')]); fs.unlinkSync(raw);
    console.log('audio', name);
  }
  await p0.close();
  const frames = async (tag, q) => {
    const dir = path.join(root, 'build', 'frames-' + tag); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const W = 4, total = 960; let next = 0;
    await Promise.all(Array.from({ length: W }, async () => { const p = await open(q); while (next < total) { const i = next++; const b = await p.evaluate((i) => FILM.frameBlob(i), i); fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), Buffer.from(b, 'base64')); if (i % 120 === 0) console.log(tag, 'frame', i); } await p.close(); }));
    return dir;
  };
  const mux = (dir, out, extra = []) => ff(['-framerate', '24', '-i', path.join(dir, '%04d.png'), '-i', path.join(EX, 'audio', 'mix.wav'), ...extra, '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '48000', '-shortest', '-movflags', '+faststart', out]);
  const base = (final ? '?draft=0' : '?');
  if (!only || only === 'master') {
    const d = await frames('master', base); const out = path.join(EX, 'emtithal-ask-the-code.mp4'); mux(d, out);
    fs.copyFileSync(path.join(d, '0048.png'), path.join(EX, 'emtithal-ask-the-code-cover.png'));
    ff(['-i', out, '-vf', 'scale=720:1280', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(EX, 'emtithal-ask-the-code-phone.mp4')]);
  }
  if (!only || only === 'clean') { const d = await frames('clean', base + (base.length > 1 ? '&' : '') + 'subs=0'); mux(d, path.join(EX, 'emtithal-ask-the-code-clean.mp4')); }
  const srt = fs.readFileSync(path.join(root, 'emtithal-ask-the-code-subtitles-ar.srt'), 'utf8').replace('{N}', String(cfg.cfg.N));
  fs.writeFileSync(path.join(EX, 'emtithal-ask-the-code-subtitles-ar.srt'), srt);
  await browser.close(); console.log('done');
})();
