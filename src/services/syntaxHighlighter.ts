import type { Chapter, Paragraph, Segment } from '../types/fic';
import { paragraphText } from '../types/fic';

export type Mode = 'subtle' | 'dracula' | 'randomized' | 'chaotic';
export const MODES: Mode[] = ['subtle', 'dracula', 'randomized', 'chaotic'];

export type ColorName =
  | 'fg' | 'muted' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'yellow';

export type Token = { text: string; color: ColorName; italic?: boolean };
export type LineKind = 'heading' | 'dialogue' | 'narration' | 'comment' | 'blank';
export type Line = { kind: LineKind; prefix?: string; tokens: Token[] };

type Pools = { dialogue: ColorName[]; narration: ColorName[]; emphasis: ColorName[]; heading: ColorName[] };

// Only Dracula palette colors, ever. Repeating a color weights it.
const POOLS: Record<Mode, Pools> = {
  subtle: {
    dialogue: ['fg', 'fg', 'pink'],
    narration: ['fg', 'fg', 'fg', 'fg', 'cyan'],
    emphasis: ['yellow'],
    heading: ['purple'],
  },
  dracula: {
    dialogue: ['pink', 'pink', 'orange'],
    narration: ['fg', 'fg', 'cyan'],
    emphasis: ['orange', 'yellow'],
    heading: ['purple'],
  },
  randomized: {
    dialogue: ['pink', 'orange', 'purple', 'cyan'],
    narration: ['fg', 'cyan', 'purple', 'yellow'],
    emphasis: ['orange', 'yellow', 'pink'],
    heading: ['purple', 'pink'],
  },
  chaotic: {
    dialogue: ['pink', 'orange', 'purple', 'cyan', 'green', 'yellow', 'red'],
    narration: ['fg', 'cyan', 'purple', 'yellow', 'green', 'orange', 'pink'],
    emphasis: ['orange', 'yellow', 'pink', 'green', 'cyan', 'red'],
    heading: ['purple', 'pink', 'green', 'cyan', 'orange'],
  },
};

// Seeded PRNG: colors are random per session but stable across re-renders.
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(...n: number[]) {
  let h = 2166136261;
  for (const x of n) { h ^= x; h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

// How much a single sentence can mix colors, per mode.
// chance   = odds that a chunk breaks away from the paragraph's base color
// maxWords = longest chunk in words (99 = split at punctuation only)
const MIX: Record<Mode, { chance: number; maxWords: number }> = {
  subtle: { chance: 0, maxWords: 99 },
  dracula: { chance: 0.12, maxWords: 99 },
  randomized: { chance: 0.35, maxWords: 99 },
  chaotic: { chance: 0.85, maxWords: 3 },
};

// Split narration into phrases at , ; : and dashes. If maxWords is small,
// break phrases further into runs of 1..maxWords words. Whitespace stays attached.
function chunk(text: string, maxWords: number, rng: () => number): string[] {
  const phrases = text.match(/[^,;:\u2014\u2013]+[,;:\u2014\u2013]*\s*/g) || [text];
  if (maxWords >= 99) return phrases;
  const out: string[] = [];
  for (const ph of phrases) {
    const words = ph.match(/\S+\s*/g) || [ph];
    for (let i = 0; i < words.length; ) {
      const n = 1 + Math.floor(rng() * maxWords);
      out.push(words.slice(i, i + n).join(''));
      i += n;
    }
  }
  return out;
}

// ---- quote detection ----
type Run = { text: string; quote: boolean; em: boolean };

function scanRuns(segs: Segment[], enableQuotes: boolean, straightOk: boolean): { runs: Run[]; open: boolean } {
  const runs: Run[] = [];
  let inQ = false;
  for (const s of segs) {
    for (const ch of s.t) {
      let q = inQ;
      if (enableQuotes) {
        if (ch === '\u201C') { inQ = true; q = true; }
        else if (ch === '\u201D') { inQ = false; q = true; }
        else if (ch === '"' && straightOk) { q = true; inQ = !inQ; }
      }
      const last = runs[runs.length - 1];
      if (last && last.quote === q && last.em === !!s.em) last.text += ch;
      else runs.push({ text: ch, quote: q, em: !!s.em });
    }
  }
  return { runs, open: inQ };
}

function toRuns(segs: Segment[]): Run[] {
  const flat = segs.map((s) => s.t).join('');
  const straightOk = (flat.match(/"/g) || []).length % 2 === 0;
  const first = scanRuns(segs, true, straightOk);
  // An unclosed quote is ambiguous (e.g. multi-paragraph dialogue): leave it as plain prose.
  return first.open ? scanRuns(segs, false, false).runs : first.runs;
}

// Lines made only of separator characters ("-", "***", "~~~", ...) are scene breaks.
const SCENE_BREAK = /^[*\-_~=\u2022\u00B7#]+$/;

export function highlightChapter(chapter: Chapter, mode: Mode, seed: number, chapterIndex: number): Line[] {
  const pools = POOLS[mode];
  const lines: Line[] = [];

  const hr = mulberry32(hash(seed, chapterIndex, 0));
  lines.push({ kind: 'heading', tokens: [{ text: chapter.title, color: pick(hr, pools.heading) }] });

  chapter.paragraphs.forEach((p: Paragraph, i) => {
    const rng = mulberry32(hash(seed, chapterIndex, i + 1));
    const text = paragraphText(p).trim();

    if (p.kind === 'break' || (text && SCENE_BREAK.test(text.replace(/\s+/g, '')))) {
      lines.push({ kind: 'comment', prefix: '// ', tokens: [{ text: '* * *', color: 'muted' }] });
      return;
    }

    const runs = toRuns(p.segments);
    const allEm = runs.length > 0 && runs.every((r) => r.em);
    const hasQuote = runs.some((r) => r.quote);

    // Fully italic paragraph with no quotes (thoughts, texts, letters) -> "// comment".
    // Italic dialogue stays dialogue.
    if (allEm && !hasQuote) {
      lines.push({ kind: 'comment', prefix: '// ', tokens: [{ text, color: 'muted', italic: true }] });
      return;
    }

    const mix = MIX[mode];
    const perToken = mode === 'chaotic'; // dialogue: a fresh color per quote, only in chaotic
    const dialogueColor = pick(rng, pools.dialogue);
    const narrationColor = pick(rng, pools.narration); // this paragraph's base color
    const tokens: Token[] = [];

    for (const r of runs) {
      if (r.em) {
        tokens.push({ text: r.text, color: pick(rng, pools.emphasis), italic: true });
      } else if (r.quote) {
        tokens.push({ text: r.text, color: perToken ? pick(rng, pools.dialogue) : dialogueColor });
      } else {
        // narration: mostly the paragraph's base color, with phrases that break away
        for (const c of chunk(r.text, mix.maxWords, rng)) {
          tokens.push({ text: c, color: rng() < mix.chance ? pick(rng, pools.narration) : narrationColor });
        }
      }
    }
    lines.push({ kind: hasQuote ? 'dialogue' : 'narration', tokens });
  });

  return lines;
}

// ---- hard-wrapping: one editor row per visual line ----

// Split tokens into words. A word keeps its trailing spaces and may span several
// tokens, so a color change in the middle of a word never causes a break.
function toWords(tokens: Token[]): Token[][] {
  const words: Token[][] = [];
  let cur: Token[] = [];
  let inSpace = false;
  for (const t of tokens) {
    for (const part of t.text.match(/\s+|\S+/g) || []) {
      const isSpace = /^\s/.test(part);
      if (!isSpace && inSpace) { words.push(cur); cur = []; inSpace = false; }
      cur.push({ ...t, text: part });
      if (isSpace) inSpace = true;
    }
  }
  if (cur.length) words.push(cur);
  return words;
}

const wordLen = (w: Token[]) => w.reduce((n, t) => n + t.text.length, 0);
const visibleLen = (w: Token[]) => wordLen(w) - (w[w.length - 1].text.match(/\s+$/)?.[0].length ?? 0);

function trimEnd(tokens: Token[]): Token[] {
  const out = tokens.map((t) => ({ ...t }));
  while (out.length) {
    const last = out[out.length - 1];
    last.text = last.text.replace(/\s+$/, '');
    if (last.text) break;
    out.pop();
  }
  return out;
}

/** Wrap every line at `cols` characters (each row gets its own number) and add a blank row after each paragraph. */
export function wrapLines(lines: Line[], cols: number): Line[] {
  const out: Line[] = [];
  for (const line of lines) {
    const width = Math.max(16, cols - (line.prefix?.length ?? 0));
    let row: Token[] = [];
    let rowLen = 0;
    const flush = () => {
      if (row.length) out.push({ kind: line.kind, prefix: line.prefix, tokens: trimEnd(row) });
      row = []; rowLen = 0;
    };
    for (const w of toWords(line.tokens)) {
      if (rowLen > 0 && rowLen + visibleLen(w) > width) flush();
      row.push(...w);
      rowLen += wordLen(w);
    }
    flush();
    out.push({ kind: 'blank', tokens: [] });
  }
  out.pop(); // no blank row after the last paragraph
  return out;
}