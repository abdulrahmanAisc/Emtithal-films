// Contact sheets for review (brief 15).
//   node tools/sheet.cjs                 whole film, 24 frames at quarter scale  -> build/sheet-film.jpg
//   node tools/sheet.cjs <shot-id> [n]   n frames of one shot (default 6)        -> build/sheet-<id>.jpg
//   node tools/sheet.cjs --at 2.0,17.5   full-size frames at given times         -> build/at-<T>.jpg
//   options: --scale 0.33  --cols 6  --subs 0
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
(async () => {
  const args = process.argv.slice(2), opt = {}; const pos = [];
  for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) { opt[args[i].slice(2)] = args[++i]; } else pos.push(args[i]); }
  require('child_process').execFileSync('node', [path.join(__dirname, 'build.cjs'), '--no-vo', '--out', path.join(root, 'build', 'tmp-' + process.pid + '.html')], { stdio: 'ignore' });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
  await page.goto('file://' + path.join(root, 'build', 'tmp-' + process.pid + '.html') + (opt.subs === '0' ? '?subs=0' : ''));
  await page.evaluate(() => { window.__render = true; return FILM.ready; });
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  const save = (name, b64) => { const p = path.join(root, 'build', name); fs.writeFileSync(p, Buffer.from(b64, 'base64')); console.log(p); };
  if (opt.at) {
    for (const T of opt.at.split(',').map(Number)) {
      const b = await page.evaluate(async (T) => { try { FILM.draw(T); } catch (e) { return 'ERR ' + e.stack; } const c = document.getElementById('film'); return c.toDataURL('image/jpeg', 0.9).split(',')[1]; }, T);
      if (b.startsWith('ERR')) { console.error(b); continue; }
      save(`at-${T}.jpg`, b);
    }
  } else {
    const tl = await page.evaluate(() => FILM.TIMELINE);
    let times, name, scale, cols;
    if (pos[0]) {
      const s = tl.find((x) => x.id === pos[0]); if (!s) throw new Error('no shot ' + pos[0]);
      const n = +(pos[1] || 6); times = Array.from({ length: n }, (_, i) => s.start + ((s.end - s.start - 1 / 24) * i) / (n - 1));
      name = `sheet-${s.id}.jpg`; scale = +(opt.scale || 0.33); cols = +(opt.cols || Math.min(n, 6));
    } else { times = Array.from({ length: 24 }, (_, i) => (i + 0.5) * (40 / 24)); name = 'sheet-film.jpg'; scale = +(opt.scale || 0.25); cols = +(opt.cols || 8); }
    const b = await page.evaluate(async ({ times, scale, cols }) => {
      const w = Math.round(1080 * scale), h = Math.round(1920 * scale), rows = Math.ceil(times.length / cols);
      const c = document.createElement('canvas'); c.width = cols * w; c.height = rows * (h + 22); const g = c.getContext('2d');
      g.fillStyle = '#333'; g.fillRect(0, 0, c.width, c.height); g.font = '14px monospace'; g.fillStyle = '#fff'; g.direction = 'ltr';
      const errs = [];
      times.forEach((T, i) => {
        try { FILM.draw(T); } catch (e) { errs.push(T.toFixed(2) + ': ' + e.stack); }
        const x = (i % cols) * w, y = Math.floor(i / cols) * (h + 22);
        g.drawImage(document.getElementById('film'), x, y + 22, w, h); g.textAlign = 'left'; g.fillText(`T ${T.toFixed(3)}  ${FILM.shotAt(T).id}`, x + 4, y + 16);
      });
      return { img: c.toDataURL('image/jpeg', 0.85).split(',')[1], errs };
    }, { times, scale, cols });
    b.errs.forEach((e) => console.error('DRAW ERROR', e));
    save(name, b.img);
  }
  await browser.close(); fs.unlinkSync(path.join(root, 'build', 'tmp-' + process.pid + '.html'));
})();
