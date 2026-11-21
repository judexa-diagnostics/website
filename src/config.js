// Deploy-time settings, read from Vite env vars at build time (see .env.example).
// Everything here has a safe default, so the site works with no env vars set.
// `import.meta.env` is undefined outside Vite (for example under `node --test`).

const env = import.meta.env || {};

const read = key => (typeof env[key] === 'string' ? env[key].trim() : '');

/** Every shop runs its own inphox app at <shop>.<this domain>. */
export const DEFAULT_SHOP_DOMAIN = 'inphox.net';

/** The central inphox app sign-ups go through. */
export const DEFAULT_PLATFORM_URL = 'https://platform.inphox.net';

/** phone-intake's billing service, without a trailing slash: the sign-up path until the platform is
 *  live. Used only when VITE_PLATFORM_URL is not set (.env.production sets it today). */
export const billingBaseUrl = read('VITE_BILLING_BASE_URL').replace(/\/+$/, '');

/** Base URL of the inphox platform, without a trailing slash, or '' while sign-ups go to phone-intake.
 *  VITE_PLATFORM_URL wins; else VITE_BILLING_BASE_URL (phone-intake); else the default platform.
 *  VITE_PLATFORM_URL=off keeps both forms client-side (a local preview that must not create sign-ups). */
const platformSetting = read('VITE_PLATFORM_URL');
export const platformUrl = platformSetting.toLowerCase() === 'off' || (!platformSetting && billingBaseUrl)
  ? '' : (platformSetting || DEFAULT_PLATFORM_URL).replace(/\/+$/, '');
const viaPhoneIntake = !platformUrl && platformSetting.toLowerCase() !== 'off' && billingBaseUrl;

/** The domain shops live under: Sign in sends people to https://<shop>.<shopDomain>/web/login. */
export const shopDomain = (read('VITE_SHOP_DOMAIN') || DEFAULT_SHOP_DOMAIN).replace(/^\.+|\.+$/g, '').toLowerCase();

/** The site's own "Sign in to your shop" page (each shop's address, then that shop's sign-in). */
export const SIGNIN_HREF = '#/signin';

/** Endpoint the Contact form posts to, or null (platform turned off): the form stays client-side only. */
export const leadAction = platformUrl ? `${platformUrl}/inphox/lead` : viaPhoneIntake ? `${billingBaseUrl}/billing/lead` : null;

/** Sign-up on the hub is open to the public. Until it is (VITE_SIGNUP_OPEN=1, or flip the default), every plan button goes
 *  to Contact: the hub is still behind a password, and a browser password box is a dead end for a visitor. */
export const signupOpen = ['1', 'on', 'true', 'yes'].includes(read('VITE_SIGNUP_OPEN').toLowerCase());

/** The inphox hub, where every plan button sends people to sign up (home.inphox.net/signup?plan=<code>). */
export const hubUrl = (read('VITE_HUB_URL') || 'https://home.inphox.net').replace(/\/+$/, '');

/** Where every Sign in link goes. Once the hub is public (signupOpen), people sign in at the inphox hub
 *  (home.inphox.net/login), which then opens their shop; until then, the site's own "Sign in to your shop" page. */
export const LOGIN_HREF = signupOpen ? `${hubUrl}/login` : SIGNIN_HREF;

/** The company's postal address and phone, shown in the footer (CAN-SPAM, DMCA agent, law-enforcement post).
 *  Empty until the real ones are set: an empty value shows nothing, never a placeholder. */
export const COMPANY_POSTAL_ADDRESS = '375 S 9th Street, Joe West Hall, San Jose, CA 95112';
export const COMPANY_PHONE = '916-582-9140';
export const FOUNDER_NAME = 'Christopher Luk';
export const FOUNDER_TITLE = 'Founder & CEO';
export const FOUNDER_EMAIL = 'christopher@inphox.net';
export const FOUNDER_LINKEDIN = 'https://www.linkedin.com/in/christopher-luk-22312331b/';

/** Company facts shown on the About Us page. */
export const COMPANY_LEGAL_NAME = 'inphox LLC';

/** The people shown on the About Us page (founders, leadership, key staff), in this order.
 *  Add a person here and they appear on #/about. `linkedin` and `bio` are optional: empty shows nothing. */
export const TEAM = [
  {
    name: FOUNDER_NAME,
    title: FOUNDER_TITLE,
    group: 'Founder',
    email: FOUNDER_EMAIL,
    linkedin: FOUNDER_LINKEDIN,
    image: '/assets/team/christopher-luk.jpg',
    bio: 'Founded inphox LLC and leads the company. inphox is built in house, end to end, for shops that buy, fix and resell used electronics.'
  },
  {
    name: 'Sri Vatsa Vuddanti',
    title: 'Co-founder',
    group: 'Co-founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/srivatsavudd',
    image: '/assets/team/sri-vatsa-vuddanti.jpg',
    bio: 'Computer science student at San José State University. Works on LLM agents and evals, and on controls for the Spartan Racing Formula SAE team.'
  },
  {
    name: 'Iniyan Kannappan',
    title: 'Co-founder',
    group: 'Co-founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/iniyan-kannappan-492b16315/',
    image: '/assets/team/iniyan-kannappan.jpg',
    bio: 'Computer science and linguistics student at San José State University. Builds software across AI, embedded systems and backend, including for the Spartan Racing Formula SAE Electric team.'
  }
];
