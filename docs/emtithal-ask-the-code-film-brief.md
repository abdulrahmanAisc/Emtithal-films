# Emtithal Film Brief: "اسأل الكود" (Ask the Code)

> Public copy. 10 lines of internal notes (unpublished figures, open business questions) were removed; the creative, technical and review sections are complete. The full brief is kept privately by the team.

A director's brief for Claude. Build a 40 second vertical film, with an Arabic voiceover and Arabic subtitles, in which **every frame is drawn in JavaScript on a canvas and the music and sound effects are synthesised in JavaScript**, in the style of Kevin Ngo's "The life of a fruit fly", dressed in Emtithal's brand. The subject: how Emtithal lets anyone talk to the Saudi Building Code and guides them through it.

It is built on the same method as the Safqah films ("لبنة فوق لبنة" and "من المخطط إلى المفتاح"), with three additions those films do not have: a voiceover, burned-in subtitles, and on-screen numbers used as hooks.

Read this whole file before writing any code. Where this file is specific (a hex, a time, a pixel, an Arabic word), follow it exactly. Where it is silent, make a decision, write it down in `docs/decisions.md`, and keep going.

---

## 0. How to use this file (for the human)

**Path A (recommended): Claude Code + the `procedural-film` skill.**
The open-source skill at `https://github.com/kuhnhomeuk-cell/procedural-film` is modelled directly on the reference film and contains the engine (deterministic `renderAt(t)`, on-twos animation, 12 fps line boil, Web Audio score engine, headless-Chrome frame-exact render, contact-sheet review, a six-check gate).

```bash
git clone https://github.com/kuhnhomeuk-cell/procedural-film.git
ln -s "$PWD/procedural-film/skills/procedural-film" ~/.claude/skills/procedural-film
# requirements: Node 20+, ffmpeg on PATH, Playwright Chromium
```

Prompt: *"Use the procedural-film skill in drawn mode. The brief, script, subtitles, art direction, storyboard and brand rules are in `emtithal-ask-the-code-film-brief.md`, and the subtitle timings are in `emtithal-ask-the-code-subtitles-ar.srt`. This brief replaces the skill's house palette, wordmark and no-text rules (sections 3, 4, 8 and 13). The voiceover WAV is the one allowed media file (section 7.4). Follow the skill's pipeline and its gate."*

**Path B (lighter): claude.ai, one HTML file.** Paste this file and the SRT, ask for a single self-contained HTML player that implements section 14.2, then render the MP4 locally with the script in 14.3.

**Order of work that matters:** lock the voiceover first (a scratch read to the timing sheet in section 7 is enough), then animate to it. A film animated before its voice is recorded gets re-cut twice.

---

## 1. Mission, audience, the one idea

**The one idea, felt in 40 seconds:**

> The Saudi Building Code is dozens of books and thousands of pages. You have one question. With Emtithal, you ask the code and it answers you from its own text, shows you the clause and its original page, and tells you honestly when the book does not say.

**Who watches** (from Emtithal's own segment list): design and engineering office engineers, technical inspection companies, contractors and site engineers, developers, villa owners, and engineering students. Saudi, Arabic-first, on a phone, often in a scroll feed with the sound off.

**Their pain, in their words:** "وين البند؟" (where is the clause), "كم رقمه؟" (what number), "هل ينطبق على مشروعي؟" (does it apply to my project). Clauses point to other books, the English and Arabic editions sit in separate files, and answers from colleagues come without a reference.

**What we want them to do:** open Emtithal and ask their first question, free.

**Tone:** clear, confident, helpful, never boastful. A knowledgeable colleague, not an advert. Saudi white dialect (لهجة بيضاء سعودية) in the voice; the same words in the subtitles.

---

## 2. The reference: how "The life of a fruit fly" was made

Source: `https://x.com/kevin_t_ngo/status/2099858454043349342`. 1080x1080, about 27 s, music and effects throughout. Caption: Claude Opus 5 drew every frame of this animation using JavaScript.

### 2.1 Method (from the author's replies and from people who reverse-engineered it)

1. **One HTML file.** The model drew every frame with JavaScript on a canvas and composed the music and sound effects with the Web Audio API in the same file. No image files, no stock footage, no video model, no audio files.
2. **Every frame is a pure function of time.** `window.renderAt(t)` paints the frame for any moment `t`. No `Math.random()`, no wall clock, no state carried between frames. Randomness is seeded from hashes. This is what makes frame-exact rendering possible.
3. **Rendered, not screen-recorded.** Headless Chrome seeks frame `i` as `t = i / fps`, screenshots the canvas, and ffmpeg muxes the frames with an offline-rendered audio track. Nothing drops or drifts.
4. **Iterated from the previous piece.** The author showed the model his previous film as the reference for each new one. For us, this brief plays that role.
5. **Density comes from lots of code.** The author credits the model's habit of writing a lot of code for the density of detail. Scenes of 1,000+ lines are normal. Do not be economical.
6. **Fast cutting.** Slower cutting stops reading as animation. Shots are 1 to 2.5 s.
7. **The model looks at its own frames and fixes them.** Render contact sheets, look, correct, repeat.

### 2.2 Style rules observed in the reference

1. **Two alternating visual modes**, cut against each other every 1 to 2.5 s:
   *Illustrated* (warm hand-inked paper, shows the life) and *Schematic* (dark blueprint, explains what happens inside).
2. **Illustrated mode:** cream paper with visible grain; dark ink outlines, slightly irregular, sometimes doubled; tone from directional hatching and cross-hatching, never gradients; flat muted colours; faint construction lines extending past forms; wide diagonal stripes as a recurring background.
3. **Schematic mode:** very dark background; thin pale linework at partial opacity; hexagonal or rectangular cell lattices; stippled fills; glowing star-like nuclei with radial ticks; guide geometry everywhere (huge faint circles, long diagonals, measurement brackets, ticks); **one hot accent colour reserved only for moments of change**.
4. **Motion-graphic overlays on illustrations:** thin coloured rings, arcs, trajectories and guide lines showing paths, attention, sound and time.
5. **Editing:** hard fast cuts; match cuts on shape across mode changes; push-ins to macro and pull-backs to reveal scale; time passing shown with a window (sun, sunset, moon) and tally marks; **the film ends where it began, so it loops**.
6. **Density:** every frame busy with hundreds of hatch strokes, lattice cells and grain.
7. **Animation feel:** drawn on twos at 24 fps (pose changes 12 times a second), lines boil at 12 fps, snappy not floaty.
8. **Sound:** synthesised music and effects that land on the cuts.

---

## 3. Translation: what we keep, what we change

| Reference | Emtithal film |
|---|---|
| Life cycle of a fruit fly | Life of **one question**: asked, searched, answered from the book, traced to its page, explained, applied, and honestly refused when the book is silent |
| Hero: the fly | Hero: **the gold-edged code book** (one SBC volume), which becomes Emtithal's single gold reading view |
| Egg blueprint | The **page lattice**: thousands of tiny page cells, the code as data |
| Nervous-system schematic | The **reference web**: a clause with its exceptions, tables, figures and the other books it points to |
| Compound eye mosaic | The **verbatim match**: the answer's quote and the book's line, joined letter by letter |
| Window with sun and moon | The **desk lamp**: late night for the hunt, the same lamp calm for the honest "لا أعرف" |
| No text, no voice | **Arabic voiceover + burned-in Arabic subtitles + drawn numbers** (sections 7, 8) |
| Loop back to the egg | Loop back to the desk: the tower of books is gone, one gold book remains |
| Cream paper, brown ink, navy blueprint, magenta | Emtithal's own gold system (section 4): warm paper from brand-50, ink #252D3B, a deep slate blueprint, gold for moments of finding |
| Square 1080x1080 | **Vertical 1080x1920**, recomposed for height |

**UI moments are drawn, not screen-recorded.** Every Emtithal screen in the film (the knowledge base, the search field, "اسأل الكتاب", the selection menu) is redrawn in the film's inked style, using the product's real Arabic strings from section 8.3, so the film keeps one look and never shows a stale screenshot.

---

## 4. Brand system

### 4.1 Emtithal tokens (from the product repository)

Source: `frontend/web/src/branding/brands/emtithal.ts` in `AISC-SA/emtithal-platform`, the default brand. These are the product's own values; use them exactly.

| Token | Hex | Role in the film |
|---|---|---|
| brand-50 | #FFFEF2 | Paper base |
| brand-100 | #FBF6E8 | Paper shade, UI card fill |
| brand-200 | #F4F0E4 | Deep paper, stripe band |
| brand-300 | #E6D9AE | Secondary gold lines on the blueprint |
| brand-400 | #E8C55A | Highlighter, the "found" moment |
| brand-500 | #DBA61C | The hero book's gold edge, the hero colour |
| brand-600 | #C9910A | Hero hatching, overlay gold |
| brand-700 | #AF8516 | Hero cross-hatch |
| brand-900 | #8F6A09 | Deepest gold shadow |
| ink | #252D3B | All ink outlines, subtitle text on paper |
| ink-strong | #1A2029 | Night, blueprint family, end-card type |
| cta | #E3A50B | End-card button, the "answer found" glow core |

### 4.2 Derived film palettes

Derived from the tokens for drawing. Mark them as derived in code comments. Put every value in one `PAL` object.

**Paper plate**

| Key | Hex | Use |
|---|---|---|
| paper | #FFFEF2 | Base |
| paperShade | #FBF6E8 | Shadow side of paper, page stacks |
| paperDeep | #F4F0E4 | Vignette |
| stripeA | #FFFEF2 | Stripe band A |
| stripeGold | #F1EACD | Stripe band B, default (brand-300 at 55% on brand-50) |
| stripeSand | #F4F0E4 | Stripe band B for the hunt (act 1) |
| ink | #252D3B | Main outlines |
| inkSoft | #4A5263 | Secondary outlines, text lines on pages |
| inkFaint | #8B919C | Construction lines |
| hero | #DBA61C | Hero book edge, gold UI |
| heroShade | #C9910A | Hero hatching |
| heroDeep | #AF8516 | Hero cross-hatch |
| spineSlate | #3B4456 | Book spines in the tower |
| spineStone | #C9C3B4 | Book spines in the tower |
| spineSand | #E6D9AE | Book spines in the tower |
| desk | #B89A72 | Drafting desk |
| deskDeep | #8E7350 | Desk grain and shadow |
| lampGlow | #FFF3CC | Lamp pool (flat shape, never a gradient on paper) |
| night | #1A2029 | Night window |

**Blueprint plate**

| Key | Hex | Use |
|---|---|---|
| bp | #141922 | Base (deeper than ink-strong) |
| bpDeep | #0C0F15 | Opening and hush frames |
| bpLight | #222A37 | Panels, circle fills |
| bpGrid | #2E3747 | 60 px grid |
| line | #FBF6E8 | Main linework at 85% |
| lineGold | #E6D9AE | Secondary lines, lattices |
| glow | #FFF3CC | Nucleus cores |
| change | #E8C55A | Moments of finding only, 12 frames max per event |

**Overlays on paper:** ovGold #C9910A (attention rings, trajectories), ovInk #252D3B (rulers, brackets, tallies), ovSlate #5B6B82 (secondary guides). At most three overlay colours on screen at once.

**No red and no green anywhere.** Those read as compliance verdicts (fail, pass) and this film makes no verdicts.

### 4.3 Type

- The product uses **Noto Kufi Arabic** (Arabic) and **Inter** (Latin), loaded in `frontend/web/src/app/layout.tsx`. Use the same pair. Both are under the SIL Open Font License; install them from npm (`@fontsource/noto-kufi-arabic`, `@fontsource/inter`) and embed them as base64 `@font-face`.
- Await `document.fonts.load(...)` for every face and weight before frame 0. Drawing before fonts load breaks determinism.
- Arabic is drawn with `ctx.direction = 'rtl'` and `textAlign = 'right'` (or centred). Never hand-shape Arabic. Western digits (25, 2024), matching the product.
- Weights: subtitles SemiBold 600; drawn numbers Bold 700 at display sizes; UI strings Regular 400 and Medium 500.

### 4.4 Logo

Take the mark and the wordmark from `frontend/web/src/components/icons/Logo.tsx` (the mark, plain paths) and `LogoText.tsx` (the wordmark) in the repository. The wordmark uses an SVG `<mask>`: reproduce it with an offscreen canvas and `destination-out`, never by redrawing it by eye. Store the paths in `src/brand.js`. Draw the logo with `fill()` only: no boil, no wobble, no hatching, no grain, no shadow, no recolour beyond the product's own ink or gold, no distortion. Keep clear space equal to the mark's height on every side. The grain pass skips the logo's bounding box plus its clear space.

### 4.5 What is not drawn

No SBC Center, ministry, Balady, Salamah or government logos or seals. No partner logos. No real project names. No people's faces: hands and sleeves only (a white thobe cuff for the engineer, a work-shirt cuff for the site engineer in shot 14).

---

## 5. The film at a glance

- **Title:** اسأل الكود (Ask the Code)
- **Logline:** A tower of code books slams onto an engineer's desk; one small question sits in front of it. The hunt goes nowhere until Emtithal folds the whole code into one gold view that answers from its own text, points to the clause, opens the original page, matches every quote word for word, explains simply, links the exceptions and tables, reads the clause against the project, and says "لا أعرف" when the book is silent.
- **Numbers:** 120 bpm. Beat 0.5 s = 12 frames. Bar = 2 s. **40 s = 20 bars = 960 frames at 24 fps.** 1080x1920. 18 shots.
- **Direction:** Arabic-first. Motion that carries meaning flows **right to left**: search results arrive from the right, the answer card slides in from the right, trajectories run right to left.
- **Safe area (vertical, social UI):** anything that must be read sits inside x 60 to 940 and y 220 to 1540; its centre line is **x 500**, so must-read content is centred there, not on x 540. The subtitle band is inside it (section 8.1).
- **Frame grid:** a 32nd note is 1.5 frames at 24 fps, and the voice times are not whole frames. Picture events and subtitle in-times round to the nearest frame; subtitle out-times round down; audio events stay exact. Backgrounds, stripes, grain and guide geometry run full bleed.
- **Shot length:** the voice sets the pace, so five shots (07, 08, 12, 14, 15) run 3 s, longer than the reference. Every shot longer than 2.5 s must change state or move camera on every beat, so it still reads as animation.

---

## 6. Structure and hooks

### 6.1 The arc

| Part | Time | Job | Shots |
|---|---|---|---|
| Hook | 0.0 to 2.5 | Stop the scroll with a number and an image | 01 |
| Problem | 2.5 to 8.0 | Name the pain in the viewer's own questions | 02 to 05 |
| Reveal | 8.0 to 10.5 | Bar 5 downbeat: the tower folds into one gold view | 06 |
| Demo 1: find | 10.5 to 13.5 | Search by number, words or meaning | 07 |
| Demo 2: ask | 13.5 to 22.5 | Ask, get the answer, the clause, the page, the verbatim match | 08 to 11 |
| Demo 3: understand | 22.5 to 31.0 | Explain simply, exceptions and tables, apply to my project | 12 to 14 |
| Trust | 31.0 to 34.0 | The honest "لا أعرف" | 15 |
| Proof | 34.0 to 36.5 | The numbers, said and drawn | 16 |
| CTA and loop | 36.5 to 40.0 | Back to the desk; logo, line, start free | 17, 18 |

**The trust beat is the strongest moment, protect it.** From T 33.0 to 34.0 the music and effects drop to silence under "لا أعرف", and from T 33.25 to 34.0 the frame holds still (boil and grain freeze). Everything else in the film moves; this beat does not.

### 6.2 Hook rules (the first 2.5 seconds)

1. A number on screen from frame 0, drawn huge: **{N}**, the live number of books in Emtithal's knowledge base (section 12). It is outlined from frame 0 and fills with ink as the books land. Above it, from frame 0, the label **كود البناء السعودي** (Noto Kufi Arabic Bold 64, ink), so a muted viewer knows what the books are.
2. Motion from frame 0: the first book is already falling.
3. The first subtitle is on screen from frame 0, a quarter second before the voice, because most viewers start with sound off.
4. No logo in the hook. The brand arrives at the reveal, once the viewer cares.
5. **Cover frame:** export frame T 2.0 (the full tower, the label and the number) as the platform thumbnail.

### 6.3 Hook variants for A/B testing (same film, only shot 01 and line 1 change)

| Variant | Voice line | Drawn number | Status |
|---|---|---|---|
| A (default) | كود البناء… عشرات الكتب، وآلاف الصفحات. | **{N}** books in the tower | {N} confirmed from the live knowledge base (section 12) |
| B | كم مرة دوّرت على بند واحد؟ | a page counter spinning up | No number to verify |
| C | الكود الجديد صار إلزامي… تعرف بنوده؟ | **2024**, with the small drawn line إلزامي منذ 30 يونيو 2025 | Public fact (section 12) |

Every variant's voice line fits the line 1 slot (T 0.25 to 2.40) at no more than 2.8 words per second.

Render A as the master. Render A, B and C as 15 s hook cuts (section 16) so the team can test which opening holds viewers longest.

**15 s cut timing sheet** (same for A, B and C; each cut gets its own SRT):

| Cut T | Source | Content |
|---|---|---|
| 0.0 to 2.5 | shot 01 (hook variant) | the hook line |
| 2.5 to 5.0 | shot 06, T 8.0 to 10.5 | VO 5 |
| 5.0 to 8.0 | shot 08 condensed (tap at 5.75) then shot 10's frame snap | VO 7, then VO 9 |
| 8.0 to 10.5 | shot 15, T 31.5 to 34.0 | VO 15 and the trust beat |
| 10.5 to 12.5 | shot 16 condensed | VO 16 |
| 12.5 to 15.0 | shot 18 | VO 18 |

---

## 7. Voiceover script (Arabic)

### 7.1 Timing sheet

Times are global T in seconds. The voice reads to a 120 bpm click. Each line must start within 0.1 s of its time and end before the next line starts. The English is for the team only and never appears on screen.

| # | In | Out | Shot | Arabic (spoken and subtitled) | Meaning |
|---|---|---|---|---|---|
| 1 | 0.25 | 2.40 | 01 | كود البناء… عشرات الكتب، وآلاف الصفحات. | The building code… dozens of books, thousands of pages. |
| 2 | 2.60 | 4.40 | 02, 03 | وأنت عندك سؤال واحد بس. | And you have just one question. |
| 3 | 5.00 | 6.40 | 04 | وين البند؟ كم رقمه؟ | Where's the clause? What's its number? |
| 4 | 6.50 | 7.90 | 05 | وهل ينطبق على مشروعي؟ | And does it apply to my project? |
| 5 | 8.10 | 10.40 | 06 | مع امتثال، الكود صار يجاوبك. | With Emtithal, the code answers you. |
| 6 | 10.60 | 13.40 | 07 | ابحث برقم البند، أو بكلمة، أو حتى بالمعنى. | Search by clause number, by a word, or even by meaning. |
| 7 | 13.70 | 16.20 | 08 | اسأل: ما الحد الأدنى لعرض الدرج؟ | Ask: what is the minimum stair width? |
| 8 | 16.50 | 18.80 | 09, 10 | يجاوبك من نص الكود، ويحدد البند، | It answers from the code's own text, points to the clause, |
| 9 | 18.85 | 20.20 | 10 | ويوريك صفحته الأصلية. | and shows you its original page. |
| 10 | 20.30 | 22.40 | 11 | وكل اقتباس يطابق الكتاب كلمة بكلمة. | And every quote matches the book word for word. |
| 11 | 22.60 | 25.30 | 12 | حدّد أي نص، واطلب: اشرح ببساطة. | Select any text and ask: explain simply. |
| 12 | 25.55 | 28.00 | 13 | شوف استثناءاته، وجداوله، وبنوده المرتبطة. | See its exceptions, its tables and its linked clauses. |
| 13 | 28.10 | 30.60 | 14 | واسأل: هل ينطبق على مشروعي؟ | And ask: does it apply to my project? |
| 14 | 31.00 | 32.60 | 15 | وإذا الكتاب ما فيه جواب؟ | And if the book has no answer? |
| 15 | 32.90 | 33.80 | 15 | يقولك: لا أعرف. | It tells you: I don't know. |
| 16 | 34.00 | 36.50 | 16 | {N} كتاب، عربي وإنجليزي، وكل إجابة بمرجع. | {N} books, Arabic and English, and every answer with a reference. |
| 17 | 36.70 | 37.30 | 17 | امتثال. | Emtithal. |
| 18 | 37.60 | 39.60 | 18 | اسأل الكود… وابدأ الحين. | Ask the code… and start now. |

Spoken: `{N}` is the confirmed live book count (section 12), read in dialect with a singular noun after it (for example 24 is **أربعة وعشرين كتاب**). "امتثال" is read **imtithāl**, stress on the last syllable.

If the free plan is confirmed to include "اسأل الكتاب" (section 12), line 18 becomes **اسأل الكود… وابدأ مجانًا.**

### 7.2 Direction for the voice

- **Casting:** one Saudi voice, male or female, late 20s to 40s, warm and clear, the sound of a senior engineer helping a junior one at the next desk. Not a radio announcer. Neutral Saudi white dialect a Riyadh, Jeddah and Dammam audience all hear as their own.
- **Pace:** about 2.5 words per second. Lines 3 and 4 a touch quicker and more frustrated (the hunt). From line 5, settled and confident.
- **Pauses that are part of the script:** the "…" in lines 1 and 18 is a real pause of about 0.3 s.
- **Line 15** is the emotional peak: short, quiet and honest, with a small smile in the voice, landing in the silence. Never sarcastic.
- **Line 18:** "اسأل الكود" lands on the logo; "وابدأ الحين" lifts, as an invitation, not a hard sell.
- **Fallback if line 16 overruns:** say "{N} كتاب، عربي وإنجليزي." and leave "وكل إجابة بمرجع" on screen only; then subtitle 16 may keep the full sentence while the voice is shorter, the one cue allowed to differ.

### 7.3 Recording spec

48 kHz, 24-bit mono WAV, close-mic in a treated room, no music, no processing beyond light de-essing. Record three takes of every line plus the four hook variants of section 6.3. Deliver `vo/vo-master.wav` aligned so T 0 is the click's first downbeat, and the individual line files.

**Scratch first:** before the real session, make a scratch read with any Arabic text-to-speech voice, placed at the times above, so animation can start. Replace it with the recorded take at the end. The film re-times by at most 0.25 s per line to fit the real take; the shot boundaries never move. After the real take, the SRT is re-timed to it, and every later check runs against that final SRT.

### 7.4 The one media exception

The reference film has zero media files. This film keeps that rule for every frame and every note of music and sound, with **one exception: the voiceover WAV**. A human voice cannot be synthesised to this standard in Web Audio. The player loads it, the render tool mixes it, and the gate's media scan whitelists exactly `vo/vo-master.wav` and nothing else.

---

## 8. Subtitles

### 8.1 Burned-in subtitles (drawn by the film)

- **Text:** exactly the Arabic of 7.1, line for line, at the times of 7.1, except cue 1, which starts at frame 0 (6.2). The SRT file `emtithal-ask-the-code-subtitles-ar.srt` is the timing source; the timeline cue list (section 14) is generated from it.
- **Font:** Noto Kufi Arabic SemiBold 600, 50 px, line height 1.5, centred on **x 500** (the safe area's centre), RTL.
- **Band:** baseline of the last line at y 1500; at most two lines; at most 30 characters per line (break where the SRT breaks). The pill is at most 860 px wide, with 24 px horizontal and 14 px vertical padding, and its bottom edge is at or above y 1540. Never over the bottom 380 px or the right-hand button column.
- **Plate:** on paper shots, ink #252D3B text on a brand-100 #FBF6E8 rounded pill at 92% opacity, radius 22 px. On blueprint shots, line #FBF6E8 text on a bp #141922 pill at 80%.
- **Keyword lift:** one or two whole words per cue (never part of a word, which would break the Arabic joins), drawn in brand-900 #8F6A09 on paper (4.6:1 on the pill) or brand-400 #E8C55A on blueprint (exempt from the 12-frame `change` limit). The list per cue:

| Cue | Lift |
|---|---|
| 1 | آلاف |
| 2 | واحد |
| 3 | البند؟ |
| 4 | مشروعي؟ |
| 5 | امتثال، |
| 6 | بالمعنى. |
| 7 | الدرج؟ |
| 8 | البند، |
| 9 | الأصلية. |
| 10 | كلمة بكلمة. |
| 11 | ببساطة. |
| 12 | استثناءاته، |
| 13 | مشروعي؟ |
| 14 | جواب؟ |
| 15 | أعرف. |
| 16 | {N} and بمرجع. |
| 17 | (none) |
| 18 | الكود… |

- **Motion:** each subtitle pops in over 3 frames (scale 0.96 to 1.0, opacity 0 to 1) and leaves over 3 frames, the leave ending at the cue's out time. No word-by-word karaoke; the lift is enough.
- **Never** let a subtitle cover the thing the voice is describing. If a composition collides with the band, move the composition up.
- **Shots 17 and 18:** subtitle 17 sits in the normal band; subtitle 18 sits in the normal band below the end card's disclaimer.

### 8.2 Platform captions

Upload the SRT as a caption track on every platform that takes one (YouTube, LinkedIn, X, TikTok, Snapchat). Keep the burned-in subtitles too: most of these players hide captions by default.

### 8.3 Product strings used on screen (exact, from `frontend/web/messages/ar.json`)

Draw these exactly as the product writes them. Do not paraphrase.

| Where | String |
|---|---|
| Knowledge base title | قاعدة المعرفة |
| Library subtitle | كتب كود البناء السعودي بنسختيها العربية والإنجليزية |
| Search placeholder | ابحث داخل الكتاب: رقم بند أو كلمات أو سؤال |
| Result tags (how each result matched, `codeViewer.reader.how`) | رقم البند · كلمات · بعض الكلمات · المعنى |
| Language switch | العربية · English · كلاهما |
| Ask panel title | اسأل الكتاب |
| Ask panel subtitle | يجيب من نص {code} فقط مع ذكر البند |
| Suggested questions, in the product's order | ما أقصى مسافة سير إلى المخرج؟ · كم مخرجًا يلزم للطابق؟ · ما الحد الأدنى لعرض الدرج؟ |
| Searching | جارٍ البحث في الكتاب… |
| Trust hint | الإجابات من نص الكتاب فقط، وكل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه. |
| Sources label | المصادر |
| Original page | الصفحة الأصلية من الكتاب |
| Selection menu | اسأل الوكيل · اشرح ببساطة · بنود مرتبطة · كيف يُفحص على المخطط؟ · هل ينطبق على مشروعي؟ |
| Clause links | الاستثناءات · الجدول {n} · الشكل {n} · مرتبط بهذا البند · كتب مرتبطة |
| Project reading note | قراءة الوكيل من بيانات المشروع المسجّلة، وليست نتيجة فحص. |
| Don't know | لا أعرف: نص الكتاب لا يكفي للإجابة عن هذا السؤال. (the product also shows the back end's wording, لا أعرف: نص الكود المعروض لا يكفي للإجابة عن هذا السؤال., when its checker refuses an answer; the film uses the first) |

`{code}` is the book's code (for the stair question, the SBC book the product actually answers from). Fill every placeholder from the real product (section 12.2), never by guessing.

---

## 9. Shared geometry (copy these numbers exactly)

**G1 Book tower.** Desk top line y 1260. {N} books stacked from y 1260 upward, centred x 400, widths 380 to 460 px (seeded), thicknesses scaled so the full tower's top sits near y 420 (seeded within ±20%), each spine offset ±14 px. The last book to land is the hero book: gold edge, width 440. The number `{N}` is centred at (790, 700), Noto Kufi Arabic Bold 260 px; the label كود البناء السعودي is centred at (790, 520).

**G2 Hero book / gold view.** Closed hero book centred (500, 900), 600 x 420 px as drawn in 3/4 view. In shot 06 it opens and flattens into the gold reading view: a rounded rectangle x 90 to 910, y 360 to 1240, radius 36, brand-100 fill, 5 px ink outline. Any text inside it stays within x 150 to 900. Shots 06, 08, 12 and 15 draw their UI inside exactly this rectangle; shot 07 draws on the lattice (G4) and shot 14 on a phone.

**G3 Clause line.** The stair clause as one highlighted line of text: baseline y 820, x 160 to 840, gold selection band 46 px tall. In shot 09 (blueprint) the same span is the dimension bracket over the stair; in shot 10 the gold frame on the original page sits on these pixels; in shot 11 it is the lower of the two matched lines.

**G4 Page lattice.** Region x 80 to 1000, y 300 to 1320 (clear of the subtitle band). Page cells 18 x 24 px with 6 px gutters: about 1,600 cells on screen (a drawn stand-in for "thousands of pages"; never labelled as an exact count).

**G5 Desk and lamp.** The lamp head at (860, 380), its light pool a flat lampGlow ellipse centred (540, 1180), rx 420, ry 120. Identical in shots 01, 03, 04, 15 and 17.

**G6 Answer card.** Slides in right to left to x 120 to 880, y 940 to 1320, radius 28. Holds: answer text lines (inkSoft), the clause tag pill `{CLAUSE}` in hero gold, and the المصادر row.

---

## 10. Shot list

Timings are global T in seconds. `ILL` = illustrated (paper plate), `SCH` = schematic (blueprint plate). Hard cuts unless stated. Every illustrated shot carries at least one overlay. Every event lands exactly on a beat, 8th (0.25 s), 16th (0.125 s) or 32nd (0.0625 s) frame. The **VO** line names the script line from 7.1 that plays over the shot.

### 01 the-tower, T 0.0 to 2.5, ILL, hook
**Composition:** a drafting desk at night under the lamp (G5). Books fall into frame from above and slam into the tower (G1). To the right of the tower, the label كود البناء السعودي and the huge number **{N}** (G1 positions), both visible from frame 0: the number is outlined at first and fills with ink and heroShade hatching as the books land. Stripe band B: stripeSand.
**Forms:** spines in spineSlate, spineStone, spineSand with contour hatching; tiny inked spine labels (illegible scribble lines, never real titles); the hero book last, gold-edged.
**Overlays:** an ovInk ruler up the tower's left side, ticks climbing; an ovGold ring pops around the number on T 1.5.
**Motion:** frame 0: the first book is mid-fall. The books land evenly from T 0.0625 to T 1.5. At this rate the landings are drawn at 24 fps (on-twos is waived for this shot only). The tower sways once on T 1.5 and settles on T 2.0 (the cover frame). The number is fully inked on T 1.5.
**VO:** line 1.
**Sound:** heavy book thuds on 8ths only (seven, from T 0.0 to T 1.5, the last one a deep thump), ducked 9 dB under the voice; a paper-dust puff on T 1.5.

### 02 page-storm, T 2.5 to 4.0, SCH
**Composition:** the tower's outline in line, then its pages burst out into the page lattice (G4), every cell a page, stippled with tiny text lines. A faint guide circle and two diagonals behind. A bracket at the right edge measures the whole lattice: too big to hold.
**Motion:** the lattice fills from the centre outward in rings on 16ths; a `change` flash on T 3.5 at a single cell.
**VO:** line 2 begins.
**Sound:** a riffle of paper grains rising into a soft whoosh; a single tick on T 3.5 at the one cell.

### 03 one-question, T 4.0 to 5.0, ILL
**Composition:** back at the desk, low angle. In front of the tower, tiny by comparison, an engineer's hand (white thobe cuff) sets down one small sticky note with a hand-drawn question mark.
**Overlays:** an ovGold ring around the note; an ovInk bracket comparing the note's height to the tower's (absurd scale).
**Motion:** the note is set down on T 4.25 and flutters once on twos.
**VO:** line 2 ends ("…سؤال واحد بس").
**Sound:** a tiny paper tap; the score thins to a held note.

### 04 the-flip, T 5.0 to 6.5, ILL
**Composition:** an open code book, pages flipping fast; sticky tabs bristle out of its edge; the lamp's pool; a clock face drawn on the wall behind, hands spinning.
**Overlays:** ovSlate motion arcs over the flipping pages; two ovInk question marks pop on T 5.25 and T 5.75.
**Motion:** pages flip on 16ths; a new tab sprouts on each beat.
**VO:** line 3.
**Sound:** rapid page flips on 16ths; a clock tick on each beat.

### 05 reference-maze, T 6.5 to 8.0, SCH
**Composition:** one clause node at centre with lines shooting to other books (small book glyphs at the frame edges), and from those to more, a tangled reference web. Each line ends in a tiny arrow with no label. A small floor-plan glyph (the viewer's project) sits isolated at bottom right, not connected to anything.
**Motion:** lines trace outward on 16ths, crossing and tangling; on T 7.75 everything freezes and the knot flashes once in lineGold (not `change`, which is kept for finding).
**VO:** line 4.
**Sound:** pencil traces on each line; a tense rising pad; a hard stop on T 7.75 for one 8th, where only the reveal swell's pre-roll sounds into T 8.0.

### 06 the-reveal, T 8.0 to 10.5, ILL, the hinge
**Composition:** the tower from shot 01. On the bar-5 downbeat it collapses inward into the single hero book (G2), which opens and flattens into Emtithal's gold reading view. The Emtithal mark appears small in the view's top corner (logo rules, 4.4), with the language switch العربية · English · كلاهما beside it. Stripe band B switches to stripeGold.
**Overlays:** ovGold rings expand from the book as it opens; a single ovInk construction line traces the view's outline.
**Motion:** T 8.0 collapse (outExpo, 6 frames), T 8.5 the hero book lands centred, T 9.0 it opens on twos (three drawings), T 9.5 the view flattens to G2. Inside the view, by T 10.0: the title قاعدة المعرفة and the subtitle كتب كود البناء السعودي بنسختيها العربية والإنجليزية, and a row of small book cards (unlabelled except the SBC code numbers, which are real: 201, 301, 401, 801…).
**VO:** line 5.
**Sound:** the reveal hit on T 8.0 (a warm low swell into a bright chord); the book-open creak on T 9.0; the full groove starts on T 8.0.

### 07 search, T 10.5 to 13.5, SCH
**Composition:** the search field (ابحث داخل الكتاب: رقم بند أو كلمات أو سؤال) drawn as a ruler-like bar across the top of the page lattice. Three searches, one per beat pair, each lighting a different cell that lifts out as a result chip:
- T 11.0: a clause **number** types in (a real clause number from the product); the matching cell lights; its chip carries the tag رقم البند.
- T 12.0: a **word** types in (درج); several cells glow, one lifts; its chip carries كلمات.
- T 13.0: a **question** types in (عرض الدرج) and the lattice reorders by meaning: cells flow right to left toward the answer; its chip carries المعنى.
**Overlays (blueprint style):** each chip is drawn as the product draws a result, `{clause} · {tag}`, with the tags exactly as in 8.3.
**Motion:** typing on 32nds; each hit is a `change` flash.
**VO:** line 6.
**Sound:** soft key taps; a "found" chime on each hit, rising a scale step each time.

### 08 ask, T 13.5 to 16.5, ILL
**Composition:** the gold view (G2) with the اسأل الكتاب panel open, its subtitle يجيب من نص {code} فقط مع ذكر البند, and the trust hint (8.3) in small type at the panel's foot. The three suggested-question chips, in the product's order, sit above the hint. A finger taps the third, ما الحد الأدنى لعرض الدرج؟.
**Overlays:** an ovGold ring on the tapped chip; ovSlate motion lines as the pages behind the panel riffle while جارٍ البحث في الكتاب… shows.
**Motion:** T 14.0, 14.25 and 14.5 the chips pop in; T 15.0 the tap; T 15.25 to 16.25 the searching state, with a small book-riffle glyph turning on twos.
**VO:** line 7.
**Sound:** the tap and a two-note confirm on T 15.0; a soft page riffle under the search.

### 09 stair-section, T 16.5 to 18.0, SCH
**Composition:** a blueprint section of a stair (treads, risers, handrails) with a dimension bracket across its width at the G3 span. The clause tag `{CLAUSE}` snaps onto the bracket. The value appears as `{VALUE}`, taken from the product's real answer (section 12.2); if it cannot be confirmed in time, show the bracket and tag with no value.
**Motion:** the stair traces on 16ths; the bracket opens on T 17.0; the tag snaps on T 17.5 with a `change` flash.
**VO:** line 8.
**Sound:** pencil traces; a rulerSnap on T 17.0; the foundChime on T 17.5.

### 10 original-page, T 18.0 to 20.0, ILL, match cut on G3
**Composition:** the book's original page drawn as a scanned page (slightly warm paper, dense text lines in inkSoft, a page number at the bottom). The G3 span sits on these exact pixels; a gold frame snaps around it, exactly as the product marks the clause on the book's page. Label above the page: الصفحة الأصلية من الكتاب.
**Overlays:** an ovGold frame (the product's frame); an ovInk arrow from the answer card (G6, slid in from the right at the bottom) up to the frame.
**Motion:** T 18.0 match cut from the bracket; T 18.5 the answer card slides in right to left; T 19.0 the frame snaps (outBack, 3 frames).
**VO:** line 8 ends, line 9.
**Sound:** a pageTurn on T 18.0; a frameSnap on T 19.0.

### 11 verbatim-match, T 20.0 to 22.5, SCH
**Composition:** two lines of the same Arabic clause text, one above the other: the top is the quote in the answer, the bottom is the line from the book (G3). Thin vertical ticks join them **word by word**, right to left, each tick lighting as it connects (word positions come from `measureText` on each word; never try to place ticks per letter in joined Arabic). When the last tick lands, the two lines lock with a short gold bar across their right ends. The text must be a real quote from the product's answer.
**Motion:** ticks connect evenly from T 20.25 to T 21.75, one per word; the lock lands on T 22.0 with a `change` flash.
**VO:** line 10.
**Sound:** a tickRun, one tiny click per word, rising; the matchLock on T 22.0 (this film's signature sound).

### 12 explain-simply, T 22.5 to 25.5, ILL
**Composition:** the gold view (G2) showing a dense clause paragraph. A finger selects two lines (the selection drawn as a gold band, brand-400 at 55%). The selection menu blooms from the highlight with its five product options; اشرح ببساطة is tapped. The dense paragraph's text lines then untangle and re-form as three short, clean lines (drawn as lines of text, simpler and wider spaced).
**Overlays:** an ovGold ring on the chosen option; an ovInk bracket from the dense block to the simple one.
**Motion:** T 22.75 the selection drag (full 24 fps for the stroke); T 23.5, 23.5625, 23.625, 23.6875 and 23.75 the five menu items pop; T 24.0 the tap; T 24.5 to 25.25 the lines re-form on twos.
**VO:** line 11.
**Sound:** a soft selection sweep; menu pops; the tap; a gentle "untangle" glissando settling on a clean chord.

### 13 links-web, T 25.5 to 28.0, SCH
**Composition:** the clause as a central node. Lines grow to labelled nodes: الاستثناءات, الجدول {n}, الشكل {n}, مرتبط بهذا البند, and last a related-book node labelled كتب مرتبطة. This is the tangle of shot 05, now ordered: the same kind of lines, straight and clean, each with its label. `{n}` values are real, from the same clause (12.2).
**Motion:** the four clause nodes on T 25.75, 26.25, 26.75 and 27.25; the related-book node on T 27.5, as the web settles and the whole figure takes a slight right-to-left drift.
**VO:** line 12.
**Sound:** one soft bell per node, rising; the shot 05 tension resolved into a major chord on T 27.5.

### 14 my-project, T 28.0 to 31.0, ILL
**Composition:** a floor plan of a small villa on the drafting desk, inked with hatched walls; a hand (work-shirt cuff) holds a phone above it. On the phone, the menu option هل ينطبق على مشروعي؟ is tapped and a project is chosen. The clause card slides down onto the plan and attaches to the stair on the plan. Under it, the note قراءة الوكيل من بيانات المشروع المسجّلة، وليست نتيجة فحص. in legible type (at least 30 px), baseline at or above y 1300.
**Overlays:** an ovGold ring around the stair on the plan; an ovInk dashed trajectory from the phone to the plan.
**Motion:** T 28.5 the tap; T 29.0 the card travels (right to left, then down); T 30.0 it attaches; the note fades in on T 30.25.
**VO:** line 13.
**Sound:** the tap; a slide whoosh; a soft magnetic attach on T 30.0.
**Rule:** no pass or fail label, no green or red. Do not draw the product's `قراءة الوكيل:` result line or any result value (لا يستوفي, يستوفي, لا ينطبق, معلومات ناقصة, يحتاج إلى مهندس); draw only the clause card on the plan and the note. The film shows a reading, not a verdict.

### 15 dont-know, T 31.0 to 34.0, ILL, the trust beat
**Composition:** the desk and lamp (G5), calm, at night. The gold view on the desk. A question bubble is typed (a question the code does not cover; draw its text as scribble lines, illegible). The book glyph in the panel searches, then stops. A plain card answers: لا أعرف: نص الكتاب لا يكفي للإجابة عن هذا السؤال.
**Overlays:** a single ovInk bracket, quiet, around the card.
**Motion:** T 31.5 the question is typed; T 32.0 to 32.75 the search; T 33.0 the card appears with no pop and no flash, a plain fade over 6 frames. From T 33.25 to 34.0 the frame holds completely still: boil and grain freeze.
**VO:** lines 14 and 15.
**Sound:** the room tone and the lamp hum only; from T 33.0 to 34.0 music and effects are silent under "لا أعرف"; on T 34.0 a single soft warm note returns as shot 16 cuts in.

### 16 proof, T 34.0 to 36.5, SCH
**Composition:** the {N} books as a clean blueprint shelf, spine outlines in line. Three drawn proof marks build in sequence, each as a large drawn element: **{N}** over the shelf; a language glyph pair ع / EN; a bracket with a small clause tag (every answer has a reference). Progressing right to left.
**Motion:** the {N} lands on T 34.5, the language pair on T 35.25, the citation bracket on T 36.0, each with a `change` flash.
**VO:** line 16.
**Sound:** three firm hits on the beats, building.

### 17 the-desk, T 36.5 to 37.5, ILL, loop
**Composition:** the opening desk (G5), lamp on, morning light coming in. The tower is gone. One gold book rests where the tower stood, with the Emtithal mark on its cover (logo rules, 4.4) as the voice says امتثال. The sticky note from shot 03 now carries a small gold clause tag (never a tick, which would read as a verdict).
**Motion:** a gentle settle; the lamp clicks off on T 37.0 as daylight takes over.
**VO:** line 17 ("امتثال.").
**Sound:** a lamp click; a soft morning room tone.

### 18 end-card, T 37.5 to 40.0, brand plate
**Composition:** brand-50 #FFFEF2 background with a subtle brand-300 diagonal stripe at 8% opacity. Everything centred on x 500. The Emtithal lockup (wordmark and mark, section 4.4) at y 640. Headline **اسأل الكود.** in ink-strong, Noto Kufi Arabic Bold 88 px, at y 860. Sub line كود البناء السعودي، يجاوبك من نصّه. at y 960, 40 px. A cta-gold #E3A50B pill button **ابدأ الآن** at y 1110 with ink-strong text (it becomes ابدأ مجانًا, the product's own button wording, only if 12.1 confirms the free plan). URL emtithal.aisc.sa at y 1210. Disclaimer in two lines at y 1290 to 1380 (section 13). Subtitle 18 in its band below.
**Motion:** logo on T 37.5 (hard cut, no effect); headline on T 38.0; sub line and button on T 38.5; disclaimer on T 38.5; hold from T 39.0.
**VO:** line 18.
**Sound:** the final chord on T 37.5; the matchLock softly on T 38.0 under "اسأل الكود"; a clean tail to silence by T 40.0.

---

## 11. Sound: score, effects and the voice

All music and effects are synthesised in Web Audio (no samples, no files). The voice is the one recorded track (7.4).

### 11.1 Score

- **Tempo and key:** 120 bpm, 4/4, D minor for the problem (shots 01 to 05), turning to D major on the reveal at T 8.0, and staying major to the end.
- **Palette:** precise and architectural: a muted felt piano, a soft marimba, pizzicato strings, a warm pad, a sub bass, and a light percussion kit of "drafting" sounds (pencil ticks as hats, ruler snaps as the snare, a soft felt kick).
- **Shape:** act 1 is sparse and tense (a ticking pulse, unresolved suspensions); the reveal brings the groove; demos 1 to 3 add one layer each; the trust beat (T 33.0 to 34.0) is silent; the proof (shot 16) is the fullest moment; the end card resolves and tails out.
- **The motif:** four rising notes (D, F#, A, D) first heard complete on the reveal, played again on the end card.

### 11.2 Mixing around the voice

- The voice is king. Under every VO line the music bus ducks by 9 dB (attack 40 ms, release 250 ms) and the SFX bus by 4 dB (9 dB under line 1, over the book thuds). Between lines, music returns to full.
- EQ: cut the music 3 dB from 1 to 4 kHz while the voice speaks, so Arabic consonants stay crisp on phone speakers.
- Voice chain: high-pass 80 Hz, gentle compression (3:1), de-ess, light room reverb matched to the paper plate (0.6 s), dry on the blueprint plate.
- Delivery: about -14 LUFS integrated, true peak -1.5 dB (`loudnorm=I=-14:TP=-1.5:LRA=11`). The voice should sit near -16 LUFS short-term when it speaks.

### 11.3 Sound vocabulary (each sound has one meaning)

| Sound | Meaning | Recipe |
|---|---|---|
| bookThud | the weight of the code | sine 80 to 45 Hz over 120 ms + low-passed noise burst + a 400 Hz knock layer for phones |
| foundChime | something was found | two FM bells a fifth apart (A5, E6), soft attack, 0.8 s |
| tickRun | words being matched | one tiny click per word (3 to 6 kHz), rising |
| matchLock | a quote matched the book (signature) | a solid lock: 4 kHz click + 220 Hz thunk + a short warm bell D6 |
| frameSnap | the clause marked on its page | 2.5 kHz click + 300 Hz thunk, 50 ms |
| rulerSnap | a dimension measured on the blueprint | a dry wooden snap, 1.8 kHz click + 160 Hz body, 40 ms |
| pageTurn | one page turned slowly | a single soft pageFlip, slower and darker |
| pageFlip | searching by hand | band-passed noise 2 to 5 kHz with a flapping envelope |
| pageRiffle | Emtithal searching | a fast, light run of pageFlip grains, quieter and smoother than the manual flip |
| pencilTrace | blueprint lines drawing on | band-passed noise 2 to 4 kHz following the draw-on speed |
| keyTap | typing | 3 kHz tick with a 700 Hz body, 15 ms |
| tap | a finger on the screen | 5 ms high-passed noise + 180 Hz thump |
| confirm | the app responding | two-note sine rise, D6 then A6, 60 ms each |
| selectSweep | selecting text | soft band-passed noise sweep 1.5 to 3 kHz |
| nodeBell | a link appears | soft glass bell, pitched along D major |
| clockTick | time lost (act 1 only) | 3.5 kHz tick with a 900 Hz body, tick and tock a tone apart |
| lampHum | the quiet desk | 100 Hz sine at -36 dB with faint air |
| revealSwell | the hinge | reversed noise swell into a bright D major chord with sub |

**Restraint:** whooshes only on T 2.5 (into the page storm), T 8.0 (the reveal) and T 29.0 (the card travelling). The clock tick exists only in act 1 and stops for good on T 8.0.

### 11.4 SFX cue sheet

Times are global T. These go into the timeline cue list with `kind: 'sfx'` or `'amb'`.

| Shot | T | Sound |
|---|---|---|
| 01 | 0.0 to 1.5 on 8ths | bookThud x7, pitch rising slightly, the last one deeper; SFX ducked 9 dB under line 1 |
| 01 | 0.0 | lampHum and a quiet night room tone (beds) |
| 01 | 1.5 | paper-dust puff (high-passed noise burst) |
| 02 | 2.5 | whoosh into the page storm, then pageRiffle rising to T 3.5 |
| 02 | 3.5 | a single keyTap-like tick at the lit cell |
| 03 | 4.25 | a tiny paper tap |
| 04 | 5.0 to 6.5 on 16ths | pageFlip |
| 04 | 5.0, 5.5, 6.0 | clockTick |
| 05 | 6.5 to 7.75 on 16ths | pencilTrace per line |
| 05 | 7.75 | hard stop for one 8th; only the revealSwell pre-roll sounds |
| 06 | 8.0 | revealSwell; groove in |
| 06 | 9.0 | book open (a soft spine creak) |
| 06 | 9.5 | confirm, softly, as the view settles |
| 07 | 10.75 to 13.0 | keyTap on 32nds while typing |
| 07 | 11.0, 12.0, 13.0 | foundChime, one scale step higher each time |
| 08 | 14.0, 14.25, 14.5 | three small pops as the chips appear |
| 08 | 15.0 | tap + confirm |
| 08 | 15.25 to 16.25 | pageRiffle (quiet) |
| 09 | 16.5 to 17.0 | pencilTrace |
| 09 | 17.0 | rulerSnap |
| 09 | 17.5 | foundChime |
| 10 | 18.0 | pageTurn |
| 10 | 18.5 | a soft slide for the answer card, right to left |
| 10 | 19.0 | frameSnap |
| 11 | 20.25 to 21.75 | tickRun, one click per word |
| 11 | 22.0 | matchLock (signature) |
| 12 | 22.75 | selectSweep |
| 12 | 23.5, 23.5625, 23.625, 23.6875, 23.75 | five small pops (menu items) |
| 12 | 24.0 | tap + confirm |
| 12 | 24.5 to 25.25 | an untangling glissando, settling |
| 13 | 25.75, 26.25, 26.75, 27.25 | nodeBell, rising |
| 13 | 27.5 | a fifth nodeBell for the related-book node, with the resolving chord |
| 14 | 28.5 | tap |
| 14 | 29.0 | whoosh (card travel, right to left) |
| 14 | 30.0 | a soft magnetic attach (low thunk + tiny bell) |
| 15 | 31.0 | room tone and lampHum only (music thins) |
| 15 | 31.5 to 31.875 | keyTap on 32nds (the question) |
| 15 | 32.0 to 32.75 | pageRiffle, slowing, then stopping |
| 15 | 33.0 to 34.0 | silence (music and SFX off; only the room tone and the voice) |
| 16 | 34.0 | one warm note returns |
| 16 | 34.5, 35.25, 36.0 | three firm hits (bookThud body + bright bell) |
| 17 | 37.0 | lamp click |
| 18 | 37.5 | final chord |
| 18 | 38.0 | matchLock, soft |
| 18 | 39.0 to 40.0 | tail to silence, no click at the end |

---

## 12. Numbers and claims ledger

Every number and claim the film says or shows, with its source and its status. **Nothing goes on screen with status "confirm" until someone with the authority confirms it in writing,** recorded in `docs/decisions.md`. The product's own rule applies: a figure is published only when it is reproducible.

### 12.1 The ledger

| Claim in the film | Where | Source | Status |
|---|---|---|---|
| Books in Arabic and English | VO 16, shots 06, 16 | Product string: كتب كود البناء السعودي بنسختيها العربية والإنجليزية | **Confirm** for every book counted in `{N}`. Some Arabic passages carry the product's label ترجمة غير مُتحقَّق منها, so the film never says "verified translation" or "translated" |
| Search by clause number, words or meaning | VO 6, shot 07 | Product search placeholder and result tags (8.3) | Product claim, safe |
| Answers from the code's text only, with the clause | VO 8, shot 08 | Product string: يجيب من نص {code} فقط مع ذكر البند; the answer checker refuses an answer that cites no clause | Product claim, safe |
| Shows the original page, framed | VO 9, shot 10 | Product: الصفحة الأصلية من الكتاب, "the frame marks where the clause sits" | Product claim, safe |
| Every quote matches the book word for word | VO 10, shot 11 | Product hint: كل اقتباس يُطابَق مع الكتاب حرفيًا قبل عرضه (English: "word for word"); the check in `backend/modules/ai/src/emtithal_ai/ask.py` is a text match after normalising spaces and digits | Product claim, safe as "كلمة بكلمة". Never "حرف بحرف" |
| Explain simply; exceptions, tables, linked clauses | VO 11, 12; shots 12, 13 | Product selection menu and clause links (8.3) | Product claim, safe |
| Says "لا أعرف" when the book is silent | VO 15, shot 15 | Product string: لا أعرف: نص الكتاب لا يكفي للإجابة عن هذا السؤال. (and the back end's variant, 8.3) | Product claim, safe |
| SBC 2024 mandatory from 30 June 2025 | Hook C only | National Committee for the Saudi Building Code announcement (reported by Amlak, Al Eqtisadiah, Ajel) | Public fact |

### 12.2 Values that must come from the live product

The stair answer is a real example, so its specifics come from the real product, never from memory:

1. Open the knowledge base, ask **ما الحد الأدنى لعرض الدرج؟** in the book the product answers from.
2. Record `{code}` (the book), `{CLAUSE}` (the clause number), `{VALUE}` (the width with its unit), the quoted sentence used in shot 11, the page number for shot 10, and the clause's table and figure numbers `{n}` for shot 13.
3. A licensed engineer on the team confirms the clause and value against the 2024 edition and initials it in `docs/decisions.md`.
4. If any of the three cannot be confirmed before the render, draw the tag and the bracket with no value, and use a quote that has been confirmed.

---

## 13. Compliance, honesty and brand guardrails (non-negotiable)


1. **No verdicts.** The film shows reading, finding and explaining, never "compliant", "approved", "pass" or "fail". No green ticks, no red crosses (4.2).
2. **Emtithal never certifies.** No words or images that imply official approval, a stamp, or a ministry, Balady, Salamah or SBC Center endorsement. No government logos.
3. **Banned claims:** "100% دقة" or any accuracy percentage, "صفر أخطاء", "معتمد من الوزارة", "أول منصة مرخصة", "يغطي الكود بالكامل". The film says what the product does, not how perfect it is.
4. **The AI never decides.** The film never shows a robot, a brain, a face or a glowing "AI" orb deciding anything. Emtithal is shown as a reader and a guide: it searches, quotes, frames, explains and says when it does not know.
5. **Applying to a project is a reading, not a check result.** Shot 14 must show the note قراءة الوكيل من بيانات المشروع المسجّلة، وليست نتيجة فحص. legibly (at least 30 px) for at least 0.75 s, and never a result value.
6. **Real examples only.** Every clause number, value and quote on screen comes from the live product and is confirmed (12.2). No invented clause numbers.
7. **No real projects, people or places.** Generic Saudi villa plan; hands only.
8. **Disclaimer on the end card (Noto Kufi Arabic Regular, 26 px, ink at 80%, two lines, y 1290 to 1380, from T 38.5; the wording waits for the founder's sign-off, as all public wording does):**
   يساعدك امتثال على قراءة كود البناء السعودي وفهمه، ولا يغني عن المهندس المرخّص، ولا يمثّل اعتماداً رسمياً.
10. **Unconfirmed items never default onto the screen.** Where section 12 says confirm, the film uses the safe version until a written confirmation exists.
11. The final cut goes to AISC's founder for sign-off before publishing.

---

## 14. Technical architecture

### 14.1 Non-negotiable engine rules (both paths)

1. **`window.renderAt(t)`** draws the complete frame for global time `t` onto a 1080x1920 canvas and returns when drawn. It depends on `t` only.
2. **Determinism:** no `Math.random()`, no `Date`, no `performance.now()` inside drawing. Seeded RNG: `rng(hash(shotId, elementId, index))`. Rendering frame 600 before frame 12 must give identical pixels to rendering them in order.
3. **On twos:** anything drawn as a character or object computes its pose from `onTwos(t) = floor(t * 12) / 12`. Camera moves, zooms, overlay draw-on, ring expansion and **subtitle pops** run at a full 24 fps.
4. **Boil:** every ink and blueprint line wobbles by 0.6 to 1.2 px, re-seeded on a 12 fps clock. Paper grain re-seeds on the same clock. **The logo, the subtitles, the drawn product strings and the end-card text never boil** and never get grain: text must stay crisp to be read.
5. **Hatching:** light from upper left; shadow sides only; primary hatch at 45 degrees; cross-hatch at 105 degrees; spacing 12 / 8 / 5 px for light / mid / dark; every stroke jitters (angle ±3 degrees, spacing ±15%, ends ±6 px). Clipped parallel strokes, never gradients.
6. **Easing:** pops use outBack over 3 frames with 6 to 10% overshoot; draw-ons use outExpo over 6 frames; character motion never eases longer than one beat.
7. **Scenes clamp `t`** to their final pose if asked for a time past their end.
8. **Assets:** zero image and video files, and one audio file: `vo/vo-master.wav` (7.4). The only embedded data: the logo paths in `src/brand.js` and the fonts as base64 `@font-face`. Whitelist exactly these in the gate's media scan.
9. **Audio:** one function schedules the whole score and every sound effect into any `BaseAudioContext`, and mixes in the voice buffer with its ducking (11.2). The only freeze in the film (T 33.25 to 34.0, boil and grain held) is driven by `t`, so it stays deterministic. It takes a `mix` option (`{ music, sfx, amb, vo }` gains) so the same code renders each stem on its own.
10. **Subtitles are data, not hand-placed text:** `src/subtitles.js` is generated from the SRT (`tools/srt-to-cues.cjs`), and one `drawSubtitle(ctx, T)` draws whichever cue is active, so the burned-in text and the SRT can never disagree.
11. **Arabic shaping check:** render one test frame containing every subtitle and every product string at full size and look at it before any scene is written. Broken joins, reversed numbers or clipped diacritics are fixed here, not later.

### 14.2 Path B: single-file structure

```
emtithal-ask-the-code.html
  <style> @font-face (Noto Kufi Arabic 400/500/600/700, Inter 400/600, base64) </style>
  <canvas width=1080 height=1920>
  <script>
    const FPS = 24, BPM = 120, DURATION = 40;
    const PAL = { ...section 4.2... };
    const BRAND = { markPaths: [...], wordmarkPaths: [...] };
    const SUBS = [ { in: 0.25, out: 2.40, text: 'كود البناء…\nعشرات الكتب، وآلاف الصفحات.', lift: ['آلاف'] }, ... ];  // generated from the SRT and the 8.1 lift table
    // lib: hash, rng, onTwos, boil, inkPath, hatch, crossHatch, stipple, stripes,
    //      blueprint, glowDot, ticks, bracket, ring, camera, easing, drawArabic, drawSubtitle
    const SHOTS = [ { id, start, end, mode, draw(ctx, t, T) }, ... 18 shots ];
    window.renderAt = async (T) => { /* plate, scene, overlays, grain, subtitle, return */ };
    window.renderAudio = (ctx, startT, voBuffer) => { /* score, sfx, ducked voice */ };
    // player: space = play/pause, arrows = step frame, ?shot=<id> loops one shot, ?subs=0 hides subtitles
  </script>
```

### 14.3 Render

Use the skill's `tools/render.cjs` (Path A), or a Playwright script that seeks frame `i` as `t = i / 24`, captures the canvas, renders the score offline with the voice mixed in, and muxes with ffmpeg:

```bash
ffmpeg -y -framerate 24 -i frames/%04d.png -i mix.wav \
  -c:v libx264 -crf 16 -preset veryfast -pix_fmt yuv420p \
  -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 -shortest \
  exports/emtithal-ask-the-code.mp4
```

Render the subtitle-free version too (`?subs=0`), for platforms that will carry the SRT as captions.

---

## 15. Review gate (do this, do not skip it)

1. **Contact sheet of the whole film:** 24 frames on one sheet at quarter scale. A shot that does not read at that size is a P1 problem; fix composition, not detail.
2. **Per-shot sheets:** 6 frames per shot. Check palette keys only, hatch direction, overlay count, safe area and density (paper shots must feel as busy as the reference).
3. **Match cuts:** snap the last frame of the outgoing shot and the first of the incoming; the shared shape sits on the same pixels (section 9).
4. **Determinism:** render frames 0, 479 and 959 forwards and in reverse; hashes match.
5. **Sound-off test:** watch the phone cut muted. The story must read from the pictures and subtitles alone. The hook's label and number read from frame 0.
6. **Subtitle test:** every cue matches the final SRT exactly (text and time within one frame); no line over 30 characters and no cue over 17 characters per second; nothing important under a subtitle; correct Arabic shaping and digits on every cue; the lift on whole words only.
7. **Voice sync:** each VO line starts within 0.1 s of its time in the final re-timed SRT; the music ducks under every line; no SFX masks a consonant.
8. **Audio:** onsets within 10 ms of each SFX cue; no clipping in the WAV or in a 128k AAC encode; about -14 LUFS.
9. **Trust beat:** from T 33.0 to 34.0 music and effects are silent, and from T 33.25 to 34.0 the frame is still.
10. **Brand:** logo untouched (4.4); tokens match section 4; no red, no green.
11. **Ledger:** walk section 12 line by line; every "confirm" item is confirmed in `docs/decisions.md` or replaced by its safe version. The website blocker in 12.1 is resolved.
12. **Guardrails:** walk section 13 line by line on the final render.

Expect to send most shots back once. First passes are reliably too sparse and too small. Corrections are specific ("tower to 88% of frame height, number at 260 px, move the bracket inside x 940").

---

## 16. Deliverables

1. `emtithal-ask-the-code.html`: the self-contained player.
2. `exports/emtithal-ask-the-code.mp4`: 1080x1920, 24 fps, crf 16 master, burned-in subtitles.
3. `exports/emtithal-ask-the-code-clean.mp4`: the same without burned-in subtitles, for caption-track uploads.
4. `exports/emtithal-ask-the-code-phone.mp4`: 720x1280, crf 23, AAC 128k, -14 LUFS.
5. `exports/emtithal-ask-the-code-15s-A.mp4`, `-15s-B.mp4`, `-15s-C.mp4`: hook cuts built to the 15 s timing sheet in 6.3, each with its own SRT.
6. `exports/emtithal-ask-the-code-subtitles-ar.srt` (final, re-timed to the recorded voice) and `-cover.png` (frame T 2.0).
7. Audio stems in `exports/audio/`: `mix.wav`, `vo.wav`, `music.wav`, `sfx.wav`.
8. `exports/emtithal-ask-the-code-shots.md`: one line per shot, for captions and review.
9. `docs/decisions.md`: every decision made where this brief was silent, and every ledger confirmation.

---

## 17. Ask me before you build (one round only)

1. Which hook is the master: A (the book count, default), B (no number), or C (30 June 2025)? And what is `{N}`, the number of books the live knowledge base shows?
2. The voice: male or female, and is a recorded Saudi voice booked, or should the scratch text-to-speech carry the first cut?
3. The confirmed stair example from the live product: `{code}`, `{CLAUSE}`, `{VALUE}`, the quote and the page (12.2). If not ready, the film draws the bracket with no value.
4. Is "اسأل الكتاب" on the free plan? This decides the CTA (12.1).

If I do not answer, build with the defaults (hook A with `{N}` left as a clearly marked placeholder that blocks the final render, scratch voice, no value on the bracket, CTA "ابدأ الآن") and continue.

---

## Appendix: timeline skeleton

```js
FILM.TIMELINE = {
  title: 'اسأل الكود',
  bpm: 120, duration: 40, fps: 24, width: 1080, height: 1920,
  vo: 'vo/vo-master.wav',
  subtitles: 'emtithal-ask-the-code-subtitles-ar.srt',
  shots: [
    { id: 'the-tower',       start: 0.0,  end: 2.5,  mode: 'illustrated' },
    { id: 'page-storm',      start: 2.5,  end: 4.0,  mode: 'schematic'   },
    { id: 'one-question',    start: 4.0,  end: 5.0,  mode: 'illustrated' },
    { id: 'the-flip',        start: 5.0,  end: 6.5,  mode: 'illustrated' },
    { id: 'reference-maze',  start: 6.5,  end: 8.0,  mode: 'schematic'   },
    { id: 'the-reveal',      start: 8.0,  end: 10.5, mode: 'illustrated' },
    { id: 'search',          start: 10.5, end: 13.5, mode: 'schematic'   },
    { id: 'ask',             start: 13.5, end: 16.5, mode: 'illustrated' },
    { id: 'stair-section',   start: 16.5, end: 18.0, mode: 'schematic'   },
    { id: 'original-page',   start: 18.0, end: 20.0, mode: 'illustrated' },
    { id: 'verbatim-match',  start: 20.0, end: 22.5, mode: 'schematic'   },
    { id: 'explain-simply',  start: 22.5, end: 25.5, mode: 'illustrated' },
    { id: 'links-web',       start: 25.5, end: 28.0, mode: 'schematic'   },
    { id: 'my-project',      start: 28.0, end: 31.0, mode: 'illustrated' },
    { id: 'dont-know',       start: 31.0, end: 34.0, mode: 'illustrated' },
    { id: 'proof',           start: 34.0, end: 36.5, mode: 'schematic'   },
    { id: 'the-desk',        start: 36.5, end: 37.5, mode: 'illustrated' },
    { id: 'end-card',        start: 37.5, end: 40.0, mode: 'brand'       },
  ],
  // cues: every SFX row of 11.4 (kind: 'sfx' | 'amb'), every VO line of 7.1 (kind: 'vo'),
  //       generated subtitle cues from the SRT (kind: 'sub')
};
```
