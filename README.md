# Desk

**Ask questions about a folder of notes on your own computer.** Desk finds the passages that match, asks Gemini to answer only from them, and lists each source by file and line. It can also write the answer to a report in the same folder.

![Desk demo — localhost question, then the missing-key error](./docs/demo.gif)

```
folder of notes  →  retrieve passages  →  Gemini  →  cited answer
                                         ↘ optional REPORT.md
```

## 60-second run

```bash
git clone https://github.com/jakob-alexander2000/desk.git
cd desk
npm install
export GEMINI_API_KEY=your_key_here   # free Gemini key is enough
npm run desk -- ask ./sample-notes "What are core hours?"
```

Expected shape (wording varies by model):

```
Core hours are **10:00–16:00** local time …
Sources:
  [1] core-hours.md:…
```

Local UI (this machine only):

```bash
npm run desk -- ui ./sample-notes
# → http://127.0.0.1:3847
```

Write a report back into the folder:

```bash
npm run desk -- report ./sample-notes \
  -q "Summarize paid time off, the team offsite, and the expense policy" \
  -o ./sample-notes/REPORT.md
```

## Why this exists

Desk applies CiteBot's idea to files on your own computer: find the passages first, then ask the model to answer only from them, with sources. [CiteBot](https://citebot-chi.vercel.app) also checks each claim against its sources; Desk doesn't yet. [citebot-evals](https://github.com/jakob-alexander2000/citebot-evals) is CiteBot's fixed question set.

## Commands

| Command | What it does |
|---------|----------------|
| `desk ask <folder> "<q>"` | Grounded answer + source list |
| `desk ask … --write-report <path>` | Same, plus write markdown report |
| `desk report <folder> -q "…" -o out.md` | Summarize / answer → file |
| `desk ui <folder> [--port 3847]` | Localhost UI bound to `127.0.0.1` |

## Demo GIF note

`docs/demo.gif` shows the localhost UI on `127.0.0.1:3847`: empty question field, `What are core hours?` typed, the button while the request is in flight, then the error Desk returns when `GEMINI_API_KEY` is unset. There is no model answer in the recording. `docs/demo-still.png` is that error frame.

## Verify

```bash
npm install
npm run typecheck
# live smoke (needs GEMINI_API_KEY; may 429 on free tier):
npm run desk -- ask ./sample-notes "What are core hours?" --write-report ./sample-notes/REPORT.md
test -f ./sample-notes/REPORT.md && echo "report ok"
```

## Feature map

See [FEATURE_MAP.md](./FEATURE_MAP.md).

## Stack

- TypeScript / Node 20
- `@google/generative-ai`
- Keyword retrieve over local chunks (no vector DB in v0.1)
- Tiny built-in HTTP UI (no Electron/Tauri packaging)

## What’s proven vs not

| Proven (Linux) | Not proven / killed for v0.1 |
|----------------|------------------------------|
| CLI ask + report writeback | Electron / Tauri installers |
| Localhost UI on `127.0.0.1` | macOS `.dmg` / Windows installer |
| Grounding on `./sample-notes` | Ollama offline path |
| Typecheck + live Gemini smoke | App Store / code signing |

## Privacy note

File bytes stay on disk for scan/retrieve. **Retrieved chunks + your question** are sent to Gemini when you ask. The UI listens on localhost only.

## License

MIT © Jakob Alex
