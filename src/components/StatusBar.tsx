type Props = {
  line: number;
  total: number;
  chapter: number;
  chapters: number;
  words: number;
  progress: number;
};

export default function StatusBar({ line, total, chapter, chapters, words, progress }: Props) {
  const col = 1 + ((line * 13) % 42); // cosmetic
  return (
    <div className="statusbar">
      <div className="sb-left">
        <span className="sb-branch">⎇ main</span>
        <span>⊗ 0 ⚠ 0</span>
      </div>
      <div className="sb-right">
        <span>Ln {line}, Col {col}</span>
        <span className="sb-hide">of {total} lines</span>
        <span className="sb-hide">UTF-8</span>
        <span className="sb-hide">LF</span>
        <span>TypeScript</span>
        <span>Chapter {chapter}/{chapters}</span>
        <span className="sb-hide">{words.toLocaleString()} words</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    </div>
  );
}
