export default function ErrorMessage({ detail }: { detail?: string }) {
  return (
    <div className="error">
      <div className="error-head">&gt; ERROR</div>
      <p>Unable to load this AO3 work.</p>
      {detail && <p className="error-detail">{detail}</p>}
      <p className="muted">Check the URL and try again.</p>
    </div>
  );
}
