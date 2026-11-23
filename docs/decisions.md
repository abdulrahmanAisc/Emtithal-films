# Status and decisions

Every cut in this repository is a **DRAFT** and carries a "مسودة · DRAFT" tag. `node tools/render.cjs --final`
refuses to run until the items marked BLOCKING are set in `src/config.js`.

## Open items

| Item | Status |
|---|---|
| Number of books (`CFG.N`) | **BLOCKING.** Provisional 24. Confirm against the live knowledge base, then set `nConfirmed`. |
| Stair example: book code, clause number, quote | **BLOCKING.** Unconfirmed in the 40 s film: clause pills read `البند ___`, no value is drawn, shot 11 draws word bars instead of text. |
| Value, page, table and figure numbers | Unconfirmed. Drawn blank or omitted. |
| CTA | Safe version: "ابدأ الآن". |
| Disclaimer wording | Pending sign-off. |
| Voiceover | Not in the mix. `vo/vo-master.wav` is a robotic scratch read for timing only. |
| Sound | Effects and room tone only (`CFG.mix`); no voice, no music. |
| Logos | The team's SVG files in `src/brand/`, flat tint only. |

## Decisions in the 40 s film

1. Two layers per shot: `draw` (inked forms, boil, grain) and `text` (crisp strings, numbers, logo, UI chips).
2. The hook label is set in two lines at Bold 56 so it stays inside the frame.
3. Cue 1 lifts the whole word وآلاف.
4. Trust beat: the picture is frozen from T 33.25 to 34.0; the subtitle still leaves at its SRT time.
5. The page lattice is 38 x 34 cells.
6. Shot 03 reuses the desk and tower of shot 01; shot 09 shows a side section and a front elevation; shot 14 is
   seen from above and shows a reading note, never a result; shot 17's gold book stands upright.
7. The voice WAV is embedded in the HTML player as base64 so the single file plays from disk.

## UI videos

`ui/shots/` holds screenshots of the Emtithal frontend run locally without a backend, fed with stand-in data.
Placeholders are visible on screen (page counts of 0, books titled only by their code, English clause fragments with
no Arabic text, no signed-in user), and the answer shown is a stand-in, not a recording of the live assistant.
Re-capture against the real product before publishing. The cursor, clicks, camera and the growing text selection are
drawn over the captured states.

## Not built

The three 15 s hook cuts, and the full review gate (no listening review, no match-cut pixel checks, no licensed
engineer's confirmation).
