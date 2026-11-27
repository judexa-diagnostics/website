// Build-time only: renders a page of the site to HTML so its words are in the file a crawler (or a browser with
// JavaScript off) receives. scripts/prerender.mjs calls render() once per route in src/routes.js.
import { renderToString } from 'react-dom/server';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';
import Autograding from './pages/Autograding.jsx';
import AgIndustry from './pages/AgIndustry.jsx';
import { setEagerAutograding, setEagerIndustry } from './pages/autogradingSlot.js';

// The prerender writes the whole Autograding page into /autograding.html (crawlers get the words, not a loader).
setEagerAutograding(Autograding);
setEagerIndustry(AgIndustry);

export { ROUTES, SITE, SITE_NAME, canonicalFor } from './routes.js';
export { industryMeta } from './autograding/industryMeta.js';
export { pricing } from './pricing.js';
export { translateHtml } from './i18n/translate.js';
export { TEAM, personAlt, COMPANY_LEGAL_NAME, COMPANY_POSTAL_ADDRESS, COMPANY_PHONE, COMPANY_LINKEDIN } from './config.js';

export function render(page, lang = 'en') {
  return renderToString(<LogicHost logic={SiteLogic} view={Layout} startMode="Scroll animation" initialPage={page} initialLang={lang} />);
}
