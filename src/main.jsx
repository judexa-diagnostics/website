import { createRoot } from 'react-dom/client';
import { LogicHost } from './lib/dcLogic.jsx';
import SiteLogic from './SiteLogic.js';
import Layout from './Layout.jsx';
import './index.css';
import './interactions.css';

// Design settings exposed by Claude Design (its "tweaks" panel).
const settings = {
  startMode: 'Scroll animation', // 'Scroll animation' | 'Slideshow'
  showPromo: true,
};

createRoot(document.getElementById('root')).render(
  <LogicHost logic={SiteLogic} view={Layout} {...settings} />
);
