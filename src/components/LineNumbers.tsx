export default function LineNumbers({ n, active }: { n: number; active: boolean }) {
  return <span className={`ln ${active ? 'ln-active' : ''}`}>{String(n).padStart(3, '0')}</span>;
}
