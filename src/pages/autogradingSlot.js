import { lazy } from 'react';

// The Autograding page is a separate chunk: the browser loads it only when someone opens /autograding.
// The build prerender (src/entry-server.jsx) swaps in the page itself, so crawlers get the full HTML, not a loader.
export let AutogradingPage = lazy(() => import('./Autograding.jsx'));
export const setEagerAutograding = page => { AutogradingPage = page; };
// The industry pages (/autograding/buyback ...) are one more chunk, loaded the same way.
export let IndustryPage = lazy(() => import('./AgIndustry.jsx'));
export const setEagerIndustry = page => { IndustryPage = page; };
