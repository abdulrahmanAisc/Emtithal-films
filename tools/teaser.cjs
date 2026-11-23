// Builds emtithal-teaser.html and (with --render) exports/emtithal-teaser.mp4; --sheet writes build/sheet-teaser.jpg
const fs = require('fs'), path = require('path'); const { execFileSync } = require('child_process'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..'); const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64');
const faces = [...[400, 500, 600, 700].map((w) => ['Noto Kufi Arabic', w, `node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-${w}-normal.woff2`]), ...[400, 600].map((w) => ['Inter', w, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff2`])];
const css = faces.map(([f, w, p]) => `@font-face{font-family:"${f}";font-weight:${w};src:url(data:font/woff2;base64,${b64(p)}) format("woff2");}`).join('\n');
const js = ['src/config.js', 'src/brand.js', 'src/lib.js', 'src/objects.js', 'teaser/teaser.js'].map((f) => `<script>\n${fs.readFileSync(path.join(root, f), 'utf8')}\n</script>`).join('\n');
const out = path.join(root, 'emtithal-teaser.html');
fs.writeFileSync(out, `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>امتثال</title><style>${css}
html,body{margin:0;height:100%;background:#07090C;overflow:hidden}canvas{display:block;margin:0 auto;max-height:100vh;max-width:100vw;aspect-ratio:1}</style></head><body><canvas id="film" width="1080" height="1080"></canvas>${js}</body></html>`);
(async () => {
  const b = await chromium.launch(); const open = async () => { const p = await b.newPage(); p.on('pageerror', (e) => console.error('PAGE ERROR', e.message)); await p.goto('file://' + out); await p.evaluate(() => { window.__render = true; return FILM.TEASER.ready; }); return p; };
  if (process.argv.includes('--sheet')) {
    const p = await open(); const img = await p.evaluate(() => { const c = document.createElement('canvas'), n = 32, s = 270; c.width = 8 * s; c.height = 4 * s; const g = c.getContext('2d'); for (let i = 0; i < n; i++) { FILM.TEASER.draw((i + 0.5) * 16 / n); g.drawImage(document.getElementById('film'), (i % 8) * s, Math.floor(i / 8) * s, s, s); } return c.toDataURL('image/jpeg', 0.85).split(',')[1]; });
    fs.writeFileSync(path.join(root, 'build/sheet-teaser.jpg'), Buffer.from(img, 'base64'));
    const at = process.argv.indexOf('--at'); if (at > 0) for (const T of process.argv[at + 1].split(',')) { const im = await p.evaluate((T) => { FILM.TEASER.draw(T); return document.getElementById('film').toDataURL('image/jpeg', 0.9).split(',')[1]; }, +T); fs.writeFileSync(path.join(root, `build/teaser-${T}.jpg`), Buffer.from(im, 'base64')); }
  }
  if (process.argv.includes('--render')) {
    const dir = path.join(root, 'build/frames-teaser'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.join(root, 'exports'), { recursive: true });
    const p0 = await open(); fs.writeFileSync(path.join(root, 'build/teaser.s16'), Buffer.from(await p0.evaluate(() => FILM.TEASER.offlineWav()), 'base64'));
    let next = 0; await Promise.all([0, 1, 2, 3].map(async () => { const p = await open(); while (next < 480) { const i = next++; fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), Buffer.from(await p.evaluate((i) => FILM.TEASER.frameBlob(i), i), 'base64')); } }));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '30', '-i', path.join(dir, '%04d.png'), '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', path.join(root, 'build/teaser.s16'), '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '48000', '-shortest', '-movflags', '+faststart', path.join(root, 'exports/emtithal-teaser.mp4')], { stdio: 'inherit' });
    console.log('exports/emtithal-teaser.mp4');
  }
  await b.close();
})();
