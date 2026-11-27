import { createRoot } from 'react-dom/client';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';
import { pageFromPath } from './routes.js';
import { setEagerAutograding } from './pages/autogradingSlot.js';
import { keepVisitorTags } from './chrome.js';
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

const mount = () => createRoot(document.getElementById('root')).render(
  <LogicHost logic={SiteLogic} view={Layout} {...settings} />
);
// Opened straight on /autograding: fetch its chunk first, so the prerendered page stays on screen until the live one
// is ready (no blank frame in between). Every other page mounts at once and never downloads Autograding.
if (pageFromPath(location.pathname) === 'autograding') {
  import('./pages/Autograding.jsx').then(m => setEagerAutograding(m.default), () => {}).then(mount);
} else mount();
