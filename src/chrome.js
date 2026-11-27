// The words of the site chrome (header, menu, footer) in English and Spanish, for both products.
// inphox sells two products here: inphox Inventory (the shop platform, every page but /autograding) and inphox
// Autograding (its own app at autograding.inphox.net). On /autograding the header's Pricing, Docs and Sign in point
// at Autograding and say so in their labels, so no one signs in to the wrong product.
export const AG_APP = 'https://autograding.inphox.net';
export const AG_DOCS = AG_APP + '/api/docs';
export const AG_PRICING = AG_DOCS + '#pricing';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const TAGS_KEY = 'inphox_ag_utm', REF_KEY = 'inphox_ag_ref';
const cleanTag = v => (/^[A-Za-z0-9_.-]{1,120}$/.test(v || '') ? v : '');
const cleanRef = r => (/^[A-Za-z0-9_-]{1,32}$/.test(r || '') ? r : '');

/** Keep a visitor's own ?ref= and utm_* tags for the visit, site-wide, from whichever page they land on (the tags only
 *  when they bring a source). Every link into the app passes them on. */
export function keepVisitorTags(search = '') {
  try {
    const q = new URLSearchParams(search), tags = {};
    for (const k of UTM_KEYS) { const v = cleanTag(q.get(k)); if (v) tags[k] = v; }
    if (tags.utm_source) sessionStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    const ref = cleanRef(q.get('ref'));
    if (ref) sessionStorage.setItem(REF_KEY, ref);
  } catch (e) { /* private window, old browser */ }
}
/** The visitor's ?ref= for this visit ("Their code stays with your sign-up"), or ''. */
export const visitorRef = () => {
  if (typeof window === 'undefined') return '';
  try { return cleanRef(sessionStorage.getItem(REF_KEY)); } catch (e) { return ''; }
};
const visitorTags = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(TAGS_KEY) || 'null'); } catch (e) { return null; }
};

/**
 * The query on every link into the Autograding app (the app keeps the first visit's tags through sign-up and payment).
 * - A visitor who came with their own utm_* tags (an email, an ad) passes them on as they came, so they count as that
 *   source wherever they land.
 * - Otherwise the link is tagged as the website's, except utm_source when it passes a ?ref= on: the app takes a ref as
 *   the source only when no utm_source came with it ("Their code stays with your sign-up").
 * - via= always names the page and button (buyback-hero), kept apart from the campaign's own tags, so an outreach
 *   email's attribution is never overwritten and the page that converted is still known.
 */
export function agQuery(content, lang = 'en', ref = '', visitor = visitorTags()) {
  const q = new URLSearchParams();
  if (ref) q.set('ref', ref);
  if (visitor && visitor.utm_source) { for (const k of UTM_KEYS) if (visitor[k]) q.set(k, visitor[k]); }
  else {
    if (!ref) q.set('utm_source', 'inphox.net');
    q.set('utm_medium', 'website'); q.set('utm_campaign', 'autograding'); q.set('utm_content', content);
  }
  if (content) q.set('via', content);
  q.set('lang', lang);
  return q.toString();
}
/** The Autograding sign-up, with the visitor's ?ref= (kept by the page) and tags passed on. */
export const agStartUrl = (content, lang = 'en', ref = '') => `${AG_APP}/?${agQuery(content, lang, ref)}`;

export const CHROME = {
  en: {
    inv: 'Inventory', ag: 'Autograding', products: 'inphox products',
    invLong: 'inphox Inventory', agLong: 'inphox Autograding',
    about: 'About', pricing: 'Pricing', signin: 'Sign in',
    agPricing: 'Autograding pricing', agDocs: 'API docs', agSignin: 'Sign in to Autograding', agStart: 'Start free',
    menu: 'Menu', close: 'Close', language: 'Language',
    switchTo: 'Switch product',
    invDesc: 'Testing, erasure, inventory, repairs and sales for your shop',
    agDesc: 'Grade any device from photos in 7–8 seconds',
    agMenu: [
      ['Autograding overview', '/autograding', 'What it grades, how, and what it costs'],
      ['Autograding pricing', AG_PRICING, 'Prepaid credits: 6¢ a photo, at most 10¢ a device'],
      ['API docs', AG_DOCS, 'Endpoints, examples and the OpenAPI file'],
      ['By industry', '/autograding#industries', 'Buyback, ITAD, repair shops, wholesale, marketplaces and more'],
      ['Contact us', '/contact', 'Volume pricing, integrations and questions']
    ],
    foot: {
      blurb: 'Diagnostics, inventory, repair and sales for businesses that buy, fix and resell electronics.',
      inventory: 'inphox Inventory', features: 'Features', industries: 'Industries', pricing: 'Pricing', built: "How it's built",
      autograding: 'inphox Autograding', agOverview: 'Overview', agIndustries: 'By industry', agDocs: 'API docs', agPricing: 'Pricing', agSignin: 'Sign in to Autograding',
      start: 'Start', signin: 'Sign in to inphox Inventory', sales: 'Contact sales',
      company: 'Company', aboutUs: 'About us', security: 'Security & compliance', careers: 'Careers', contact: 'Contact',
      privacy: 'Privacy', terms: 'Terms', refunds: 'Refunds', copyright: 'Copyright & abuse', law: 'Law enforcement',
      subprocessors: 'Subprocessors', erasure: 'Erasure claims', cookies: 'Cookies', accessibility: 'Accessibility',
      language: 'Language'
    }
  },
  es: {
    inv: 'Inventory', ag: 'Autograding', products: 'Productos de inphox',
    invLong: 'inphox Inventory', agLong: 'inphox Autograding',
    about: 'Nosotros', pricing: 'Precios', signin: 'Entrar',
    agPricing: 'Precios de Autograding', agDocs: 'Documentación de la API', agSignin: 'Entrar a Autograding', agStart: 'Empieza gratis',
    menu: 'Menú', close: 'Cerrar', language: 'Idioma',
    switchTo: 'Cambiar de producto',
    invDesc: 'Pruebas, borrado, inventario, reparaciones y ventas para tu negocio',
    agDesc: 'Califica cualquier dispositivo con fotos en 7–8 segundos',
    agMenu: [
      ['Autograding: resumen', '/es/autograding', 'Qué califica, cómo y cuánto cuesta'],
      ['Precios de Autograding', AG_PRICING, 'Créditos prepagados: 6¢ por foto, máximo 10¢ por dispositivo'],
      ['Documentación de la API', AG_DOCS, 'Endpoints, ejemplos y el archivo OpenAPI'],
      ['Por industria', '/es/autograding#industries', 'Recompra, ITAD, talleres, mayoreo, marketplaces y más'],
      ['Contáctanos', '/contact', 'Precios por volumen, integraciones y preguntas']
    ],
    foot: {
      blurb: 'Diagnóstico, inventario, reparación y ventas para negocios que compran, reparan y revenden electrónicos.',
      inventory: 'inphox Inventory', features: 'Funciones', industries: 'Industrias', pricing: 'Precios', built: 'Cómo está hecho',
      autograding: 'inphox Autograding', agOverview: 'Resumen', agIndustries: 'Por industria', agDocs: 'Documentación de la API', agPricing: 'Precios', agSignin: 'Entrar a Autograding',
      start: 'Empezar', signin: 'Entrar a inphox Inventory', sales: 'Hablar con ventas',
      company: 'Empresa', aboutUs: 'Nosotros', security: 'Seguridad y cumplimiento', careers: 'Empleo', contact: 'Contacto',
      privacy: 'Privacidad', terms: 'Términos', refunds: 'Reembolsos', copyright: 'Derechos de autor y abuso', law: 'Autoridades',
      subprocessors: 'Subencargados', erasure: 'Certificados de borrado', cookies: 'Cookies', accessibility: 'Accesibilidad',
      language: 'Idioma'
    }
  }
};
