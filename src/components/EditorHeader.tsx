import type { Mode } from '../services/syntaxHighlighter';

type Props = {
  filename: string;
  mode: Mode;
  modes: Mode[];
  onMode: (m: Mode) => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  onFont: (delta: number) => void;
  onClose: () => void;
};

export default function EditorHeader({ filename, mode, modes, onMode, showNumbers, onToggleNumbers, onFont, onClose }: Props) {
  return (
    <div className="titlebar">
      <div className="dots" aria-hidden>
        <i style={{ background: 'var(--red)' }} />
        <i style={{ background: 'var(--yellow)' }} />
        <i style={{ background: 'var(--green)' }} />
      </div>
      <div className="title-file">{filename}</div>
      <div className="title-controls">
        <label className="ctl">
          highlight
          <select value={mode} onChange={(e) => onMode(e.target.value as Mode)}>
            {modes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <button className="ctl" onClick={() => onFont(-1)} title="Smaller text">A−</button>
        <button className="ctl" onClick={() => onFont(1)} title="Larger text">A+</button>
        <button className={`ctl ${showNumbers ? 'on' : ''}`} onClick={onToggleNumbers} title="Line numbers (Alt+L)">#</button>
        <button className="ctl" onClick={onClose} title="Open another fic">close</button>
      </div>
    </div>
  );
}
