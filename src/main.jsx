import { createRoot } from 'react-dom/client';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';
import { pageFromPath } from './routes.js';
import { setEagerAutograding, setEagerIndustry } from './pages/autogradingSlot.js';
import { isIndustryPage } from './autograding/industryMeta.js';
import { keepVisitorTags } from './chrome.js';
import { linkClicked } from './analytics.js';
import './styles/fonts.css';
import './tokens.css';
import './index.css';
import './interactions.css';

// Design settings exposed by Claude Design (its "tweaks" panel).
const settings = {
  startMode: 'Scroll animation', // 'Scroll animation' | 'Slideshow'
};

// A visitor's own utm_* tags (an email, an ad), kept from whichever page they land on, go on with them to the app.
keepVisitorTags(location.search);
// Which button sent someone into the app or to Contact (first-party, anonymous: analytics.js). Capture phase, so it runs
// before the in-site router turns the click into a page change.
document.addEventListener('click', e => {
  const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (a) linkClicked(a, pageFromPath(location.pathname) || 'notfound');
}, true);

const mount = () => createRoot(document.getElementById('root')).render(
  <LogicHost logic={SiteLogic} view={Layout} {...settings} />
);
// Opened straight on /autograding: fetch its chunk first, so the prerendered page stays on screen until the live one
// is ready (no blank frame in between). Every other page mounts at once and never downloads Autograding.
const opened = pageFromPath(location.pathname);
if (opened === 'autograding') {
  import('./pages/Autograding.jsx').then(m => setEagerAutograding(m.default), () => {}).then(mount);
} else if (isIndustryPage(opened)) {
  import('./pages/AgIndustry.jsx').then(m => setEagerIndustry(m.default), () => {}).then(mount);
} else mount();
