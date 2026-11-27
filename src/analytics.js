// First-party, anonymous visit statistics (2026-11-27): which pages people read and which buttons they press, so we know
// which industry page turns visitors into customers. Sent only to inphox's own app (autograding.inphox.net), never to
// another company and never to the CRM. No cookies, no IP or personal details: a random visit id kept in sessionStorage
// (gone when the tab closes). Do Not Track or Global Privacy Control: nothing is sent at all (cookies policy, section 2).
// The visit id also rides on links into the app (sid=), so the app can join a page view to the sign-up it led to.
import { AG_APP, visitId } from './chrome.js';
export { optedOut, visitId } from './chrome.js';

const ENDPOINT = AG_APP + '/api/site-events';
const clean = (v, n = 80) => (typeof v === 'string' && /^[A-Za-z0-9_.:/#?=&%-]{1,200}$/.test(v) ? v.slice(0, n) : undefined);

/** The body the app accepts: a visit id and up to 10 events, only the names and keys it knows. */
export function payload(sid, events) {
  return JSON.stringify({ sid, events: events.slice(0, 10).map(e => ({ name: e.name, props: Object.fromEntries(
    Object.entries(e.props || {}).map(([k, v]) => [k, clean(String(v))]).filter(([, v]) => v !== undefined)) })) });
}

function send(events) {
  const sid = visitId();
  if (!sid) return;
  const body = payload(sid, events);
  // text/plain: a "simple" request, so no CORS preflight and the beacon survives the page unloading
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true, credentials: 'omit', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  } catch (e) { /* statistics never get in the way */ }
}

let lastView = '';
/** A page was shown (path, language). Once per path per show. */
export function pageViewed(page, lang) {
  if (typeof location === 'undefined' || location.pathname === lastView) return;
  lastView = location.pathname;
  const q = new URLSearchParams(location.search);
  send([{ name: 'site_page_viewed', props: { page, lang, path: location.pathname, utm_source: q.get('utm_source'),
    utm_campaign: q.get('utm_campaign'), ref: q.get('ref') } }]);
}

/** A click on a link into the app, the API docs or the contact page: which page, which button (via), where to. */
export function linkClicked(a, page) {
  let url;
  try { url = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
  const app = url.origin === AG_APP;
  const dest = app ? (url.pathname.startsWith('/api/docs') ? 'docs' : url.pathname.startsWith('/demo') ? 'demo' : url.pathname.startsWith('/developers') ? 'api_keys' : 'app')
    : /^\/(es\/)?contact$/.test(url.pathname) ? 'contact' : null;
  if (!dest) return;
  send([{ name: 'site_cta_clicked', props: { page, dest, via: url.searchParams.get('via') } }]);
}
