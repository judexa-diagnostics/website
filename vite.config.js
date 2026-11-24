import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { noscriptPlans } from './src/noscriptPlans.js';

// With JavaScript off the page would be empty. This puts the plans and their prices, written from
// src/pricing.js at build time (so they cannot drift), inside <noscript>.
const plansWithoutScript = () => ({
  name: 'plans-without-script',
  transformIndexHtml: html => html.replace('<div id="root"></div>', `<div id="root"></div>\n${noscriptPlans()}`)
});

export default defineConfig({
  plugins: [react(), plansWithoutScript()],
  // Absolute asset paths: pages are real paths now (/about), so assets must not resolve relative to the page.
  base: '/',
});
