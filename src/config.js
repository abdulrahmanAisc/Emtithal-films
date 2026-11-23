// Film namespace and the values that must be confirmed from the live product (brief sections 12, 17).
window.FILM = { shots: {}, lib: {}, obj: {} };

FILM.FPS = 24; FILM.BPM = 120; FILM.DURATION = 40; FILM.W = 1080; FILM.H = 1920;

FILM.CFG = {
  // {N}: number of books the live knowledge base shows. PROVISIONAL. Not confirmed.
  N: 24,
  nConfirmed: false,
  // Stair example, section 12.2. null = not confirmed: the film draws a blank slot "___" and no value.
  CODE: null,      // e.g. 'SBC 201'
  CLAUSE: null,    // clause number string
  VALUE: null,     // width with unit
  QUOTE: null,     // verbatim Arabic sentence for shot 11
  PAGE: null,      // page number for shot 10
  TABLE_N: null,   // for الجدول {n}
  FIGURE_N: null,  // for الشكل {n}
  // CTA: 'ابدأ مجانًا' only if the free plan is confirmed to include اسأل الكتاب (12.1).
  cta: 'ابدأ الآن',
  // draft = true burns a small DRAFT tag; the final render refuses to run while anything above is unconfirmed.
  draft: true,
  subs: true,
  // default mix: sound effects and room tone only (no voiceover, no music). Set both to 1 to bring them back.
  mix: { music: 0, vo: 0 },
};
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get('subs') === '0') FILM.CFG.subs = false;
  if (q.get('draft') === '0') FILM.CFG.draft = false;
  if (q.get('n')) FILM.CFG.N = +q.get('n');
})();
// Blank slot used wherever a product value is still unconfirmed.
FILM.slot = (v) => (v == null ? '___' : String(v));

FILM.TIMELINE = [
  ['the-tower', 0.0, 2.5, 'ILL'], ['page-storm', 2.5, 4.0, 'SCH'], ['one-question', 4.0, 5.0, 'ILL'],
  ['the-flip', 5.0, 6.5, 'ILL'], ['reference-maze', 6.5, 8.0, 'SCH'], ['the-reveal', 8.0, 10.5, 'ILL'],
  ['search', 10.5, 13.5, 'SCH'], ['ask', 13.5, 16.5, 'ILL'], ['stair-section', 16.5, 18.0, 'SCH'],
  ['original-page', 18.0, 20.0, 'ILL'], ['verbatim-match', 20.0, 22.5, 'SCH'], ['explain-simply', 22.5, 25.5, 'ILL'],
  ['links-web', 25.5, 28.0, 'SCH'], ['my-project', 28.0, 31.0, 'ILL'], ['dont-know', 31.0, 34.0, 'ILL'],
  ['proof', 34.0, 36.5, 'SCH'], ['the-desk', 36.5, 37.5, 'ILL'], ['end-card', 37.5, 40.0, 'BRAND'],
].map(([id, start, end, mode]) => ({ id, start, end, mode }));

// A shot is { draw(ctx, t, T), text(ctx, t, T) }: draw = inked forms (boil, grain on top),
// text = crisp layer drawn after the grain (product strings, numbers, logo never boil or get grain).
FILM.defShot = (id, def) => { FILM.shots[id] = def; };
