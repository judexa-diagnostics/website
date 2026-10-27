import { createRoot } from 'react-dom/client';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';
import './tokens.css';
import './index.css';
import './interactions.css';

// Design settings exposed by Claude Design (its "tweaks" panel).
const settings = {
  startMode: 'Scroll animation', // 'Scroll animation' | 'Slideshow'
};

createRoot(document.getElementById('root')).render(
  <LogicHost logic={SiteLogic} view={Layout} {...settings} />
);
