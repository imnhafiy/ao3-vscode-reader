# AO3 VS Code Reader

Paste an AO3 link, read the fic in a fake Dracula VS Code editor.

```bash
npm install
npm run dev
```

Open the printed localhost URL.

## Opening a fic

- Paste a work URL, e.g. `https://archiveofourown.org/works/12345678`, and click **OPEN**.
- A link to one specific chapter, e.g. `https://archiveofourown.org/works/12345678/chapters/98765432`, opens the editor directly on that chapter instead of chapter 1.
- **open demo fic** loads a short built-in sample so you can try the interface without needing a real AO3 link.
- If the link can't be loaded, an `> ERROR` panel explains why (bad URL, work not found, AO3 rate-limiting, or a locked/restricted work).

AO3 doesn't send the headers browsers need to fetch it directly, so requests are routed through a small proxy defined in `vite.config.ts`. This only works while the dev server is running (`npm run dev` / `npm run preview`), not on a static host.

## The editor

Once a fic is open, it looks and behaves like a code editor:

- **Title bar** — top of the window. Shows the generated filename (from the fic's title) and holds the controls described below.
- **Activity bar** — the thin strip of icons on the far left. Only the top (Explorer) icon does anything; it shows or hides the sidebar. The rest are decoration.
- **Explorer sidebar** — a fake file tree. The `src/chapters/` folder holds one real file per chapter — click one to jump to that chapter. Every other folder and file (`node_modules`, `.git`, `components/`, etc.) is just for looks.
- **Chapter tabs** — under the title bar, one tab per chapter. Click a tab, or a file in the sidebar, to switch chapters.
- **Reader pane** — the story itself, laid out with line numbers on the left, styled like source code but comfortable to actually read.
- **Status bar** — bottom of the window. Shows current line, chapter number, total word count, and reading progress.

### Highlight modes

The **highlight** dropdown in the title bar controls how much the prose's colors vary, from calmest to wildest:

| Mode | What it looks like |
|---|---|
| `subtle` | Mostly plain text, with only occasional color |
| `dracula` | Traditional-feeling syntax highlighting |
| `randomized` | Noticeably more color variation (the default) |
| `chaotic` | Maximum color variation, down to individual phrases |

All colors always come from the Dracula palette. Colors are generated once per opened fic and stay stable — switching modes back and forth, or re-rendering, won't reshuffle them.

### Font size

The **A−** and **A+** buttons in the title bar shrink or grow the reading text. Font size is shared across all chapters and also affects how many characters fit per line, so the text stays comfortably wrapped at any size.

### Line numbers

The **#** button in the title bar toggles line numbers on and off. Keyboard shortcut: `Alt+L`.

### Close

The **close** button in the title bar leaves the editor and returns to the landing screen, so you can open a different fic (or the demo). It doesn't save or remember anything — closing and reopening a URL will re-fetch the fic and pick new highlight colors.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt` + `←` / `→` | Previous / next chapter |
| `Alt` + `L` | Toggle line numbers |
| `Alt` + `B` | Toggle the explorer sidebar |

## Notes

- Highlighting is entirely local and rule-based (`src/services/syntaxHighlighter.ts`) — no AI or external API is used.
- The AO3 parser (`src/services/ao3Parser.ts`) reads the title, author, and per-chapter text from the full work page, and ignores comments, kudos, and other site UI.
- Locked/restricted works and AO3 rate limits (HTTP 429) surface as a specific error message rather than a generic failure.

⚠️ Temporary 525 Error

Sometimes AO3 may return an **HTTP 525** (SSL Handshake Failed) error. This is generally a temporary connection issue involving Cloudflare and AO3's server, rather than an indication that the fanfic itself is unavailable.

If you encounter a 525 error, simply press *OPEN* again repeatedly. The request may succeed on a subsequent attempt and the fanfic will load normally.

TL;DR: If you see 525, just spam *OPEN* again. Cloudflare is probably having a moment.