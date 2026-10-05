// Form input checks (2026-10-05), the same rules the server applies to a
// sign-up, so a visitor sees the problem before sending. The server checks
// again; this is only for a quicker answer.

// Markup characters plus every control, invisible-format (zero-width,
// right-to-left override), private-use, surrogate or unassigned code point.
const BANNED = /[<>`{}\\\p{C}]/u;
const WORD = /[\p{L}\p{N}]/u;
// Exactly what the server counts as whitespace (Python's str.split()); JS \s
// would also swallow U+FEFF, which the server refuses.
const SPACE = /[\t\n\v\f\r\x1c-\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/;
const EMAIL = /^(?!\.)(?!.*\.\.)[a-z0-9._%+'-]{1,64}(?<!\.)@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const HOST = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/** Trimmed, whitespace collapsed and Unicode-normalized, as the server stores it. */
export function tidy(value) {
  return String(value || '').normalize('NFKC').split(SPACE).filter(Boolean).join(' ');
}

/** An error message for a text field, or ''. required: empty is an error;
 *  empty: the message for that (default "Enter the <label>."). */
export function textProblem(value, label, required = true, empty = '') {
  const v = tidy(value);
  if (BANNED.test(v)) return `${label} has a character we can't use. Use letters, numbers and ordinary punctuation.`;
  if ((required || v) && !WORD.test(v)) return empty || `Enter the ${label.toLowerCase()}.`;
  return '';
}

export function isEmail(value) {
  return EMAIL.test(String(value || '').trim());
}

/** True if value (with or without http(s)://) is a real http(s) website. */
export function isWebsite(value) {
  let v = String(value || '').trim();
  if (/\s/.test(v)) return false;
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  let u;
  try { u = new URL(v); } catch { return false; }
  return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password && HOST.test(u.hostname);
}
