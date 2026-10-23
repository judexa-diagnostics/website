// Opening the hub's sign-up from a plan button. The hub answers on its own address; if it does not
// answer within a few seconds the person lands on the site's own "Sign-up is busy" page instead of a
// browser error page. Plain functions with injectable parts, so `npm test` runs them without a browser.
import { BUSY_HREF } from './pricing.js';

export const HUB_WAIT_MS = 4000;

/** True when the click should keep its normal browser meaning (new tab, new window, download). */
export const isPlainClick = e => !(e && (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey));

/**
 * Go to `url` (a hub sign-up address) if the hub answers, else to the busy page.
 * Any HTTP answer counts as "the hub is up"; only a network failure or silence counts as busy.
 */
export async function openSignup(url, {
  fetchImpl = globalThis.fetch,
  go = u => location.assign(u),
  busy = () => { location.hash = BUSY_HREF; },
  waitMs = HUB_WAIT_MS
} = {}) {
  if (typeof fetchImpl !== 'function') { go(url); return 'go'; }
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), waitMs) : null;
  try {
    await fetchImpl(new URL(url).origin + '/', { mode: 'no-cors', cache: 'no-store', credentials: 'omit', signal: ctl && ctl.signal });
    go(url);
    return 'go';
  } catch (e) {
    busy();
    return 'busy';
  } finally {
    if (timer) clearTimeout(timer);
  }
}
