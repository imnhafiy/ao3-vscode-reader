import type { CSSProperties, RefObject } from 'react';
import type { Line } from '../services/syntaxHighlighter';
import LineNumbers from './LineNumbers';

type Props = {
  lines: Line[];
  showNumbers: boolean;
  fontSize: number;
  activeLine: number;
  onActive: (n: number) => void;
  onProgress: (pct: number) => void;
  scrollRef: RefObject<HTMLDivElement>;
};

export default function Reader({ lines, showNumbers, fontSize, activeLine, onActive, onProgress, scrollRef }: Props) {
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? el.scrollTop / max : 1;
    onProgress(pct);
    onActive(Math.min(lines.length, Math.max(1, Math.round(pct * (lines.length - 1)) + 1)));
  };

  // --lh is the height of one row; the line numbers and the text both use it so they stay aligned.
  const style = { fontSize, '--lh': `${(fontSize * 1.5).toFixed(1)}px` } as CSSProperties;

  return (
    <div className="reader" ref={scrollRef} onScroll={onScroll} style={style}>
      <div className="lines">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`row row-${line.kind} ${i + 1 === activeLine ? 'active' : ''}`}
            onClick={() => onActive(i + 1)}
          >
            {showNumbers && <LineNumbers n={i + 1} active={i + 1 === activeLine} />}
            <div className="text">
              {line.prefix && <span className="c-muted">{line.prefix}</span>}
              {line.tokens.map((t, j) => (
                <span key={j} style={{ color: `var(--${t.color})`, fontStyle: t.italic ? 'italic' : undefined }}>
                  {t.text}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="row eof">{showNumbers && <LineNumbers n={lines.length + 1} active={false} />}</div>
      </div>
    </div>
  );
}