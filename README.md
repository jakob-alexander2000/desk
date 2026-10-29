# Desk

**Ask questions about a folder of notes on your own computer.** Desk finds the passages that match, asks Gemini to answer only from them, and lists each source by file and line. It can also write the answer to a report in the same folder.

```
folder of notes  →  retrieve passages  →  Gemini  →  cited answer
                                         ↘ optional REPORT.md
```

## 60-second run

```bash
git clone https://github.com/jakob-alexander2000/desk.git
cd desk
npm install
export GEMINI_API_KEY=your_key_here
npm run desk -- ask ./sample-notes "What are core hours?"
```

`ask` calls Gemini when passages match. The wording of the answer varies by model. This block is an example of that shape, not a recorded answer:

```
Core hours are 10:00–16:00 local time, Monday through Thursday.
Sources:
  [1] core-hours.md:1-7
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

## Retrieval

This transcript is a search over `./sample-notes`. It does not call a model, and `GEMINI_API_KEY` was unset.

```
$ npm run desk -- search ./sample-notes "What are core hours?"

> desk@0.1.0 desk
> tsx src/cli.ts search ./sample-notes What are core hours?

Sources:
  [1] core-hours.md:1-7
  [2] meeting-2026-10-20.md:1-11
  [3] offsite.md:1-10
  [4] expense-policy.md:1-7
  [5] pto.md:1-7
```

## Why this exists

Desk applies CiteBot's idea to files on your own computer: find the passages first, then ask the model to answer only from them, with sources. [CiteBot](https://citebot-chi.vercel.app) also checks each claim against its sources; Desk doesn't yet. [citebot-evals](https://github.com/jakob-alexander2000/citebot-evals) is CiteBot's fixed question set.

## Commands

| Command | What it does |
|---------|----------------|
| `desk search <folder> "<q>"` | Rank matching passages. No model call. |
| `desk ask <folder> "<q>"` | An answer drawn only from the matching passages, plus a source list |
| `desk ask … --write-report <path>` | Same, plus write a markdown report |
| `desk report <folder> -q "…" -o out.md` | Write an answer to a file |
| `desk ui <folder> [--port 3847]` | Localhost UI bound to `127.0.0.1` |

## Verify

```bash
npm install
npm run typecheck
npm run desk -- search ./sample-notes "What are core hours?"
```

## Feature map

See [FEATURE_MAP.md](./FEATURE_MAP.md).

## Stack

- TypeScript / Node 20
- `@google/generative-ai`
- Keyword retrieve over local chunks (no vector DB in v0.1)
- Tiny built-in HTTP UI (no Electron/Tauri packaging)

## What is in this repository

| In the code | Not in this version |
|-------------|---------------------|
| Typecheck | Electron / Tauri installers |
| Localhost UI on `127.0.0.1` | macOS `.dmg` / Windows installer |
| Retrieval over `./sample-notes` with no model call | A recorded model answer |
| | Ollama offline path |
| | App Store / code signing |

## Privacy note

File bytes stay on disk for scan and retrieve. When you ask, Gemini receives the question plus each matching excerpt. A passage of 280 characters or fewer is sent whole. A longer passage is cut after 277 characters, trimmed, and an ellipsis character is added. The UI listens on localhost only.

## License

MIT © Jakob Alex
