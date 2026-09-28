# AO3 VS Code Reader

Paste an AO3 link, read the fic in a fake Dracula VS Code editor.

```bash
npm install
npm run dev
```

Open the printed localhost URL. Use **open demo fic** to try it without AO3.

- **AO3 importing** goes through a Vite dev-server proxy (`/ao3` -> archiveofourown.org) because AO3 sends no CORS headers. It works under `npm run dev` / `npm run preview`, not on a static host.
- **Highlighting** is local and rule-based (`src/services/syntaxHighlighter.ts`). Colors are seeded once per opened fic, so they don't change on re-render.
- **Shortcuts:** `Alt+Left/Right` switch chapters, `Alt+L` toggles line numbers.
- Locked/restricted works and AO3 rate limits (HTTP 429) show the error panel.
