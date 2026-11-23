# Emtithal films: notes for a Claude session

Procedural videos: every frame is a pure function of time drawn on a canvas, sound is synthesised in Web Audio,
headless Chromium renders frame-exact MP4s. Read `README.md` for commands and `docs/decisions.md` for what is still
draft, placeholder or unconfirmed. The creative and technical brief is `docs/emtithal-ask-the-code-film-brief.md`.

## Rules that must hold

- Determinism: no `Math.random`, `Date` or `performance.now` in drawing or audio. Use `L.rnd`, `L.rs`, `L.hash`, `L.rng`.
- A shot is `FILM.defShot(id, { draw, text })` in `src/shots/NN-id.js`. `draw` is inked forms (boil, grain on top);
  `text` is the crisp layer: every string, number, logo and UI chip goes there.
- Colours come from `L.PAL` only. No red and no green (they read as pass/fail verdicts). `PAL.change` is for
  "found" moments, 12 frames at most.
- Never invent a clause number, value, quote or book count. Unconfirmed values stay `null` in `src/config.js` and
  render as `___` through `FILM.slot`. The films show reading and finding, never a compliance verdict.
- Logos are drawn from `src/brand/*.svg` exactly, with a flat tint only.
- Shared geometry lives in `src/objects.js` (desk and lamp, tower, gold view, hand, note, logos). Reuse it so match
  cuts land on the same pixels.
- The sound is effects only by the owner's choice (`CFG.mix`). Do not bring the voice or music back unasked.

## Workflow

1. Edit a shot, then look at it: `node tools/sheet.cjs <shot-id> 6` and `node tools/sheet.cjs --at <T>`.
2. Review the whole film on `node tools/sheet.cjs` before rendering.
3. Render with `node tools/render.cjs` (about five minutes). Frames go to `build/`, which is not committed.
4. UI videos: timelines are in `ui/walk.js` and `ui/system.js`; cursor targets come from `ui/shots/manifest.json`.
   Re-capturing the screenshots needs the private product repo running locally (`ui/capture.cjs`).

Files over 100 MB cannot be pushed to GitHub: keep the crf 16 masters out of git.
