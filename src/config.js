// Deploy-time settings, read from Vite env vars at build time (see .env.example).
// Everything here has a safe default, so the site works with no env vars set.
// `import.meta.env` is undefined outside Vite (for example under `node --test`).

const env = import.meta.env || {};

const read = key => (typeof env[key] === 'string' ? env[key].trim() : '');

export const DEFAULT_APP_LOGIN_URL = 'https://intake.inphox.net/auth/login';

/** Base URL of the InPhox billing service, without a trailing slash. Empty when billing is not live. */
export const billingBaseUrl = read('VITE_BILLING_BASE_URL').replace(/\/+$/, '');

/** Where every Sign in link and button goes. */
export const appLoginUrl = read('VITE_APP_LOGIN_URL') || DEFAULT_APP_LOGIN_URL;

/** Where the Start page sends a new sign-up (no payment): phone-intake emails a confirmation link,
 *  then the shop is created and the owner pays inside the app. Null: the Start page stays client-side. */
export const signupAction = billingBaseUrl ? `${billingBaseUrl}/billing/signup` : null;

/** Endpoint the Contact form posts to, or null: with no billing service the form stays client-side only. */
export const leadAction = billingBaseUrl ? `${billingBaseUrl}/billing/lead` : null;
