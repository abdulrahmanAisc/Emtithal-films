// Engine library. Everything here is a pure function of its arguments and FILM.bf (the 12 fps boil frame).
(function () {
  const L = FILM.lib;
  const W = FILM.W, H = FILM.H, FPS = FILM.FPS;

  // ---- palette (brief 4.1 tokens, 4.2 derived plates) ----
  const PAL = L.PAL = {
    // brand tokens
    brand50: '#FFFEF2', brand100: '#FBF6E8', brand200: '#F4F0E4', brand300: '#E6D9AE', brand400: '#E8C55A',
    brand500: '#DBA61C', brand600: '#C9910A', brand700: '#AF8516', brand900: '#8F6A09',
    inkStrong: '#1A2029', cta: '#E3A50B',
    // paper plate (derived)
    paper: '#FFFEF2', paperShade: '#FBF6E8', paperDeep: '#F4F0E4', stripeA: '#FFFEF2', stripeGold: '#F1EACD',
    stripeSand: '#F4F0E4', ink: '#252D3B', inkSoft: '#4A5263', inkFaint: '#8B919C', hero: '#DBA61C',
    heroShade: '#C9910A', heroDeep: '#AF8516', spineSlate: '#3B4456', spineStone: '#C9C3B4', spineSand: '#E6D9AE',
    desk: '#B89A72', deskDeep: '#8E7350', lampGlow: '#FFF3CC', night: '#1A2029',
    // blueprint plate (derived)
    bp: '#141922', bpDeep: '#0C0F15', bpLight: '#222A37', bpGrid: '#2E3747', line: '#FBF6E8', lineGold: '#E6D9AE',
    glow: '#FFF3CC', change: '#E8C55A',
    // overlays on paper
    ovGold: '#C9910A', ovInk: '#252D3B', ovSlate: '#5B6B82',
  };
  const FONT = L.FONT = '"Noto Kufi Arabic", "Inter", sans-serif';

  // ---- math, seeded randomness, time ----
  const hash = L.hash = function () {
    let h = 2166136261 >>> 0;
    for (let k = 0; k < arguments.length; k++) {
      const a = arguments[k];
      if (typeof a === 'string') { for (let i = 0; i < a.length; i++) { h ^= a.charCodeAt(i); h = Math.imul(h, 16777619); } }
      else { const v = Math.floor(a * 1000) | 0; for (let s = 0; s < 32; s += 8) { h ^= (v >>> s) & 255; h = Math.imul(h, 16777619); } }
      h ^= 0x9e; h = Math.imul(h, 16777619);
    }
    h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
    return h >>> 0;
  };
  const rnd = L.rnd = function () { return hash.apply(null, arguments) / 4294967296; };       // one float in [0,1)
  const rs = L.rs = function () { return rnd.apply(null, arguments) * 2 - 1; };                // one float in [-1,1)
  L.rng = (seed) => { let s = hash(seed) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  const clamp = L.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = L.lerp = (a, b, k) => a + (b - a) * k;
  L.map = (x, a, b, c, d) => c + (d - c) * clamp((x - a) / (b - a));
  const prog = L.prog = (T, t0, dur) => clamp((T - t0) / dur);
  const ease = L.ease = {
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inCubic: (x) => x * x * x,
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outBack: (x, o = 0.08) => { const c1 = 1.70158 * (o / 0.1), c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const F = L.F = (n) => n / FPS;                                  // frames to seconds
  L.onTwos = (t) => Math.floor(t * 12 + 1e-6) / 12;
  // pop: outBack over 3 frames (0 before t0, settles to 1). drawOn: outExpo over 6 frames.
  L.pop = (T, t0, frames = 3) => (T < t0 ? 0 : ease.outBack(prog(T, t0, F(frames)), 0.08));
  L.drawOn = (T, t0, frames = 6) => (T < t0 ? 0 : ease.outExpo(prog(T, t0, F(frames))));
  // change flash alpha: full at t0, gone 12 frames later (the `change` colour never lasts longer).
  L.flash = (T, t0, frames = 12) => (T < t0 || T >= t0 + F(frames) ? 0 : 1 - prog(T, t0, F(frames)));
  L.hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  // ---- ink: every line wobbles 0.6 to 1.2 px, re-seeded at 12 fps ----
  // pts: [[x,y],...]. opts: color, width, seed, amp, close, fill, double, alpha, boil(false = still), dash
  function wobPts(pts, seed, amp, close, still) {
    const bf = still ? 0 : FILM.bf, out = [];
    const n = pts.length, segs = close ? n : n - 1;
    let k = 0;
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const m = Math.max(1, Math.round(len / 38));
      for (let j = 0; j < m; j++, k++) {
        const u = j / m;
        out.push([lerp(a[0], b[0], u) + rs(seed, k, bf, 1) * amp, lerp(a[1], b[1], u) + rs(seed, k, bf, 2) * amp]);
      }
    }
    if (!close) { const z = pts[n - 1]; out.push([z[0] + rs(seed, k, bf, 1) * amp, z[1] + rs(seed, k, bf, 2) * amp]); }
    return out;
  }
  const ink = L.ink = function (ctx, pts, o = {}) {
    if (pts.length < 2) return;
    const seed = o.seed ?? hash(pts[0][0], pts[0][1], pts.length), amp = o.amp ?? 0.9;
    const p = wobPts(pts, seed, amp, o.close, o.boil === false);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    if (o.close) ctx.closePath();
    if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
    if (o.width !== 0) {
      if (o.dash) ctx.setLineDash(o.dash);
      ctx.strokeStyle = o.color || PAL.ink; ctx.lineWidth = o.width ?? 3; ctx.stroke();
      if (o.double) {
        const q = wobPts(pts, seed + 77, amp * 2.2, o.close, o.boil === false);
        ctx.globalAlpha *= 0.45; ctx.lineWidth = (o.width ?? 3) * 0.55;
        ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
        for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
        if (o.close) ctx.closePath(); ctx.stroke();
      }
    }
    ctx.restore();
  };
  L.line = (ctx, x1, y1, x2, y2, o) => ink(ctx, [[x1, y1], [x2, y2]], o);
  // partial line for draw-ons: k in 0..1
  L.lineTo = (ctx, x1, y1, x2, y2, k, o) => { if (k > 0) ink(ctx, [[x1, y1], [lerp(x1, x2, k), lerp(y1, y2, k)]], o); };
  const rectPts = L.rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const rrectPts = L.rrectPts = (x, y, w, h, r, n = 5) => {
    r = Math.min(r, w / 2, h / 2); const p = [];
    const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) { const a = (a0 + (90 * i) / n) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return p;
  };
  const ellPts = L.ellPts = (cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) => { const p = []; for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / (a1 - a0 >= Math.PI * 2 - 1e-6 ? n : n - 1); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  L.rect = (ctx, x, y, w, h, o = {}) => ink(ctx, rectPts(x, y, w, h), { close: true, ...o });
  L.rrect = (ctx, x, y, w, h, r, o = {}) => ink(ctx, rrectPts(x, y, w, h, r), { close: true, ...o });
  L.ellipse = (ctx, cx, cy, rx, ry, o = {}) => ink(ctx, ellPts(cx, cy, rx, ry, o.n || Math.max(14, Math.round((rx + ry) / 9))), { close: true, ...o });
  L.circle = (ctx, cx, cy, r, o = {}) => L.ellipse(ctx, cx, cy, r, r, o);
  L.arc = (ctx, cx, cy, r, a0, a1, o = {}) => ink(ctx, ellPts(cx, cy, r, r, o.n || Math.max(6, Math.round(Math.abs(a1 - a0) * r / 22)), a0, a1), o);
  L.poly = (ctx, pts, o = {}) => ink(ctx, pts, { close: true, ...o });
  const pathOf = L.pathOf = (ctx, pts) => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };

  // ---- hatching: clipped parallel strokes, never gradients (brief 14.1 rule 5) ----
  // shape: array of points (polygon) or [x,y,w,h]. opts: angle (45 primary, 105 cross), gap (12/8/5), color, width, seed, alpha
  const hatch = L.hatch = function (ctx, shape, o = {}) {
    const pts = typeof shape[0] === 'number' ? rectPts(shape[0], shape[1], shape[2], shape[3]) : shape;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 8;
    const seed = o.seed ?? hash(x0, y0, x1), gap = o.gap ?? 8, bf = o.boil === false ? 0 : FILM.bf;
    const base = ((o.angle ?? 45) * Math.PI) / 180;
    ctx.save();
    ctx.beginPath(); pathOf(ctx, pts); ctx.clip();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.strokeStyle = o.color || PAL.ink; ctx.lineWidth = o.width ?? 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    let i = 0;
    for (let d = -R; d < R; i++) {
      const a = base + rs(seed, i, 1) * 0.052 + rs(seed, i, bf, 9) * 0.008;        // ±3 degrees
      const dx = Math.cos(a), dy = -Math.sin(a), nx = -dy, ny = dx;
      const e1 = rnd(seed, i, 2) * 6 + rs(seed, i, bf, 3) * 1.2, e2 = rnd(seed, i, 4) * 6;
      const ox = cx + nx * d + rs(seed, i, bf, 5) * 0.7, oy = cy + ny * d;
      if (rnd(seed, i, 6) > 0.05) {
        const brk = rnd(seed, i, 7);
        if (brk < 0.22) {              // a lifted pen: the stroke breaks once
          const m = rs(seed, i, 8) * R * 0.6;
          ctx.moveTo(ox - dx * (R - e1), oy - dy * (R - e1)); ctx.lineTo(ox + dx * (m - 5), oy + dy * (m - 5));
          ctx.moveTo(ox + dx * (m + 5), oy + dy * (m + 5)); ctx.lineTo(ox + dx * (R - e2), oy + dy * (R - e2));
        } else { ctx.moveTo(ox - dx * (R - e1), oy - dy * (R - e1)); ctx.lineTo(ox + dx * (R - e2), oy + dy * (R - e2)); }
      }
      d += gap * (1 + rs(seed, i, 10) * 0.15);
    }
    ctx.stroke(); ctx.restore();
  };
  L.crossHatch = (ctx, shape, o = {}) => { hatch(ctx, shape, o); hatch(ctx, shape, { ...o, angle: 105, seed: (o.seed ?? 1) + 31 }); };
  // stipple: n seeded dots inside a rect
  L.stipple = (ctx, x, y, w, h, n, o = {}) => {
    const seed = o.seed ?? hash(x, y, n); ctx.save(); ctx.fillStyle = o.color || PAL.ink; if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const r = o.r ?? 1.3; ctx.beginPath();
    for (let i = 0; i < n; i++) { const px = x + rnd(seed, i, 1) * w, py = y + rnd(seed, i, 2) * h; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, 6.2832); }
    ctx.fill(); ctx.restore();
  };
  // scribble: stand-in text lines (right-aligned, ragged left, broken into word-length dashes). Never real titles.
  L.scribble = (ctx, xRight, y, w, o = {}) => {
    const lines = o.lines ?? 3, gap = o.gap ?? 18, seed = o.seed ?? hash(xRight, y, w), bf = o.boil === false ? 0 : FILM.bf;
    ctx.save(); ctx.strokeStyle = o.color || PAL.inkSoft; ctx.lineWidth = o.width ?? 2.2; ctx.lineCap = 'round';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.beginPath();
    for (let l = 0; l < lines; l++) {
      const lw = w * (l === lines - 1 && lines > 1 ? 0.45 + rnd(seed, l, 1) * 0.4 : 0.86 + rnd(seed, l, 1) * 0.14) * (o.fill ?? 1);
      let x = xRight; const yy = y + l * gap; let k = 0;
      while (x > xRight - lw) {
        const ww = Math.min((o.word ?? 26) * (0.5 + rnd(seed, l, k, 2) * 1.3), x - (xRight - lw));
        if (ww < 3) break;
        ctx.moveTo(x, yy + rs(seed, l, k, bf) * 0.7); ctx.lineTo(x - ww, yy + rs(seed, l, k, bf, 3) * 0.7);
        x -= ww + (o.word ?? 26) * 0.32; k++;
      }
    }
    ctx.stroke(); ctx.restore();
  };

  // ---- plates ----
  // Illustrated: cream paper, wide diagonal stripes, faint construction lines. opts: stripe (band B colour), seed, lines
  L.paperPlate = (ctx, o = {}) => {
    ctx.fillStyle = PAL.stripeA; ctx.fillRect(0, 0, W, H);
    const band = o.band ?? 150, sx = o.shift ?? 0;
    ctx.fillStyle = o.stripe || PAL.stripeGold;
    ctx.save(); ctx.globalAlpha = o.stripeAlpha ?? 1;
    for (let x = -H - band * 2 + (sx % (band * 2)); x < W + band * 2; x += band * 2) {
      ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.lineTo(x + H + band, 0); ctx.lineTo(x + band, H); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const seed = o.seed ?? 11, n = o.lines ?? 5;
    for (let i = 0; i < n; i++) {                       // faint construction lines running past the frame
      const y = rnd(seed, i, 1) * H, a = rs(seed, i, 2) * 0.5;
      L.line(ctx, -20, y, W + 20, y + Math.tan(a) * W * 0.3, { color: PAL.inkFaint, width: 1.2, alpha: 0.28, seed: seed + i, amp: 0.6 });
    }
  };
  // Schematic: dark blueprint, 60 px grid, huge faint guide circle and diagonals. opts: deep, cx, cy, r, guides(false)
  L.blueprintPlate = (ctx, o = {}) => {
    ctx.fillStyle = o.deep ? PAL.bpDeep : PAL.bp; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.strokeStyle = PAL.bpGrid; ctx.lineWidth = 1; ctx.globalAlpha = o.gridAlpha ?? 0.8; ctx.beginPath();
    for (let x = 0; x <= W; x += 60) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke(); ctx.restore();
    if (o.guides !== false) {
      const cx = o.cx ?? 540, cy = o.cy ?? 820, r = o.r ?? 640;
      L.circle(ctx, cx, cy, r, { color: PAL.lineGold, width: 1.2, alpha: 0.16, seed: 5, n: 64 });
      L.circle(ctx, cx, cy, r * 0.62, { color: PAL.lineGold, width: 1, alpha: 0.1, seed: 6, n: 48, dash: [6, 10] });
      L.line(ctx, -20, cy - 960, W + 20, cy + 960, { color: PAL.lineGold, width: 1, alpha: 0.13, seed: 7 });
      L.line(ctx, W + 20, cy - 960, -20, cy + 960, { color: PAL.lineGold, width: 1, alpha: 0.13, seed: 8 });
      for (let i = 0; i < 24; i++) {                    // radial ticks on the guide circle
        const a = (i / 24) * 6.2832; L.line(ctx, cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10), cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10), { color: PAL.lineGold, width: 1, alpha: 0.22, seed: 40 + i, amp: 0.4 });
      }
    }
  };
  // grain: seeded tiles, re-seeded on the 12 fps clock. Drawn between the form layer and the text layer.
  let tiles = null;
  function makeTiles() {
    tiles = { ILL: [], SCH: [] };
    for (const mode of ['ILL', 'SCH']) for (let k = 0; k < 3; k++) {
      const c = document.createElement('canvas'); c.width = c.height = 360; const g = c.getContext('2d');
      const im = g.createImageData(360, 360), r = L.rng('grain' + mode + k);
      for (let i = 0; i < im.data.length; i += 4) {
        const v = r(), dark = mode === 'ILL';
        const col = dark ? [37, 45, 59] : [251, 246, 232];
        im.data[i] = col[0]; im.data[i + 1] = col[1]; im.data[i + 2] = col[2];
        im.data[i + 3] = v > 0.86 ? (dark ? 34 : 26) * (0.4 + r()) : v < 0.1 ? (dark ? 10 : 8) : 0;
      }
      g.putImageData(im, 0, 0); tiles[mode].push(c);
    }
  }
  L.grain = (ctx, mode, skip) => {
    if (!tiles) makeTiles();
    const set = tiles[mode === 'SCH' ? 'SCH' : 'ILL'], bf = FILM.bf;
    const t = set[hash('g', bf) % 3], ox = hash('gx', bf) % 360, oy = hash('gy', bf) % 360;
    ctx.save();
    if (skip) { ctx.beginPath(); ctx.rect(0, 0, W, H); for (const s of skip) ctx.rect(s[0], s[1], s[2], s[3]); ctx.clip('evenodd'); }
    for (let x = -ox; x < W; x += 360) for (let y = -oy; y < H; y += 360) ctx.drawImage(t, x, y);
    ctx.restore();
  };

  // ---- crisp text (never boils, never gets grain). Arabic is always shaped by the browser. ----
  const isAr = (s) => /[؀-ۿ]/.test(s);
  const setFont = L.setFont = (ctx, o = {}) => { ctx.font = `${o.weight || 400} ${o.size || 32}px ${FONT}`; };
  // opts: size, weight, color, align ('center'|'right'|'left'), alpha, dir, scale (about x,y), baseline, stroke(width)
  const txt = L.txt = (ctx, s, x, y, o = {}) => {
    ctx.save(); setFont(ctx, o);
    ctx.direction = o.dir || (isAr(s) ? 'rtl' : 'ltr'); ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'alphabetic';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.scale != null && o.scale !== 1) { ctx.translate(x, y); ctx.scale(o.scale, o.scale); ctx.translate(-x, -y); }
    if (o.stroke) { ctx.strokeStyle = o.color || PAL.ink; ctx.lineWidth = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    else { ctx.fillStyle = o.color || PAL.ink; ctx.fillText(s, x, y); }
    ctx.restore();
  };
  const measure = L.measure = (ctx, s, o = {}) => { ctx.save(); setFont(ctx, o); ctx.direction = isAr(s) ? 'rtl' : 'ltr'; const w = ctx.measureText(s).width; ctx.restore(); return w; };
  // word wrap. Returns the lines; draws them when o.draw !== false. y is the first baseline.
  L.txtWrap = (ctx, s, x, y, maxW, lh, o = {}) => {
    const words = s.split(' '), lines = []; let cur = '';
    for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (measure(ctx, nx, o) > maxW && cur) { lines.push(cur); cur = w; } else cur = nx; }
    if (cur) lines.push(cur);
    if (o.draw !== false) lines.forEach((l, i) => txt(ctx, l, x, y + i * lh, o));
    return lines;
  };
  // typed text: the first k characters by whole count (used for typing on 32nds). Arabic re-shapes naturally.
  L.typed = (s, k) => Array.from(s).slice(0, Math.max(0, Math.floor(k))).join('');
  // word boxes of a single line, right to left: [{word, x (right edge), w}] for a line centred at cx or right-aligned at x
  const wordBoxes = L.wordBoxes = (ctx, s, xRight, o = {}) => {
    const sp = measure(ctx, ' ', o), out = []; let x = xRight;
    for (const w of s.split(' ')) { const ww = measure(ctx, w, o); out.push({ word: w, x, w: ww }); x -= ww + sp; }
    return out;
  };
  // flat crisp shapes for the text layer (UI cards, chips, pills)
  const rr = L.rr = (ctx, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  // chip: a rounded pill with a centred string. opts: size, weight, padX, padY(h), fill, color, outline, outlineW, scale, alpha, w (fixed width)
  // returns { x, y, w, h }
  L.chip = (ctx, s, cx, cy, o = {}) => {
    const size = o.size ?? 30, w = o.w ?? measure(ctx, s, { size, weight: o.weight ?? 500 }) + (o.padX ?? 26) * 2, h = o.h ?? size * 1.9;
    const sc = o.scale ?? 1; if (sc <= 0) return { x: cx - w / 2, y: cy - h / 2, w, h };
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    rr(ctx, cx - w / 2, cy - h / 2, w, h, o.r ?? h / 2);
    if (o.fill !== null) { ctx.fillStyle = o.fill || PAL.brand100; ctx.fill(); }
    if (o.outline !== null) { ctx.strokeStyle = o.outline || PAL.ink; ctx.lineWidth = o.outlineW ?? 2.5; ctx.stroke(); }
    txt(ctx, s, cx, cy + size * 0.36, { size, weight: o.weight ?? 500, color: o.color || PAL.ink });
    ctx.restore();
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  };
  L.card = (ctx, x, y, w, h, o = {}) => {
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha; rr(ctx, x, y, w, h, o.r ?? 28);
    if (o.fill !== null) { ctx.fillStyle = o.fill || PAL.brand100; ctx.fill(); }
    if (o.outline !== null) { ctx.strokeStyle = o.outline || PAL.ink; ctx.lineWidth = o.outlineW ?? 3; ctx.stroke(); }
    ctx.restore();
  };
  // big drawn number: outlined, filling from the bottom with ink and gold hatching. fill 0..1.
  L.bigNumber = (ctx, s, cx, cy, size, fill, o = {}) => {
    const w = measure(ctx, s, { size, weight: 700 }) + 40, h = size * 1.1;
    const c = L._num || (L._num = document.createElement('canvas')); c.width = Math.ceil(w); c.height = Math.ceil(h);
    const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    const bx = c.width / 2, by = h * 0.86;
    if (fill > 0) {
      txt(g, s, bx, by, { size, weight: 700, color: o.color || PAL.ink });
      g.globalCompositeOperation = 'source-atop';
      g.strokeStyle = o.hatch || PAL.heroShade; g.lineWidth = 3.5; g.beginPath();
      for (let d = -h; d < w; d += 24) { g.moveTo(d, h); g.lineTo(d + h, 0); }
      g.stroke();
      g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000'; g.fillRect(0, h * (1 - fill), w, h);
      g.globalCompositeOperation = 'source-over';
    }
    txt(g, s, bx, by, { size, weight: 700, color: o.color || PAL.ink, stroke: o.strokeW ?? 5 });
    ctx.drawImage(c, cx - bx, cy - by);
  };

  // ---- overlays (run at a full 24 fps) ----
  // ring: thin attention ring. k = 0..1 draw amount or pop scale
  L.ring = (ctx, cx, cy, r, o = {}) => {
    const s = o.scale ?? 1; if (s <= 0) return;
    L.circle(ctx, cx, cy, r * s, { color: o.color || PAL.ovGold, width: o.width ?? 4, alpha: o.alpha, seed: o.seed ?? hash(cx, cy, r), n: 40, dash: o.dash });
  };
  // expanding rings from a point: n rings, period seconds, since t0
  L.ripples = (ctx, cx, cy, T, t0, o = {}) => {
    const n = o.n ?? 3, dur = o.dur ?? 0.75, r1 = o.r ?? 420;
    for (let i = 0; i < n; i++) { const k = prog(T, t0 + i * (o.gap ?? 0.125), dur); if (k > 0 && k < 1) L.circle(ctx, cx, cy, 20 + ease.outCubic(k) * r1, { color: o.color || PAL.ovGold, width: (o.width ?? 4) * (1 - k * 0.6), alpha: 1 - k, seed: 300 + i, n: 48 }); }
  };
  // bracket: measurement bracket between two points with end ticks. k = draw-on 0..1 (opens from the middle)
  L.bracket = (ctx, x1, y1, x2, y2, o = {}) => {
    const k = o.k ?? 1; if (k <= 0) return;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ax = lerp(mx, x1, k), ay = lerp(my, y1, k), bx = lerp(mx, x2, k), by = lerp(my, y2, k);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len, tk = o.tick ?? 16;
    const st = { color: o.color || PAL.ovInk, width: o.width ?? 3, seed: o.seed ?? hash(x1, y1, x2, y2), alpha: o.alpha };
    L.line(ctx, ax, ay, bx, by, st);
    L.line(ctx, ax - nx * tk, ay - ny * tk, ax + nx * tk, ay + ny * tk, { ...st, seed: st.seed + 1 });
    L.line(ctx, bx - nx * tk, by - ny * tk, bx + nx * tk, by + ny * tk, { ...st, seed: st.seed + 2 });
    if (o.ticks) for (let i = 1; i < o.ticks; i++) { const u = i / o.ticks, px = lerp(ax, bx, u), py = lerp(ay, by, u), tl = i % 5 === 0 ? tk * 0.7 : tk * 0.4; L.line(ctx, px, py, px + nx * tl, py + ny * tl, { ...st, width: (st.width) * 0.6, seed: st.seed + 10 + i, amp: 0.4 }); }
  };
  // arrow from a to b with a head. k = draw-on
  L.arrow = (ctx, x1, y1, x2, y2, o = {}) => {
    const k = o.k ?? 1; if (k <= 0) return; const bx = lerp(x1, x2, k), by = lerp(y1, y2, k);
    const st = { color: o.color || PAL.ovInk, width: o.width ?? 3, seed: o.seed ?? hash(x1, y1, x2), dash: o.dash, alpha: o.alpha };
    L.line(ctx, x1, y1, bx, by, st);
    const a = Math.atan2(y2 - y1, x2 - x1), hd = o.head ?? 16;
    if (o.head !== 0) { L.line(ctx, bx, by, bx - Math.cos(a - 0.45) * hd, by - Math.sin(a - 0.45) * hd, { ...st, dash: null }); L.line(ctx, bx, by, bx - Math.cos(a + 0.45) * hd, by - Math.sin(a + 0.45) * hd, { ...st, dash: null, seed: st.seed + 1 }); }
  };
  // glow dot for blueprint nuclei: flat core + radial ticks (no gradient)
  L.glowDot = (ctx, cx, cy, r, o = {}) => {
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = o.color || PAL.glow; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
    ctx.globalAlpha *= 0.35; ctx.beginPath(); ctx.arc(cx, cy, r * 1.9, 0, 6.2832); ctx.fill(); ctx.restore();
    const n = o.ticks ?? 8;
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832 + (o.rot ?? 0); L.line(ctx, cx + Math.cos(a) * r * 2.4, cy + Math.sin(a) * r * 2.4, cx + Math.cos(a) * r * (3.2 + (i % 2)), cy + Math.sin(a) * r * (3.2 + (i % 2)), { color: o.color || PAL.glow, width: 1.6, alpha: (o.alpha ?? 1) * 0.8, seed: hash(cx, cy, i), amp: 0.5 }); }
  };
  // tally of placeholder-safe clause tag: gold pill "البند ___" (or the confirmed number). Crisp; use in the text layer.
  L.clauseTag = (ctx, cx, cy, o = {}) => L.chip(ctx, 'البند ' + FILM.slot(FILM.CFG.CLAUSE), cx, cy, { size: o.size ?? 30, weight: 600, fill: o.fill || PAL.hero, color: o.color || PAL.inkStrong, outline: o.outline === undefined ? PAL.ink : o.outline, scale: o.scale, alpha: o.alpha, padX: o.padX ?? 22 });

  // ---- subtitles: data from the SRT, one function draws the active cue (brief 8.1) ----
  L.drawSubtitle = (ctx, T, mode) => {
    const fr = Math.round(T * FPS);
    for (const c of FILM.SUBS) {
      const fin = c.n === 1 ? 0 : Math.round(c.in * FPS), fout = Math.floor(c.out * FPS + 1e-6);
      if (fr < fin || fr >= fout) continue;
      const kin = Math.min(1, (fr - fin + 1) / 3), kout = Math.min(1, (fout - fr) / 3), k = Math.min(kin, kout);
      const sc = 0.96 + 0.04 * k, o = { size: 50, weight: 600 };
      const lines = c.lines.map((l) => l.replace('{N}', String(FILM.CFG.N)));
      const lift = c.lift.map((w) => w.replace('{N}', String(FILM.CFG.N)));
      const sch = mode === 'SCH', widths = lines.map((l) => measure(ctx, l, o));
      const pw = Math.min(860, Math.max(...widths) + 48), lh = 75, n = lines.length;
      const top = 1500 - (n - 1) * lh - 50 - 14, bot = 1500 + 12 + 14;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(500, (top + bot) / 2); ctx.scale(sc, sc); ctx.translate(-500, -(top + bot) / 2);
      ctx.save(); ctx.globalAlpha *= sch ? 0.8 : 0.92; ctx.fillStyle = sch ? PAL.bp : PAL.brand100; rr(ctx, 500 - pw / 2, top, pw, bot - top, 22); ctx.fill(); ctx.restore();
      lines.forEach((l, i) => {
        const y = 1500 - (n - 1 - i) * lh;
        for (const b of wordBoxes(ctx, l, 500 + widths[i] / 2, o)) {
          const up = lift.includes(b.word);
          txt(ctx, b.word, b.x, y, { ...o, align: 'right', dir: 'rtl', color: up ? (sch ? PAL.brand400 : PAL.brand900) : (sch ? PAL.line : PAL.ink) });
        }
      });
      ctx.restore();
      return;
    }
  };
})();
