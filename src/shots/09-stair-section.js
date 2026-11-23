// 09 stair-section, T 16.5 to 18.0, SCH. A stair in section and elevation; the dimension bracket across its width sits on G3.
(function () {
  const L = FILM.lib, PAL = L.PAL;
  const G3 = { x1: 160, x2: 840, base: 820, top: 786, bot: 832, mid: 809 };
  FILM.defShot('stair-section', {
    draw(ctx, t, T) {
      L.blueprintPlate(ctx, { cx: 500, cy: 820, r: 600 });
      const g = (i) => L.drawOn(T, 16.5 + i * 0.125);                    // traces on 16ths
      const ln = (x1, y1, x2, y2, k, o = {}) => L.lineTo(ctx, x1, y1, x2, y2, k, { color: PAL.line, width: 2.5, alpha: 0.85, ...o });
      // ---- section (top): treads and risers, slab, handrail ----
      const n = 6, run = 92, rise = 56, x0 = 214, y0 = 704;
      const zig = [[x0 - 70, y0]]; for (let i = 0; i < n; i++) { zig.push([x0 + i * run, y0 - i * rise], [x0 + i * run, y0 - (i + 1) * rise]); } zig.push([x0 + n * run, y0 - n * rise], [x0 + n * run + 80, y0 - n * rise]);
      const slab = zig.concat([[x0 + n * run + 80, y0 - n * rise + 44], [x0 + n * run - 20, y0 - n * rise + 44], [x0 + 40, y0 + 44], [x0 - 70, y0 + 44]]);
      const k0 = g(0), k1 = g(1);
      if (k0 > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x0 - 80 + (n * run + 180) * k0, 1920); ctx.clip();
        L.hatch(ctx, slab, { gap: 8, color: PAL.lineGold, width: 1.2, alpha: 0.55, seed: 300 });
        L.ink(ctx, zig, { color: PAL.line, width: 3.5, alpha: 0.9, seed: 301, double: true });
        L.ink(ctx, [[x0 + n * run + 80, y0 - n * rise + 44], [x0 + n * run - 20, y0 - n * rise + 44], [x0 + 40, y0 + 44], [x0 - 70, y0 + 44]], { color: PAL.line, width: 2.5, alpha: 0.85, seed: 302 });
        for (let i = 0; i < n; i++) L.stipple(ctx, x0 + i * run + 6, y0 - (i + 1) * rise + 6, run - 12, 30, 16, { color: PAL.lineGold, r: 1.2, alpha: 0.7, seed: 310 + i });
        ctx.restore();
      }
      if (k1 > 0) {                                                       // handrail and balusters
        ln(x0 - 20, y0 - 170, x0 + n * run + 40, y0 - n * rise - 170, k1, { width: 4, seed: 320 });
        ln(x0 - 20, y0 - 158, x0 + n * run + 40, y0 - n * rise - 158, k1, { width: 1.5, color: PAL.lineGold, seed: 321 });
        for (let i = 0; i <= n; i++) if (i / n <= k1) { const bx = x0 + i * run - 20 + (i === 0 ? 0 : 40), by = y0 - i * rise + (i === 0 ? 0 : 0); L.line(ctx, bx, by, bx, by - 166 + (i ? -0 : 0), { color: PAL.line, width: 2, alpha: 0.8, seed: 330 + i }); }
        L.bracket(ctx, x0 + run, y0 - rise - 86, x0 + 2 * run, y0 - rise - 86, { color: PAL.lineGold, width: 1.5, tick: 8, alpha: 0.8, seed: 340, k: k1 });
        L.bracket(ctx, x0 + 3 * run + 20, y0 - 2 * rise, x0 + 3 * run + 20, y0 - 3 * rise, { color: PAL.lineGold, width: 1.5, tick: 8, alpha: 0.8, seed: 341, k: k1 });
      }
      // ---- elevation (bottom): the stair seen from the front, its width on the G3 span ----
      const k2 = g(2), k3 = g(3), ey0 = 880, eh = 60, steps = 7;
      if (k2 > 0) {
        for (let i = 0; i <= steps; i++) { const y = ey0 + i * eh, kk = L.clamp(k2 * (steps + 1) - i); if (kk > 0) { ln(G3.x2, y, G3.x1, y, kk, { width: 3, seed: 350 + i }); ln(G3.x2, y + 9, G3.x1, y + 9, kk, { width: 1.3, color: PAL.lineGold, alpha: 0.7, seed: 360 + i }); } }
        ln(G3.x1, ey0, G3.x1, ey0 + steps * eh, k2, { width: 4, seed: 370 }); ln(G3.x2, ey0, G3.x2, ey0 + steps * eh, k2, { width: 4, seed: 371 });
      }
      if (k3 > 0) {
        for (let i = 0; i < steps; i++) { if (i % 2 === 0) L.stipple(ctx, G3.x1 + 30, ey0 + i * eh + 16, 620, eh - 22, 90, { color: PAL.lineGold, r: 1.2, alpha: 0.55 * k3, seed: 380 + i }); else L.hatch(ctx, [G3.x1 + 28, ey0 + i * eh + 12, 624, eh - 14], { gap: 12, color: PAL.lineGold, width: 1, alpha: 0.4 * k3, seed: 390 + i }); }
        for (const x of [G3.x1, G3.x2 - 24]) { L.rect(ctx, x, ey0, 24, steps * eh, { fill: PAL.bpLight, color: PAL.line, width: 2.5, alpha: k3, seed: 400 + x }); L.hatch(ctx, [x, ey0, 24, steps * eh], { gap: 5, color: PAL.lineGold, width: 1, alpha: 0.7 * k3, seed: 401 + x }); }
        L.bracket(ctx, 906, ey0, 906, ey0 + steps * eh, { color: PAL.lineGold, width: 1.5, tick: 10, ticks: steps, alpha: 0.8, k: k3, seed: 410 });
        ln(500, y0 + 60, 500, ey0 - 10, k3, { color: PAL.lineGold, width: 1.2, alpha: 0.5, dash: [8, 8], seed: 411 });
      }
      // extension lines and the dimension bracket (rulerSnap on T 17.0)
      const kb = L.drawOn(T, 17.0);
      if (kb > 0) {
        for (const x of [G3.x1, G3.x2]) L.line(ctx, x, ey0 - 6, x, G3.top - 26, { color: PAL.line, width: 1.5, alpha: 0.7 * kb, dash: [8, 6], seed: 420 + x });
        L.bracket(ctx, G3.x1, G3.mid, G3.x2, G3.mid, { color: PAL.line, width: 3.5, tick: 20, ticks: 34, k: kb, seed: 430 });
        if (kb >= 1) for (const x of [G3.x1, G3.x2]) L.glowDot(ctx, x, G3.mid, 5, { ticks: 6 });
      }
      // `change`: the clause tag snaps onto the bracket on T 17.5
      const fl = L.flash(T, 17.5);
      if (fl > 0) { L.rect(ctx, G3.x1 - 10, G3.top - 6, G3.x2 - G3.x1 + 20, G3.bot - G3.top + 12, { color: PAL.change, width: 6, alpha: fl, seed: 440 }); L.ripples(ctx, 500, G3.mid, T, 17.5, { color: PAL.change, n: 2, r: 360, dur: 0.5 }); }
    },
    text(ctx, t, T) {
      const p = L.pop(T, 17.5);
      if (p > 0) {
        L.clauseTag(ctx, 500, 809, { scale: p, size: 32, outline: PAL.bpDeep });
        if (FILM.CFG.VALUE) L.txt(ctx, String(FILM.CFG.VALUE), 500, 760, { size: 46, weight: 700, color: PAL.line, scale: p });
      }
    },
  });
})();
