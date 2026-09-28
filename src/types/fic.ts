export type Segment = { t: string; em?: boolean };

export type Paragraph = {
  segments: Segment[];
  kind?: 'break';
};

export type Chapter = {
  title: string;
  paragraphs: Paragraph[];
};

export type Fic = {
  id: string;
  title: string;
  author: string;
  chapters: Chapter[];
};

export const paragraphText = (p: Paragraph) => p.segments.map((s) => s.t).join('');

export const countWords = (paras: Paragraph[]) =>
  paras.reduce((n, p) => n + paragraphText(p).trim().split(/\s+/).filter(Boolean).length, 0);
