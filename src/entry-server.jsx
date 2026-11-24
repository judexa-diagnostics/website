// Build-time only: renders a page of the site to HTML so its words are in the file a crawler (or a browser with
// JavaScript off) receives. scripts/prerender.mjs calls render() once per route in src/routes.js.
import { renderToString } from 'react-dom/server';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';

export { ROUTES, SITE, SITE_NAME, canonicalFor } from './routes.js';
export { TEAM, personAlt, COMPANY_LEGAL_NAME, COMPANY_POSTAL_ADDRESS, COMPANY_PHONE } from './config.js';

export function render(page) {
  return renderToString(<LogicHost logic={SiteLogic} view={Layout} startMode="Scroll animation" initialPage={page} />);
}
