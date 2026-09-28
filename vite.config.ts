import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AO3 doesn't send CORS headers, so the browser can't fetch it directly.
// This is the smallest workaround: Vite forwards /ao3/* to archiveofourown.org.
// (Works for `npm run dev` and `npm run preview`.)
const ao3 = {
  target: 'https://archiveofourown.org',
  changeOrigin: true,
  rewrite: (p: string) => p.replace(/^\/ao3/, ''),
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; ao3-vscode-reader/0.1; personal use)',
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/ao3': ao3 } },
  preview: { proxy: { '/ao3': ao3 } },
});
