// Deploy-time settings, read from Vite env vars at build time (see .env.example).
// Everything here has a safe default, so the site works with no env vars set.
// `import.meta.env` is undefined outside Vite (for example under `node --test`).

const env = import.meta.env || {};

const read = key => (typeof env[key] === 'string' ? env[key].trim() : '');

/** Every shop runs its own InPhox app at <shop>.<this domain>. */
export const DEFAULT_SHOP_DOMAIN = 'inphox.net';

/** The central InPhox app sign-ups go through. */
export const DEFAULT_PLATFORM_URL = 'https://platform.inphox.net';

/** phone-intake's billing service, without a trailing slash: the sign-up path until the platform is
 *  live. Used only when VITE_PLATFORM_URL is not set (.env.production sets it today). */
export const billingBaseUrl = read('VITE_BILLING_BASE_URL').replace(/\/+$/, '');

/** Base URL of the InPhox platform, without a trailing slash, or '' while sign-ups go to phone-intake.
 *  VITE_PLATFORM_URL wins; else VITE_BILLING_BASE_URL (phone-intake); else the default platform.
 *  VITE_PLATFORM_URL=off keeps both forms client-side (a local preview that must not create sign-ups). */
const platformSetting = read('VITE_PLATFORM_URL');
export const platformUrl = platformSetting.toLowerCase() === 'off' || (!platformSetting && billingBaseUrl)
  ? '' : (platformSetting || DEFAULT_PLATFORM_URL).replace(/\/+$/, '');
const viaPhoneIntake = !platformUrl && platformSetting.toLowerCase() !== 'off' && billingBaseUrl;

/** The domain shops live under: Sign in sends people to https://<shop>.<shopDomain>/web/login. */
export const shopDomain = (read('VITE_SHOP_DOMAIN') || DEFAULT_SHOP_DOMAIN).replace(/^\.+|\.+$/g, '').toLowerCase();

/** Every Sign in link and button opens the site's own "Sign in to your shop" page. */
export const SIGNIN_HREF = '#/signin';

/** Where the Start page sends a new sign-up (no payment): the platform emails a confirmation link,
 *  then the shop is created and the owner pays inside the app. Null: the Start page stays client-side. */
export const signupAction = platformUrl ? `${platformUrl}/inphox/signup` : viaPhoneIntake ? `${billingBaseUrl}/billing/signup` : null;

/** Endpoint the Contact form posts to, or null (platform turned off): the form stays client-side only. */
export const leadAction = platformUrl ? `${platformUrl}/inphox/lead` : viaPhoneIntake ? `${billingBaseUrl}/billing/lead` : null;
