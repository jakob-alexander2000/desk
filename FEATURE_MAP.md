# Feature Map — Desk

| Area | Status | Notes |
|------|--------|-------|
| Scan local folder (md/txt/code/json/yaml) | ✅ | Skips `node_modules`, `.git`, binaries; caps size/count |
| Chunk + keyword retrieve | ✅ | Fast local ranking; no vector DB |
| Grounded ask via Gemini | ✅ | `GEMINI_API_KEY`; cites `[n]` against retrieved passages |
| Write report markdown back to disk | ✅ | `desk report` / `--write-report` |
| Localhost UI | ✅ | `desk ui` → `127.0.0.1:3847` |
| Sample notes for stranger demo | ✅ | `./sample-notes` |
| Electron / Tauri packaged app | ❌ killed | Linux CLI+UI ships; packaging theater deferred |
| Ollama / fully offline LLM | ❌ later | Documented as optional future |
| macOS .dmg / Windows installer | ❌ unproven | Only Node CLI + localhost UI verified on Linux |
| Embeddings / hybrid retrieve | ❌ later | Keyword retrieve is enough for v0.1 folders |
| Cloud sync / accounts | ❌ kill | Local-first by design |
