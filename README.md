# Emtithal films

Procedural videos for Emtithal: every frame is drawn in JavaScript on a canvas, the sound is synthesised, and
headless Chromium renders frame-exact MP4s. Status of every cut: **DRAFT**. Read `docs/decisions.md` first: it lists
what is unconfirmed, what is a placeholder and what was not built.

| Video | Source | Export |
|---|---|---|
| "اسأل الكود", 40 s, 1080x1920 | `src/` (engine, 18 shots, audio) | `exports/emtithal-ask-the-code-phone.mp4` |
| Teaser, 16 s, 1080x1080 | `teaser/teaser.js` | `exports/emtithal-teaser.mp4` |
| UI walkthrough, 14 s, 1080x1080 | `ui/walk.js` + `ui/shots/` | `exports/emtithal-ui-walk.mp4` |
| Design-system reveal, 10 s, 1080x1350 | `ui/system.js` + `ui/shots/` | `exports/emtithal-ui-system.mp4` |

The subtitle timings are `emtithal-ask-the-code-subtitles-ar.srt`.

## Requirements

Node 20+, ffmpeg on PATH, Playwright with Chromium (`npm i -D playwright && npx playwright install chromium` if it is
not already available), then `npm install` for the fonts.

## Commands

```bash
node tools/build.cjs                      # emtithal-ask-the-code.html (self-contained player)
node tools/sheet.cjs                      # whole-film contact sheet -> build/sheet-film.jpg
node tools/sheet.cjs the-reveal 6         # six frames of one shot
node tools/render.cjs                     # master, clean, phone, stems, cover, SRT -> exports/
node tools/render.cjs --final             # refuses while ledger items in src/config.js are unconfirmed
node tools/teaser.cjs --render            # exports/emtithal-teaser.mp4
node tools/ui-video.cjs walk --render     # exports/emtithal-ui-walk.mp4
node tools/ui-video.cjs system --render   # exports/emtithal-ui-system.mp4
node tools/brand.cjs                      # re-embed src/brand/*.svg into src/brand.js
```

## Where things are

- `src/config.js`: book count, stair example, CTA, draft flag, audio mix (currently effects only: no voice, no music).
- `src/lib.js`, `src/objects.js`: drawing engine and shared geometry. `src/shots/NN-*.js`: one file per shot.
- `src/audio.js`: score, effects and voice mix. `vo/vo-master.wav`: scratch voice (not in the current mix).
- `src/brand/`: the team's logo SVGs.
- `ui/shots/`: screenshots of the frontend and `manifest.json` with the regions the cursor and camera use.

The two film masters (about 250 MB each) and the audio stems are not in git; re-render them or share them separately.
