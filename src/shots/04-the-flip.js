// 04 the-flip, T 5.0 to 6.5, ILL. The hunt by hand: pages flip on 16ths, tabs sprout on beats, the clock spins.
(function () {
  const L = FILM.lib, O = FILM.obj, PAL = L.PAL;
  const { prog, ease, lerp, rs, rnd, F } = L;
  const SX = 490, YT = 1000, YB = 1300;                       // spine
  function qmark(ctx, x, y, size, sc, seed) {
    if (sc <= 0) return; const q = size * 0.2 * sc;
    L.ink(ctx, [[x - q, y - q * 1.1], [x - q * 0.6, y - q * 1.9], [x + q * 0.4, y - q * 2], [x + q, y - q * 1.2], [x + q * 0.5, y - q * 0.3], [x, y + q * 0.2], [x, y + q * 0.8]], { color: PAL.ovInk, width: Math.max(4, size * 0.075), seed, double: true });
    L.circle(ctx, x, y + q * 1.7, Math.max(4, size * 0.045) * sc, { fill: PAL.ovInk, color: PAL.ovInk, width: 2, seed: seed + 1 });
  }
  FILM.defShot('the-flip', {
    draw(ctx, t, T) {
      const t2 = L.onTwos(t), step = Math.floor(t / 0.125 + 1e-6), beat = Math.floor(t / 0.5 + 1e-6);
      O.desk(ctx, { stripe: PAL.stripeSand });
      // clock on the wall, hands spinning (time lost)
      const cx = 500, cy = 560, cr = 150;
      L.hatch(ctx, L.ellPts(cx + 14, cy + 16, cr, cr, 30), { gap: 6, color: PAL.inkSoft, width: 1.5, seed: 400 });
      L.circle(ctx, cx, cy, cr, { fill: PAL.paper, width: 6, double: true, seed: 401, n: 44 });
      L.circle(ctx, cx, cy, cr - 16, { color: PAL.inkSoft, width: 2, seed: 402, n: 40 });
      L.hatch(ctx, L.ellPts(cx, cy, cr - 16, cr - 16, 30).filter((p) => p[0] > cx - 10), { gap: 8, color: PAL.inkFaint, width: 1.3, seed: 403 });
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.2832, r0 = cr - (i % 3 ? 30 : 42); L.line(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (cr - 18), cy + Math.sin(a) * (cr - 18), { width: i % 3 ? 2.5 : 5, seed: 404 + i, amp: 0.5 }); }
      const am = t2 * 6.2832 * 2 - 1.57, ah = t2 * 6.2832 * 0.45 - 0.6;
      L.line(ctx, cx, cy, cx + Math.cos(ah) * 70, cy + Math.sin(ah) * 70, { width: 8, seed: 420 });
      L.line(ctx, cx, cy, cx + Math.cos(am) * 112, cy + Math.sin(am) * 112, { width: 5, seed: 421 });
      for (let j = 1; j < 4; j++) { const a = am - j * 0.5; L.line(ctx, cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, cx + Math.cos(a) * 108, cy + Math.sin(a) * 108, { color: PAL.inkSoft, width: 2, alpha: 0.5 - j * 0.12, seed: 422 + j }); }
      L.circle(ctx, cx, cy, 10, { fill: PAL.hero, width: 3, seed: 426 });
      L.arc(ctx, cx, cy, cr + 26, am - 1.3, am - 0.2, { color: PAL.ovSlate, width: 3, seed: 427 });
      L.arc(ctx, cx, cy, cr + 44, am - 0.9, am - 0.1, { color: PAL.ovSlate, width: 2, seed: 428 });
      // the open code book on the desk
      const RP = [[SX, YT], [860, YT - 14], [930, YB - 16], [SX, YB]], LP = [[SX, YT], [120, YT - 14], [50, YB - 16], [SX, YB]];
      L.hatch(ctx, [[60, YB - 10], [940, YB - 10], [990, YB + 46], [110, YB + 50]], { gap: 6, color: PAL.ink, width: 1.6, alpha: 0.8, seed: 430 });
      for (const [P, s] of [[RP, 1], [LP, -1]]) {
        for (let k = 3; k >= 1; k--) L.poly(ctx, P.map(([x, y], i) => [x + (i === 1 || i === 2 ? s * k * 7 : 0), y + k * 7]), { fill: PAL.paperShade, width: 2.5, seed: 431 + k + s });
        L.poly(ctx, P, { fill: PAL.paper, width: 5, double: true, seed: 436 + s });
        const hx = s > 0 ? [[SX, YT], [SX + 80, YT - 3], [SX + 96, YB - 2], [SX, YB]] : [[130, YT - 12], [SX - 250, YT - 8], [SX - 280, YB - 6], [56, YB - 14]];
        L.hatch(ctx, hx, { gap: 8, color: PAL.inkFaint, width: 1.4, seed: 438 + s });
        const xr = s > 0 ? 880 : SX - 40;
        for (let b = 0; b < 3; b++) L.scribble(ctx, xr - (s > 0 ? b * 4 : 0), YT + 44 + b * 84, 330, { lines: 4, gap: 17, seed: 440 + b + s * 5 + step * (b === 1 ? 1 : 0), width: 2.2 });
      }
      L.line(ctx, SX, YT, SX, YB, { width: 5, seed: 446 });
      // sticky tabs bristle out of the edges; a new one sprouts on each beat
      const cols = [PAL.brand400, PAL.spineSand, PAL.ovSlate, PAL.hero, PAL.spineStone];
      const nt = 7 + beat;
      for (let i = 0; i < Math.min(nt + 1, 11); i++) {
        const sc = i < 7 ? 1 : L.pop(t2, (i - 7) * 0.5, 3); if (sc <= 0) continue;
        const top = i % 2 === 0, u = rnd('tab', i);
        if (top) { const x = SX + 40 + ((i * 97) % 330), y = YT - 6 - ((x - SX) / 370) * 14; L.rrect(ctx, x, y - 34 * sc, 30, 38 * sc, 6, { fill: cols[i % 5], width: 3, seed: 450 + i }); }
        else { const y = YT + 30 + ((i * 71) % 230), x = 862 + ((y - YT) / 300) * 70; L.rrect(ctx, x - 4, y, 50 * sc, 24, 6, { fill: cols[i % 5], width: 3, seed: 450 + i }); }
      }
      // pages in the air, flipping on 16ths (right to left)
      for (let j = 0; j < 4; j++) {
        const ph = ((step + j * 1.3) % 4) / 4, th = (0.08 + ph * 0.84) * Math.PI, c = Math.cos(th), s = Math.sin(th);
        const pg = [[SX, YT], [SX + c * 330 - 20 * s, YT - 14 - s * 215], [SX + c * 380, YT - 26 - s * 245], [SX + c * 440, YB - 16 - s * 235], [SX + c * 220 + 30 * s, YB - 8 - s * 120], [SX, YB]];
        L.poly(ctx, pg, { fill: j % 2 ? PAL.paperShade : PAL.paper, width: 4, double: true, seed: 470 + j * 9 + step });
        L.hatch(ctx, [pg[0], pg[1], pg[2], [SX + c * 200, YB - s * 140]], { gap: 8, color: PAL.inkFaint, width: 1.3, seed: 475 + j, alpha: 0.9 });
        for (let l = 0; l < 5; l++) { const u = 0.2 + l * 0.14; L.line(ctx, SX + c * 60, lerp(YT, YB, u) - s * 50, SX + c * 360, lerp(YT, YB, u) - s * 205 - 12, { color: PAL.inkSoft, width: 2, alpha: 0.7, seed: 480 + j * 7 + l }); }
      }
      // overlay: ovSlate motion arcs over the flipping pages
      for (let k = 0; k < 4; k++) { const a0 = -2.7 + ((step + k) % 4) * 0.42; L.arc(ctx, SX, YT + 60, 400 + k * 34, a0, a0 + 0.55, { color: PAL.ovSlate, width: 4 - k * 0.6, seed: 490 + k, alpha: 0.9 }); }
      O.lamp(ctx);
      // overlay: two ovInk question marks pop on T 5.25 and T 5.75
      qmark(ctx, 200, 800, 190, L.pop(t, 0.25), 495);
      qmark(ctx, 800, 700, 150, L.pop(t, 0.75), 497);
      const r1 = L.pop(t, 0.25), r2 = L.pop(t, 0.75);
      if (r1 > 0) L.ring(ctx, 200, 770, 96, { scale: r1, color: PAL.ovSlate, width: 2, dash: [12, 10], seed: 498 });
      if (r2 > 0) L.ring(ctx, 800, 676, 80, { scale: r2, color: PAL.ovSlate, width: 2, dash: [12, 10], seed: 499 });
    },
    text(ctx, t, T) {},
  });
})();
