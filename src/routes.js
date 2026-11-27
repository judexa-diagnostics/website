// One table for every public page: its path, title and description. The router (SiteLogic), the build-time
// prerender (scripts/prerender.mjs), the sitemap and each page's <title>, description and canonical tag all read
// from here, so a page can never have a path the sitemap does not know or a title the browser tab does not show.
import { INDUSTRY_META, isIndustryPage } from './autograding/industryMeta.js';

export const SITE = 'https://www.inphox.net';
export const SITE_NAME = 'inphox';

// index: false keeps a page out of the sitemap and adds noindex (account doors and the busy page are not content).
const EN_ROUTES = [
  { page: 'home', path: '/', title: 'Used phone testing, data erasure and inventory software | inphox', description: 'Test, erase, grade, track and sell used phones, tablets and laptops. inphox is one platform for intake, diagnostics, certified erasure, inventory, repairs and sales.' },
  { page: 'autograding', path: '/autograding', title: 'AI device grading for phones, tablets and laptops | inphox Autograding', description: 'Automated cosmetic grading for used phones, tablets, laptops and watches. Photos in, a consistent A to D grade with every flaw measured. Open API, zero data retention.' },
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
  { page: 'cookies', path: '/cookies', title: 'Cookie policy | inphox', description: 'The inphox website sets no cookies. What it keeps in your browser, the anonymous visit counts it makes, and why.' },
  { page: 'accessibility', path: '/accessibility', title: 'Accessibility | inphox', description: 'inphox works toward WCAG 2.2 AA: readable text, full keyboard use, labels on every control and reduce-motion support.' }
];

// Every page in Spanish too, at /es/<path> (home: /es), with its own title and description (Chris 2026-11-24).
const ES_META = {
  home: ['Software para probar, borrar e inventariar teléfonos usados | inphox', 'Prueba, borra, califica y vende teléfonos, tabletas y laptops usados. Una plataforma para recepción, diagnóstico, borrado certificado, inventario y reparaciones.'],
  autograding: ['Calificación de dispositivos con IA en 7–8 s | inphox Autograding', 'Calificación cosmética automática de teléfonos, tabletas, laptops y relojes usados. Fotos de entrada, una calificación A a D constante con cada defecto medido.'],
  about: ['Sobre inphox: fundadores y empresa', 'inphox LLC crea software para negocios de electrónicos usados. Fundador y CEO Christopher Luk; cofundadores Sri Vatsa Vuddanti e Iniyan Kannappan.'],
  features: ['Funciones: pruebas, borrado, calificación e inventario | inphox', 'Todas las funciones de inphox: diagnóstico, borrado certificado, calificación, inventario por ubicación, reparaciones, pedidos, listas de precios y marketplace.'],
  pricing: ['Precios y planes | inphox', 'Planes de inphox desde Gratis hasta Enterprise. Revisiones de dispositivos, estaciones, usuarios y comisiones del marketplace, con los precios a la vista.'],
  industries: ['Industrias: reacondicionadores, talleres y tiendas de canje | inphox', 'inphox para reacondicionadores e ITAD, talleres de reparación independientes, tiendas de compra, venta y canje, cadenas con varias sucursales y vendedores en línea.'],
  platform: ['La plataforma inphox: hecha en casa, un registro por dispositivo', 'La plataforma inphox está hecha en casa, de principio a fin: pruebas, borrado, inventario, reparaciones y ventas en un solo registro por dispositivo.'],
  security: ['Seguridad en inphox', 'Cómo inphox protege cuentas y datos: cifrado en tránsito, credenciales con hash, registro de accesos, mínimo privilegio, borrado certificado y retención clara.'],
  careers: ['Empleo en inphox', 'Vacantes abiertas en inphox y cómo postularte.'],
  contact: ['Contacta a ventas y soporte de inphox', 'Habla con inphox sobre planes, volúmenes empresariales, estaciones y soporte.'],
  start: ['Empieza con inphox', 'Abre tu tienda inphox y elige un plan.'],
  signin: ['Entra a tu tienda | inphox', 'Entra a tu tienda inphox.'],
  'signup-busy': ['El registro está ocupado | inphox', 'El registro está ocupado en este momento. Inténtalo de nuevo en un momento.'],
  terms: ['Términos del servicio | inphox', 'Los términos para usar inphox.'],
  privacy: ['Política de privacidad | inphox', 'Qué recopila inphox, por qué, cuánto tiempo se guarda y tus opciones.'],
  refunds: ['Política de reembolsos | inphox', 'Cómo funcionan los planes, los pagos y los reembolsos en inphox.'],
  copyright: ['Derechos de autor y DMCA | inphox', 'Cómo enviar a inphox un aviso de derechos de autor.'],
  'law-enforcement': ['Solicitudes de las autoridades | inphox', 'Cómo atiende inphox las solicitudes de las autoridades.'],
  subprocessors: ['Subencargados | inphox', 'Los proveedores de servicios que inphox usa para operar el servicio.'],
  erasure: ['Certificados de borrado | inphox', 'Qué significa un certificado de borrado de inphox, el método NIST SP 800-88 que sigue y sus límites.'],
  cookies: ['Política de cookies | inphox', 'El sitio web de inphox no usa cookies. Qué guarda en tu navegador, los conteos anónimos de visitas y por qué.'],
  accessibility: ['Accesibilidad | inphox', 'inphox trabaja hacia WCAG 2.2 AA: texto legible, uso completo con teclado, etiquetas en cada control y soporte para reducir el movimiento.']
};
// Autograding by industry (/autograding/buyback ...): their titles live with the industry list (industryMeta.js).
const IND_EN = INDUSTRY_META.map(m => ({ page: m.page, path: m.path, title: m.en.title, description: m.en.description }));
const IND_ES = Object.fromEntries(INDUSTRY_META.map(m => [m.page, [m.es.title, m.es.description]]));
const ALL_EN = [...EN_ROUTES, ...IND_EN];
export const ROUTES = [
  ...ALL_EN,
  ...ALL_EN.map(r => {
    const m = ES_META[r.page] || IND_ES[r.page];
    if (!m) throw new Error('routes: no Spanish title for ' + r.page);
    return { ...r, path: r.path === '/' ? '/es' : '/es' + r.path, title: m[0], description: m[1], lang: 'es', enPath: r.path };
  })
];

// Each page exists in English and Spanish (lang: 'es', at /es/<path>).
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
export const productOf = page => (page === 'autograding' || isIndustryPage(page) ? 'ag' : 'inv');

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
