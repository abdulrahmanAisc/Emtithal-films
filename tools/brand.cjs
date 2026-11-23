// Regenerates the logo data in src/brand.js from the team's own SVG files in src/brand/.
const fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..');
const p = path.join(root, 'src/brand.js'); let js = fs.readFileSync(p, 'utf8');
const tail = js.slice(js.indexOf('// Rasterise each SVG once'));
const read = (f) => { const svg = fs.readFileSync(path.join(root, 'src/brand', f), 'utf8').trim(); const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return { w: +m[1], h: +m[2], svg }; };
const e = read('emtithal.svg'), a = read('aisc.svg'), k = e.w / 84;
const size = (d) => d.svg.replace(/<svg width="[\d.]+" height="[\d.]+"/, `<svg width="${d.w}" height="${d.h}"`);
fs.writeFileSync(p, `// Emtithal and AISC logos: the team's own SVG files (src/brand/emtithal.svg, src/brand/aisc.svg), embedded by
// tools/brand.cjs. Drawn exactly as supplied: no boil, no grain, no distortion; the only recolour is a flat tint.
FILM.BRAND = {
  emtithal: { w: ${e.w}, h: ${e.h}, mark: [0, ${(0.63 * k).toFixed(2)}, ${(19.8 * k).toFixed(2)}, ${(19.8 * k).toFixed(2)}], svg: \`${size(e)}\` },
  aisc: { w: ${a.w}, h: ${a.h}, svg: \`${size(a)}\` },
};
` + tail);
