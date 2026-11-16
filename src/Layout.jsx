import './redesign/fx/fx.css';
import Header from './components/Header.jsx';
import SiteMenu from './components/SiteMenu.jsx';
import Home from './pages/Home.jsx';
import Industries from './pages/Industries.jsx';
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import Platform from './pages/Platform.jsx';
import Careers from './pages/Careers.jsx';
import Start from './pages/Start.jsx';
import Signin from './pages/Signin.jsx';
import SignupBusy from './pages/SignupBusy.jsx';
import Legal from './pages/Legal.jsx';
import Footer from './components/Footer.jsx';

export default function Layout({ v }) {
  const { is, menuOpen } = v;
  const page = Object.keys(is).find(k => is[k]) || 'home';
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a href="#main" className="fx-skip-link" style={{ position: "absolute", left: "-9999px", top: 0, zIndex: 1000, padding: "0.5rem 1rem", background: "var(--pmm-brand)", color: "white", borderRadius: "0 0 0.25rem 0" }} onFocus={(e)=>{e.target.style.left="0";}} onBlur={(e)=>{e.target.style.left="-9999px";}}>Skip to main content</a>
      <Header v={v} />
      {menuOpen ? <SiteMenu v={v} /> : null}
      <main id="main" key={page} className="fx-page" style={{ flex: "1" }}>
        {is.home ? <Home v={v} /> : null}
        {is.industries ? <Industries v={v} /> : null}
        {is.features ? <Features v={v} /> : null}
        {is.pricing ? <Pricing v={v} /> : null}
        {is.contact ? <Contact v={v} /> : null}
        {is.platform ? <Platform v={v} /> : null}
        {is.careers ? <Careers v={v} /> : null}
        {is.start ? <Start v={v} /> : null}
        {is.signin ? <Signin v={v} /> : null}
        {is['signup-busy'] ? <SignupBusy /> : null}
        {is.terms ? <Legal doc="terms" /> : null}
        {is.privacy ? <Legal doc="privacy" /> : null}
        {is.refunds ? <Legal doc="refunds" /> : null}
        {is.copyright ? <Legal doc="copyright" /> : null}
        {is['law-enforcement'] ? <Legal doc="law-enforcement" /> : null}
        {is.subprocessors ? <Legal doc="subprocessors" /> : null}
        {is.erasure ? <Legal doc="erasure" /> : null}
        {is.cookies ? <Legal doc="cookies" /> : null}
        {is.accessibility ? <Legal doc="accessibility" /> : null}
      </main>
      <Footer v={v} />
    </div>
  );
}
