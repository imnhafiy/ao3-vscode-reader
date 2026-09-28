type Props = { titles: string[]; active: number; onSelect: (i: number) => void };

// "Chapter 12: The Last Train" -> "chapter-12"
export const tabLabel = (title: string, i: number) => {
  const m = title.match(/chapter\s+([\w-]+)/i);
  return `chapter-${m ? m[1].toLowerCase() : i + 1}`;
};

export default function EditorTabs({ titles, active, onSelect }: Props) {
  return (
    <div className="tabs" role="tablist">
      {titles.map((t, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          className={`tab ${i === active ? 'active' : ''}`}
          onClick={() => onSelect(i)}
          title={t}
        >
          <span className="tab-icon">TS</span>
          {tabLabel(t, i)}
          <span className="tab-x" aria-hidden>×</span>
        </button>
      ))}
    </div>
  );
}
