// Sending the Contact form's lead. A plain function with an injectable fetch, so `npm test` runs it without a browser.
// The request is cut off after LEAD_WAIT_MS: a server that never answers must not leave the button on "Sending…" for good.
export const LEAD_WAIT_MS = 15000;

/** 'sent' only for a 2xx answer; 'failed' for any other status, a network failure or silence past `waitMs`. */
export async function sendLead(url, body, { fetchImpl = globalThis.fetch, waitMs = LEAD_WAIT_MS } = {}) {
  if (typeof fetchImpl !== 'function') return 'failed';
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), waitMs) : null;
  try {
    const res = await fetchImpl(url, { method: 'POST', headers: { Accept: 'application/json' }, body, credentials: 'omit', signal: ctl && ctl.signal });
    return res && res.ok ? 'sent' : 'failed';
  } catch (e) {
    return 'failed';
  } finally {
    if (timer) clearTimeout(timer);
  }
}
