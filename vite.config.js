import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No <noscript> copy of the plans: scripts/prerender.mjs writes every page's real words (the plans on /pricing) into
// its HTML, so a crawler or a browser with JavaScript off already reads them. The old <noscript> block put a second
// <h1> and the whole plan list on every one of the 46 pages (2026-11-27).
export default defineConfig({
  plugins: [react()],
  // Absolute asset paths: pages are real paths now (/about), so assets must not resolve relative to the page.
  base: '/',
});
