// Builds and renders the two UI videos from the captured keyframes in ui/shots.
//   node tools/ui-video.cjs walk|system [--sheet] [--at 1.2,3.4] [--render]
const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..'); const name = process.argv[2]; const b64 = (p) => fs.readFileSync(p).toString('base64');
const faces = [...[400, 500, 600, 700].map((w) => ['Noto Kufi Arabic', w, `node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-${w}-normal.woff2`]), ...[400, 600].map((w) => ['Inter', w, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff2`])];
const css = faces.map(([f, w, p]) => `@font-face{font-family:"${f}";font-weight:${w};src:url(data:font/woff2;base64,${b64(path.join(root, p))}) format("woff2");}`).join('\n');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'ui/shots/manifest.json'), 'utf8'));
const src = fs.readFileSync(path.join(root, 'ui', name + '.js'), 'utf8'); const size = (src.match(/SIZE = \[(\d+), (\d+)\]/) || [0, 1080, 1080]).slice(1);
const imgs = {}; for (const s of manifest) imgs[s.id] = 'data:image/png;base64,' + b64(path.join(root, 'ui/shots', s.file));
const js = ['src/config.js', 'src/brand.js', 'src/lib.js', 'src/objects.js'].map((f) => `<script>\n${fs.readFileSync(path.join(root, f), 'utf8')}\n</script>`).join('\n');
const out = path.join(root, `emtithal-ui-${name}.html`);
fs.writeFileSync(out, `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>امتثال</title><style>${css}
html,body{margin:0;height:100%;background:#0C0F15;overflow:hidden}canvas{display:block;margin:0 auto;max-height:100vh;max-width:100vw}</style></head><body><canvas id="film" width="${size[0]}" height="${size[1]}"></canvas>${js}
<script>FILM.UI_MANIFEST=${JSON.stringify(manifest)};FILM.UI_IMAGES=${JSON.stringify(imgs)};</script><script>\n${fs.readFileSync(path.join(root, 'ui/common.js'), 'utf8')}\n</script><script>\n${src}\n</script></body></html>`);
(async () => {
  const b = await chromium.launch(); const open = async () => { const p = await b.newPage(); p.on('pageerror', (e) => console.error('PAGE ERROR', e.message)); await p.goto('file://' + out); await p.evaluate(() => { window.__render = true; return FILM.V.ready; }); return p; };
  const p = await open(); const V = await p.evaluate(() => ({ DUR: FILM.V.DUR, FPS: FILM.V.FPS }));
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  if (process.argv.includes('--sheet')) {
    const img = await p.evaluate(() => { const V = FILM.V, cv = document.getElementById('film'), n = 24, s = 300, h = Math.round(s * cv.height / cv.width), c = document.createElement('canvas'); c.width = 8 * s; c.height = 3 * h; const g = c.getContext('2d'); for (let i = 0; i < n; i++) { V.draw((i + 0.5) * V.DUR / n); g.drawImage(cv, (i % 8) * s, Math.floor(i / 8) * h, s, h); } return c.toDataURL('image/jpeg', 0.85).split(',')[1]; });
    fs.writeFileSync(path.join(root, `build/sheet-ui-${name}.jpg`), Buffer.from(img, 'base64'));
  }
  const at = process.argv.indexOf('--at'); if (at > 0) for (const T of process.argv[at + 1].split(',')) { const im = await p.evaluate((T) => { FILM.V.draw(T); return document.getElementById('film').toDataURL('image/jpeg', 0.9).split(',')[1]; }, +T); fs.writeFileSync(path.join(root, `build/ui-${name}-${T}.jpg`), Buffer.from(im, 'base64')); }
  if (process.argv.includes('--render')) {
    const dir = path.join(root, 'build/frames-ui'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(root, 'build/ui.s16'), Buffer.from(await p.evaluate(() => FILM.UI.offlineWav(FILM.V.DUR, FILM.V.sound)), 'base64'));
    const total = Math.round(V.DUR * V.FPS); let next = 0;
    await Promise.all([0, 1, 2].map(async (w) => { const q = w ? await open() : p; while (next < total) { const i = next++; fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), Buffer.from(await q.evaluate((i) => FILM.UI.frameBlob(document.getElementById('film'), FILM.V.draw, i / FILM.V.FPS), i), 'base64')); } }));
    const mp4 = path.join(root, `exports/emtithal-ui-${name}.mp4`);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(V.FPS), '-i', path.join(dir, '%04d.png'), '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', path.join(root, 'build/ui.s16'), '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '48000', '-shortest', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
    fs.rmSync(dir, { recursive: true, force: true }); console.log(mp4);
  }
  await b.close();
})();
