// Builds the single self-contained player: emtithal-ask-the-code.html
// Embedded data: fonts (base64 @font-face) and the one allowed media file, vo/vo-master.wav (brief 7.4).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const b64 = (p) => fs.readFileSync(p).toString('base64');
require('./srt-to-cues.cjs');

const faces = [];
for (const w of [400, 500, 600, 700]) faces.push(['Noto Kufi Arabic', w, `node_modules/@fontsource/noto-kufi-arabic/files/noto-kufi-arabic-arabic-${w}-normal.woff2`]);
for (const w of [400, 600]) faces.push(['Inter', w, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff2`]);
const css = faces.map(([f, w, p]) => `@font-face{font-family:"${f}";font-weight:${w};font-style:normal;src:url(data:font/woff2;base64,${b64(path.join(root, p))}) format("woff2");}`).join('\n');

const shotDir = path.join(root, 'src/shots');
const order = ['src/config.js', 'src/brand.js', 'src/subtitles.js', 'src/lib.js', 'src/objects.js',
  ...fs.readdirSync(shotDir).filter((f) => f.endsWith('.js')).sort().map((f) => 'src/shots/' + f),
  'src/audio.js', 'src/main.js'];
const voPath = path.join(root, 'vo/vo-master.wav');
const vo = fs.existsSync(voPath) && !process.argv.includes('--no-vo') ? `<script>FILM.VO_B64 = "${b64(voPath)}";</script>` : '';
// one <script> per source file, so a syntax error in one shot never takes the others down
const js = order.map((f) => `<script>\n// ==== ${f} ====\n` + fs.readFileSync(path.join(root, f), 'utf8') + '\n</script>' + (f === 'src/config.js' ? vo : '')).join('\n');
const oi = process.argv.indexOf('--out');
const outFile = oi > 0 ? process.argv[oi + 1] : path.join(root, 'emtithal-ask-the-code.html');
const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>اسأل الكود</title>
<style>
${css}
html,body{margin:0;height:100%;background:#0C0F15;overflow:hidden}
canvas{display:block;margin:0 auto;height:100vh;max-width:100vw;object-fit:contain;aspect-ratio:9/16}
#hud{position:fixed;left:8px;bottom:6px;font:12px/1.4 Inter,monospace;color:#8B919C;direction:ltr}
</style></head><body>
<canvas id="film" width="1080" height="1920"></canvas><div id="hud"></div>
${js}
</body></html>`;
fs.writeFileSync(outFile, html);
console.log('built', (html.length / 1e6).toFixed(2) + ' MB', vo ? 'with VO' : 'no VO');
