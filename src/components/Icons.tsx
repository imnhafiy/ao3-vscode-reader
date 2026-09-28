const base = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
} as const;

export const FilesIcon = () => (
  <svg {...base}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
);
export const SearchIcon = () => (
  <svg {...base}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const GitIcon = () => (
  <svg {...base}><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 8v8" /><path d="M18 10a6 6 0 0 1-6 6H8" /></svg>
);
export const RunIcon = () => (
  <svg {...base}><path d="M7 4l12 8-12 8z" /></svg>
);
export const ExtensionsIcon = () => (
  <svg {...base}><rect x="3.5" y="12.5" width="8" height="8" /><rect x="12.5" y="12.5" width="8" height="8" /><rect x="3.5" y="3.5" width="8" height="8" /><rect x="14" y="2.5" width="7" height="7" transform="rotate(18 17.5 6)" /></svg>
);
export const AccountIcon = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const SettingsIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7" strokeDasharray="3 2.2" /></svg>
);

export const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`chev ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4l4 4-4 4" />
  </svg>
);

export const FolderIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    {open
      ? <path d="M1.5 4.5v8h11l2-6h-9.5l-1-2h-2.5z" />
      : <path d="M1.5 3.5h4.5l1.5 1.5h7v7.5h-13z" />}
  </svg>
);

export const FileIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round">
    <path d="M3.5 1.5h6l3 3v10h-9z" /><path d="M9.5 1.5v3h3" />
  </svg>
);