// "Sign in to your shop": every shop runs its own InPhox app at
// https://<shop>.<shopDomain>. These pure helpers turn what someone typed into
// that address; no React and no DOM, so `npm test` imports this file directly.

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

// Names that are InPhox's own hosts or that no shop may take (the same list the
// shop builder refuses): a sign-in attempt at one of these is never a real shop.
export const RESERVED = new Set([
  'www', 'mail', 'email', 'smtp', 'imap', 'pop', 'pop3', 'mx', 'ftp', 'sftp', 'ssh', 'ns', 'ns1', 'ns2', 'dns', 'vpn',
  'api', 'app', 'apps', 'admin', 'administrator', 'root', 'dashboard', 'intake', 'billing', 'pay', 'payments', 'checkout',
  'status', 'staging', 'stage', 'dev', 'test', 'demo', 'sandbox', 'localhost', 'webmail', 'autodiscover',
  'autoconfig', 'cpanel', 'support', 'help', 'docs', 'blog', 'static', 'cdn', 'assets', 'media', 'portal', 'login',
  'auth', 'sso', 'oauth', 'account', 'accounts', 'signup', 'register', 'sheets', 'sheets-micro', 'errors',
  'error-analysis', 'grafana', 'metrics', 'monitor', 'repair', 'tickets', 'shop', 'store', 'inphox', 'platform'
]);

/**
 * The shop name from what was typed: "bayareaphones", "BayAreaPhones",
 * "bayareaphones.inphox.net" or a pasted "https://bayareaphones.inphox.net/web/login"
 * all give "bayareaphones". Returns { shop } or { error } with words for the page.
 */
export function shopFromInput(raw, domain) {
  let text = String(raw || '').trim().toLowerCase();
  if (!text) return { error: "Enter your shop's name." };
  text = text.replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.+$/, '');
  if (text === domain || text === 'www.' + domain) return { error: "Enter your shop's name, the part before ." + domain + '.' };
  const suffix = '.' + domain;
  if (text.endsWith(suffix)) text = text.slice(0, -suffix.length);
  if (text.startsWith('www.')) text = text.slice(4);
  if (text.includes('.') || text.includes('@')) {
    return { error: `Enter just your shop's name, the part before .${domain} (for example "yourshop").` };
  }
  if (text.length > 63) return { error: 'That name is too long. Shop names have at most 63 characters.' };
  if (!LABEL.test(text)) return { error: 'Shop names use letters, numbers and dashes only (no dash at the start or end).' };
  if (RESERVED.has(text)) return { error: 'That name is not a shop. Enter your own shop\'s name.' };
  return { shop: text };
}

/**
 * A client-side brake on the sign-in box so it cannot be used to try name after
 * name: at most `max` tries per `windowMs` (5 per minute). `try()` returns
 * { ok: true } and counts the try, or { ok: false, wait } with the seconds to
 * wait. Only a convenience (a script can skip the page); the server side limits
 * are the real protection. `now` is injectable for tests.
 */
export function createThrottle({ max = 5, windowMs = 60000, now = Date.now } = {}) {
  let stamps = [];
  return {
    try() {
      const t = now();
      stamps = stamps.filter(x => t - x < windowMs);
      if (stamps.length >= max) return { ok: false, wait: Math.max(1, Math.ceil((stamps[0] + windowMs - t) / 1000)) };
      stamps.push(t);
      return { ok: true };
    }
  };
}

/** The shop's own sign-in page. */
export const shopLoginUrl = (shop, domain) => `https://${shop}.${domain}/web/login`;
