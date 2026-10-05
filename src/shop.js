// "Sign in to your shop": every shop runs its own InPhox app at
// https://<shop>.<shopDomain>. These pure helpers turn what someone typed into
// that address; no React and no DOM, so `npm test` imports this file directly.

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

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
  if (!LABEL.test(text)) return { error: 'Shop names use letters, numbers and dashes only.' };
  return { shop: text };
}

/** The shop's own sign-in page. */
export const shopLoginUrl = (shop, domain) => `https://${shop}.${domain}/web/login`;
