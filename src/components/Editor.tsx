import { useEffect, useMemo, useRef, useState } from 'react';
import type { Fic } from '../types/fic';
import { countWords } from '../types/fic';
import { highlightChapter, wrapLines, MODES, type Mode } from '../services/syntaxHighlighter';
import ActivityBar from './ActivityBar';
import EditorHeader from './EditorHeader';
import EditorTabs from './EditorTabs';
import Reader from './Reader';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { FONTS, type FontId } from '../services/fonts';

const MAX_COLS = 90; // widest a row gets, in characters. Lower = narrower column.

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'fic';

export default function Editor({ fic, onClose }: { fic: Fic; onClose: () => void }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('randomized');
  const [showNumbers, setShowNumbers] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [fontSize, setFontSize] = useState(17);
  const [fontId, setFontId] = useState<FontId>('inter');
  const fontStack = FONTS.find((f) => f.id === fontId)!.stack;  
  const [activeLine, setActiveLine] = useState(1);
  const [progress, setProgress] = useState(0);

  // Generated once per opened fic -> colors stay put across re-renders.
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32));

  const chapter = fic.chapters[chapterIdx];
  const lines = useMemo(() => highlightChapter(chapter, mode, seed, chapterIdx), [chapter, mode, seed, chapterIdx]);
  const [cols, setCols] = useState(MAX_COLS);
  const rows = useMemo(() => wrapLines(lines, cols), [lines, cols]);
  const totalWords = useMemo(() => fic.chapters.reduce((n, c) => n + countWords(c.paragraphs), 0), [fic]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Work out how many characters fit per row from the reader's width and font size.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const calc = () => {
      const avail = Math.min(el.clientWidth, 940) - (showNumbers ? 56 : 0) - 36;
      setCols(Math.max(24, Math.min(MAX_COLS, Math.floor(avail / (fontSize * 0.52)))));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fontSize, showNumbers]);

  const goto = (i: number) => {
    if (i < 0 || i >= fic.chapters.length) return;
    setChapterIdx(i);
    setActiveLine(1);
    setProgress(0);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // Alt+Left/Right = chapters, Alt+L = line numbers, Alt+B = explorer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowRight') goto(chapterIdx + 1);
      else if (e.key === 'ArrowLeft') goto(chapterIdx - 1);
      else if (e.key.toLowerCase() === 'l') setShowNumbers((v) => !v);
      else if (e.key.toLowerCase() === 'b') setExplorerOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="editor">
      <EditorHeader
        filename={`${slug(fic.title)}.ts`}
        mode={mode}
        modes={MODES}
        onMode={setMode}
        fontId={fontId}
        onFontId={setFontId}
        showNumbers={showNumbers}
        onToggleNumbers={() => setShowNumbers((v) => !v)}
        onFont={(d) => setFontSize((s) => Math.min(28, Math.max(12, s + d)))}
        onClose={onClose}
      />
      <div className="workbench">
        <ActivityBar explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen((v) => !v)} />
        {explorerOpen && (
          <Sidebar
            rootName={slug(fic.title)}
            chapterTitles={fic.chapters.map((c) => c.title)}
            activeChapter={chapterIdx}
            onSelectChapter={goto}
          />
        )}
        <div className="main">
          <EditorTabs titles={fic.chapters.map((c) => c.title)} active={chapterIdx} onSelect={goto} />
          <div className="breadcrumbs">
            {slug(fic.title)} <span className="sep">›</span> src <span className="sep">›</span> chapters{' '}
            <span className="sep">›</span> <span className="c-fg">{chapter.title}</span>
          </div>
          <Reader
            lines={rows}
            showNumbers={showNumbers}
            fontSize={fontSize}
            fontFamily={fontStack}
            activeLine={activeLine}
            onActive={setActiveLine}
            onProgress={setProgress}
            scrollRef={scrollRef}
          />
        </div>
      </div>
      <StatusBar
        line={activeLine}
        total={rows.length}
        chapter={chapterIdx + 1}
        chapters={fic.chapters.length}
        words={totalWords}
        progress={progress}
      />
    </div>
  );
}