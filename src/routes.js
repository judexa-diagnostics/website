// One table for every public page: its path, title and description. The router (SiteLogic), the build-time
// prerender (scripts/prerender.mjs), the sitemap and each page's <title>, description and canonical tag all read
// from here, so a page can never have a path the sitemap does not know or a title the browser tab does not show.
export const SITE = 'https://www.inphox.net';
export const SITE_NAME = 'inphox';

// index: false keeps a page out of the sitemap and adds noindex (account doors and the busy page are not content).
export const ROUTES = [
  { page: 'home', path: '/', title: 'Used phone testing, data erasure and inventory software | inphox', description: 'Test, erase, grade, track and sell used phones, tablets and laptops. inphox is one platform for intake, diagnostics, certified erasure, inventory, repairs and sales.' },
  { page: 'autograding', path: '/autograding', title: 'AI device grading for phones, tablets and laptops | inphox Autograding', description: 'Automated cosmetic grading for used phones, tablets, laptops and watches. Photos in, a consistent A to D grade with every flaw measured. Open API, zero data retention.', lang: 'en', alt: '/es/autograding' },
  { page: 'autograding', path: '/es/autograding', title: 'Calificación de dispositivos con IA en 7 segundos | inphox Autograding', description: 'Calificación cosmética automática de teléfonos, tabletas, laptops y relojes usados. Fotos de entrada, una calificación A a D constante con cada defecto medido.', lang: 'es', alt: '/autograding' },
  { page: 'about', path: '/about', title: 'About inphox: founders and company', description: 'inphox LLC builds software for businesses that buy, fix and resell used electronics. Founder & CEO Christopher Luk; co-founders Sri Vatsa Vuddanti and Iniyan Kannappan.' },
  { page: 'features', path: '/features', title: 'Features: testing, erasure, grading and inventory | inphox', description: 'Every inphox feature: device diagnostics, certified erasure, grading, inventory by location, repairs, orders, price lists and the marketplace.' },
  { page: 'pricing', path: '/pricing', title: 'Pricing and plans | inphox', description: 'inphox plans from Free to Enterprise. Device checks, stations, seats and marketplace fees, with prices shown up front.' },
  { page: 'industries', path: '/industries', title: 'Industries: refurbishers, repair shops and trade-in stores | inphox', description: 'inphox for refurbishers and ITAD, independent repair shops, buy, sell and trade-in shops, multi-location retail and online sellers.' },
  { page: 'platform', path: '/platform', title: 'The inphox platform: built in house, one record per device', description: 'The inphox platform is built in house, end to end: testing, erasure, inventory, repairs and sales on one record per device.' },
  { page: 'security', path: '/security', title: 'Security at inphox', description: 'How inphox protects accounts and data: encryption in transit, hashed credentials, access logging, least-privilege access, certified erasure and clear retention.' },
  { page: 'careers', path: '/careers', title: 'Careers at inphox', description: 'Open roles at inphox and how to apply.' },
  { page: 'contact', path: '/contact', title: 'Contact inphox sales and support', description: 'Talk to inphox about plans, enterprise volumes, stations and support.' },
  { page: 'start', path: '/start', title: 'Start with inphox', description: 'Open your inphox shop and choose a plan.' },
  { page: 'signin', path: '/signin', title: 'Sign in to your shop | inphox', description: 'Sign in to your inphox shop.', index: false },
  { page: 'signup-busy', path: '/signup-busy', title: 'Sign-up is busy | inphox', description: 'Sign-up is busy right now. Please try again shortly.', index: false },
  { page: 'terms', path: '/terms', title: 'Terms of Service | inphox', description: 'The terms for using inphox.' },
  { page: 'privacy', path: '/privacy', title: 'Privacy Policy | inphox', description: 'What inphox collects, why, how long it is kept and your choices.' },
  { page: 'refunds', path: '/refunds', title: 'Refund policy | inphox', description: 'How plans, payments and refunds work at inphox.' },
  { page: 'copyright', path: '/copyright', title: 'Copyright and DMCA | inphox', description: 'How to send inphox a copyright notice.' },
  { page: 'law-enforcement', path: '/law-enforcement', title: 'Law enforcement requests | inphox', description: 'How inphox handles requests from law enforcement.' },
  { page: 'subprocessors', path: '/subprocessors', title: 'Subprocessors | inphox', description: 'The service providers inphox uses to run the service.' },
  { page: 'erasure', path: '/erasure', title: 'Erasure certificates | inphox', description: 'What an inphox erasure certificate means, the NIST SP 800-88 method it follows and its limits.' },
  { page: 'cookies', path: '/cookies', title: 'Cookie policy | inphox', description: 'The inphox website sets no cookies. What it keeps in local storage and why.' },
  { page: 'accessibility', path: '/accessibility', title: 'Accessibility | inphox', description: 'inphox works toward WCAG 2.2 AA: readable text, full keyboard use, labels on every control and reduce-motion support.' }
];

// A page can have a Spanish twin at /es/<path> (lang: 'es'); every other route is English.
export const PAGES = [...new Set(ROUTES.map(r => r.page))];
const langOf = r => r.lang || 'en';
const BY_PAGE = Object.fromEntries(ROUTES.filter(r => langOf(r) === 'en').map(r => [r.page, r]));
const BY_PAGE_ES = Object.fromEntries(ROUTES.filter(r => langOf(r) === 'es').map(r => [r.page, r]));

/** The route for a page in a language; a page with no Spanish twin falls back to its English route. */
export const routeFor = (page, lang = 'en') => (lang === 'es' && BY_PAGE_ES[page]) || BY_PAGE[page] || BY_PAGE.home;
export const pathFor = (page, lang = 'en') => routeFor(page, lang).path;
export const canonicalFor = (page, lang = 'en') => SITE + (pathFor(page, lang) === '/' ? '/' : pathFor(page, lang));
/** true when the page exists in Spanish. */
export const hasSpanish = page => Boolean(BY_PAGE_ES[page]);
/** '/es/autograding' → 'es'; anything else → 'en'. */
export const langFromPath = (pathname = '/') => (/^\/es(\/|$)/.test(String(pathname)) ? 'es' : 'en');
/** inphox sells two products on this site; the header, menu and page swipe follow the one being shown. */
export const productOf = page => (page === 'autograding' ? 'ag' : 'inv');

/** '/about', '/about/', '/about?x' → 'about'; anything unknown → null. */
export const pageFromPath = (pathname = '/') => {
  const p = '/' + String(pathname).split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  const hit = ROUTES.find(r => r.path === p || (p === '/home' && r.page === 'home') || (p === '/index.html' && r.page === 'home'));
  return hit ? hit.page : null;
};

/** Old links were '#/about'. Returns the page an old hash names, or null. */
export const pageFromHash = (hash = '') => {
  const h = String(hash).replace(/^#\/?/, '');
  return h && PAGES.includes(h) ? h : (h === 'home' ? 'home' : null);
};
