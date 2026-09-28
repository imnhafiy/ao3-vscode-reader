import type { Chapter, Fic, Paragraph, Segment } from '../types/fic';
import { paragraphText } from '../types/fic';

// ---------- URL + fetching ----------

export function extractWorkId(url: string): string | null {
  const m = url.trim().match(/(?:archiveofourown\.[a-z]+|ao3\.org)\/(?:collections\/[^/]+\/)?works\/(\d+)/i);
  return m ? m[1] : null;
}

export async function fetchFic(url: string): Promise<Fic> {
  const id = extractWorkId(url);
  if (!id) throw new Error('That does not look like an AO3 work URL (expected .../works/123456).');

  let res: Response;
  try {
    // Goes through the Vite dev proxy (see vite.config.ts) to avoid CORS.
    res = await fetch(`/ao3/works/${id}?view_full_work=true&view_adult=true`);
  } catch {
    throw new Error('Network request failed.');
  }
  if (res.status === 429) throw new Error('AO3 is rate-limiting requests. Wait a minute and retry.');
  if (res.status === 404) throw new Error('Work not found (404).');
  if (!res.ok) throw new Error(`AO3 responded with HTTP ${res.status}.`);

  return parseFicHtml(await res.text(), id);
}

// ---------- HTML -> Fic ----------

const BLOCK = new Set(['p', 'div', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'center', 'hr']);
const EMPHASIS = new Set(['em', 'i', 'b', 'strong']);

type Acc = { lines: Segment[][] };

function inline(node: Node, em: boolean, acc: Acc) {
  if (node.nodeType === 3) {
    const t = (node.textContent || '').replace(/\s+/g, ' ');
    if (t) acc.lines[acc.lines.length - 1].push({ t, em });
    return;
  }
  if (node.nodeType !== 1) return;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') { acc.lines.push([]); return; }
  if (tag === 'script' || tag === 'style') return;
  const e = em || EMPHASIS.has(tag);
  el.childNodes.forEach((c) => inline(c, e, acc));
}

function finishLine(segs: Segment[]): Paragraph | null {
  const merged: Segment[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && !!last.em === !!s.em) last.t += s.t;
    else merged.push({ ...s });
  }
  if (merged.length) merged[0].t = merged[0].t.replace(/^\s+/, '');
  if (merged.length) merged[merged.length - 1].t = merged[merged.length - 1].t.replace(/\s+$/, '');
  const clean = merged.filter((s) => s.t.length > 0);
  return clean.length ? { segments: clean } : null;
}

function walk(node: Node, out: Paragraph[]) {
  if (node.nodeType === 1) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (el.classList.contains('landmark') || tag === 'script' || tag === 'style') return;
    if (tag === 'hr') { out.push({ kind: 'break', segments: [{ t: '* * *' }] }); return; }
    const hasBlock = Array.from(el.children).some((c) => BLOCK.has(c.tagName.toLowerCase()));
    if (hasBlock) { el.childNodes.forEach((c) => walk(c, out)); return; }
  }
  const acc: Acc = { lines: [[]] };
  inline(node, false, acc);
  acc.lines.forEach((l) => { const p = finishLine(l); if (p) out.push(p); });
}

function bodyToParagraphs(body: Element): Paragraph[] {
  const out: Paragraph[] = [];
  body.childNodes.forEach((c) => walk(c, out));
  return out;
}

// ---------- chapter heading fallback ----------
// Used only when AO3's own chapter markup isn't present. Never drops content:
// anything before the first heading goes into a "Chapter 1" bucket.

const NUM = '(?:\\d+|[ivxlc]+|[a-z]+(?:[- ][a-z]+)?)';
const HEADING = new RegExp(`^chapter\\s+${NUM}\\b\\s*[:.\\-\u2013\u2014]?\\s*.*$`, 'i');

function splitByHeadings(paras: Paragraph[]): Chapter[] {
  const chapters: Chapter[] = [];
  let cur: Chapter | null = null;
  for (const p of paras) {
    const text = paragraphText(p).trim();
    if (text.length < 80 && HEADING.test(text)) {
      cur = { title: text, paragraphs: [] };
      chapters.push(cur);
    } else {
      if (!cur) { cur = { title: 'Chapter 1', paragraphs: [] }; chapters.push(cur); }
      cur.paragraphs.push(p);
    }
  }
  return chapters;
}

const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

export function parseFicHtml(html: string, id: string): Fic {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const title = clean(doc.querySelector('h2.title.heading')?.textContent) || 'untitled';
  const authors = Array.from(doc.querySelectorAll('h3.byline.heading a[rel="author"]')).map((a) => clean(a.textContent));
  const author = authors.join(', ') || clean(doc.querySelector('h3.byline.heading')?.textContent) || 'Anonymous';

  // Multi-chapter works (full view): #chapters > .chapter, each containing a div.userstuff.
  // Chapter *notes* are blockquote.userstuff, so we target div.userstuff on purpose.
  let chapters: Chapter[] = [];
  doc.querySelectorAll('#chapters > .chapter').forEach((el, i) => {
    const body = el.querySelector('div.userstuff');
    if (!body) return;
    const paragraphs = bodyToParagraphs(body);
    if (!paragraphs.length) return;
    const heading = clean(el.querySelector('.chapter.preface .title, h3.title')?.textContent);
    chapters.push({ title: heading || `Chapter ${i + 1}`, paragraphs });
  });

  // Single-chapter works, or unfamiliar markup.
  if (!chapters.length) {
    const body = doc.querySelector('#chapters div.userstuff') || doc.querySelector('div.userstuff');
    if (!body) {
      throw new Error('Could not find story content. The work may be locked, restricted, or AO3 blocked the request.');
    }
    const paragraphs = bodyToParagraphs(body);
    chapters = splitByHeadings(paragraphs);
    if (!chapters.length) chapters = [{ title: 'Chapter 1', paragraphs }];
  }

  return { id, title, author, chapters };
}
