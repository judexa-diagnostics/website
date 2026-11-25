import './redesign/fx/fx.css';
import Header from './components/Header.jsx';
import SiteMenu from './components/SiteMenu.jsx';
import Home from './pages/Home.jsx';
import Industries from './pages/Industries.jsx';
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import Platform from './pages/Platform.jsx';
import About from './pages/About.jsx';
import Careers from './pages/Careers.jsx';
import Start from './pages/Start.jsx';
import Signin from './pages/Signin.jsx';
import SignupBusy from './pages/SignupBusy.jsx';
import Legal from './pages/Legal.jsx';
import Security from './pages/Security.jsx';
import NotFound from './pages/NotFound.jsx';
import Footer from './components/Footer.jsx';
import { Suspense, useLayoutEffect, useRef } from 'react';
import { translateLive } from './i18n/translate.js';
import * as agSlot from './pages/autogradingSlot.js';

export default function Layout({ v }) {
  const { is, menuOpen } = v;
  const page = Object.keys(is).find(k => is[k]) || 'home';
  const lc = v.chrome.lc;
  const root = useRef(null);
  // Spanish pages: translate before the first paint and keep translating as the page changes. Keyed by language, so
  // going back to English mounts a fresh, untranslated page.
  useLayoutEffect(() => (lc === 'es' && root.current ? translateLive(root.current) : undefined), [lc]);
  return (
    <div key={lc} ref={root} lang={lc} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a href="#main" className="fx-skip-link" style={{ position: "absolute", left: "-9999px", top: 0, zIndex: 1000, padding: "0.5rem 1rem", background: "var(--pmm-brand)", color: "white", borderRadius: "0 0 0.25rem 0" }} onFocus={(e)=>{e.target.style.left="0";}} onBlur={(e)=>{e.target.style.left="-9999px";}}>Skip to main content</a>
      <Header v={v} />
      {menuOpen ? <SiteMenu v={v} /> : null}
      <main id="main" key={page} className={"fx-page" + (v.chrome.swipe ? " " + v.chrome.swipe : "")} style={{ flex: "1" }}>
        {is.home ? <Home v={v} /> : null}
        {/* Its own chunk: the browser fetches Autograding only on /autograding (agSlot is a live binding, so the build
            prerender can hand in the page itself). */}
        {is.autograding ? <Suspense fallback={<div style={{ minHeight: "100vh" }} />}><agSlot.AutogradingPage v={v} /></Suspense> : null}
        {is.industries ? <Industries v={v} /> : null}
        {is.features ? <Features v={v} /> : null}
        {is.pricing ? <Pricing v={v} /> : null}
        {is.contact ? <Contact v={v} /> : null}
        {is.platform ? <Platform v={v} /> : null}
        {is.about ? <About v={v} /> : null}
        {is.careers ? <Careers v={v} /> : null}
        {is.start ? <Start v={v} /> : null}
        {is.signin ? <Signin v={v} /> : null}
        {is['signup-busy'] ? <SignupBusy /> : null}
        {is.terms ? <Legal doc="terms" lang={lc} /> : null}
        {is.privacy ? <Legal doc="privacy" lang={lc} /> : null}
        {is.refunds ? <Legal doc="refunds" lang={lc} /> : null}
        {is.copyright ? <Legal doc="copyright" lang={lc} /> : null}
        {is['law-enforcement'] ? <Legal doc="law-enforcement" lang={lc} /> : null}
        {is.subprocessors ? <Legal doc="subprocessors" lang={lc} /> : null}
        {is.erasure ? <Legal doc="erasure" lang={lc} /> : null}
        {is.cookies ? <Legal doc="cookies" lang={lc} /> : null}
        {is.accessibility ? <Legal doc="accessibility" lang={lc} /> : null}
        {is.security ? <Security /> : null}
        {is.notfound ? <NotFound /> : null}
      </main>
      <Footer v={v} />
    </div>
  );
}
