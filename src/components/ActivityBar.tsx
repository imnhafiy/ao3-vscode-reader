import { AccountIcon, ExtensionsIcon, FilesIcon, GitIcon, RunIcon, SearchIcon, SettingsIcon } from './Icons';

type Props = { explorerOpen: boolean; onToggleExplorer: () => void };

// Only the Explorer button does anything; the rest are for looks.
export default function ActivityBar({ explorerOpen, onToggleExplorer }: Props) {
  return (
    <nav className="activitybar" aria-label="Activity bar">
      <div className="ab-group">
        <button className={`ab-btn ${explorerOpen ? 'active' : ''}`} onClick={onToggleExplorer} title="Explorer (Alt+B)">
          <FilesIcon />
        </button>
        <button className="ab-btn" title="Search" tabIndex={-1}><SearchIcon /></button>
        <button className="ab-btn" title="Source Control" tabIndex={-1}><GitIcon /><span className="ab-badge">3</span></button>
        <button className="ab-btn" title="Run and Debug" tabIndex={-1}><RunIcon /></button>
        <button className="ab-btn" title="Extensions" tabIndex={-1}><ExtensionsIcon /></button>
      </div>
      <div className="ab-group">
        <button className="ab-btn" title="Accounts" tabIndex={-1}><AccountIcon /></button>
        <button className="ab-btn" title="Manage" tabIndex={-1}><SettingsIcon /></button>
      </div>
    </nav>
  );
}