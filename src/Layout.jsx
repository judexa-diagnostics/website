import Header from './components/Header.jsx';
import SiteMenu from './components/SiteMenu.jsx';
import Home from './pages/Home.jsx';
import Industries from './pages/Industries.jsx';
import Features from './pages/Features.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import Platform from './pages/Platform.jsx';
import Start from './pages/Start.jsx';
import Signin from './pages/Signin.jsx';
import Footer from './components/Footer.jsx';
import PromoBar from './components/PromoBar.jsx';

export default function Layout({ v }) {
  const { is, menuOpen, promo } = v;
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header v={v} />
      {menuOpen ? <SiteMenu v={v} /> : null}
      <main style={{ flex: "1" }}>
        {is.home ? <Home v={v} /> : null}
        {is.industries ? <Industries v={v} /> : null}
        {is.features ? <Features v={v} /> : null}
        {is.pricing ? <Pricing v={v} /> : null}
        {is.contact ? <Contact v={v} /> : null}
        {is.platform ? <Platform v={v} /> : null}
        {is.start ? <Start v={v} /> : null}
        {is.signin ? <Signin v={v} /> : null}
      </main>
      <Footer v={v} />
      {promo.show ? <PromoBar v={v} /> : null}
    </div>
  );
}
