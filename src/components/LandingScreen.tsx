import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

type Props = {
  loading: boolean;
  error: string | null;
  onOpen: (url: string) => void;
  onDemo: () => void;
};

export default function LandingScreen({ loading, error, onOpen, onDemo }: Props) {
  const [url, setUrl] = useState('');
  const submit = () => url.trim() && !loading && onOpen(url.trim());

  return (
    <div className="landing">
      <div className="landing-panel">
        <div className="landing-title">AO3 READER</div>
        <div className="landing-sub">
          <span className="c-muted">// </span>Paste an Archive of Our Own URL
        </div>

        <input
          className="landing-input"
          type="text"
          autoFocus
          spellCheck={false}
          placeholder="https://archiveofourown.org/works/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />

        <button className="landing-open" onClick={submit} disabled={loading || !url.trim()}>
          {loading ? '[ FETCHING... ]' : '[ OPEN ]'}
        </button>

        {error && <ErrorMessage detail={error} />}

        <button className="landing-demo" onClick={onDemo}>
          open demo fic
        </button>
      </div>
    </div>
  );
}
