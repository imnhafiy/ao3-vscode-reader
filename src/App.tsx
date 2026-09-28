import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import Editor from './components/Editor';
import { fetchFic } from './services/ao3Parser';
import { mockFic } from './services/mockFic';
import type { Fic } from './types/fic';

export default function App() {
  const [fic, setFic] = useState<Fic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      setFic(await fetchFic(url));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  };

  if (fic) {
    // key => new fic gets a fresh color seed; same fic keeps stable colors
    return <Editor key={fic.id} fic={fic} onClose={() => setFic(null)} />;
  }
  return <LandingScreen loading={loading} error={error} onOpen={open} onDemo={() => setFic(mockFic)} />;
}
