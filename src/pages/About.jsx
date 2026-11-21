import { FxScope } from '../redesign/fx/index.jsx';
import ObfuscatedEmail from '../components/ObfuscatedEmail.jsx';
import { TEAM, COMPANY_LEGAL_NAME, COMPANY_POSTAL_ADDRESS, COMPANY_PHONE, FOUNDER_NAME, FOUNDER_TITLE, FOUNDER_EMAIL } from '../config.js';

const mono = "'JetBrains Mono',monospace";
const label = { fontFamily: mono, fontSize: '0.6875rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6B6257' };

const FACTS = [
  ['Company', COMPANY_LEGAL_NAME],
  ['What we do', 'Diagnostics, inventory, repair and sales software for businesses that buy, fix and resell used electronics'],
  ['Founders', TEAM.map(p => p.name).join(', ')],
  ['Office', [COMPANY_POSTAL_ADDRESS, COMPANY_PHONE].filter(Boolean).join(' · ')],
  ['Contact', null]
];

function HeroCluster() {
  return (
    <div
      data-fx=""
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '1rem',
        minHeight: '14rem'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '22rem',
          height: '11rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-1rem',
            background: 'radial-gradient(ellipse at center, rgba(235,94,18,0.14) 0%, rgba(247,244,239,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        {/* Christopher Luk - Center/Lead */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 4.25rem)',
            top: '0',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <img
            src={TEAM[0]?.image}
            alt={TEAM[0]?.name}
            style={{
              width: '8.5rem',
              height: '8.5rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #EB5E12',
              boxShadow: '0 8px 24px rgba(235,94,18,0.25)',
              background: '#FFFFFF'
            }}
          />
        </div>
        {/* Sri Vatsa Vuddanti - Left */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 9.5rem)',
            bottom: '0.25rem',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <img
            src={TEAM[1]?.image}
            alt={TEAM[1]?.name}
            style={{
              width: '6.75rem',
              height: '6.75rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #16130F',
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              background: '#FFFFFF'
            }}
          />
        </div>
        {/* Iniyan Kannappan - Right */}
        <div
          style={{
            position: 'absolute',
            right: 'calc(50% - 9.5rem)',
            bottom: '0.25rem',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <img
            src={TEAM[2]?.image}
            alt={TEAM[2]?.name}
            style={{
              width: '6.75rem',
              height: '6.75rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #C2470A',
              boxShadow: '0 6px 18px rgba(194,71,10,0.2)',
              background: '#FFFFFF'
            }}
          />
        </div>
      </div>
      <span
        style={{
          ...label,
          color: '#C2470A',
          marginTop: '1.25rem',
          letterSpacing: '.08em',
          textTransform: 'uppercase'
        }}
      >
        Founders & Leadership
      </span>
    </div>
  );
}

function Person({ p }) {
  return (
    <article
      data-fx=""
      data-fx-gap="100"
      style={{
        background: '#FFFFFF',
        border: '1px solid #D9D0C2',
        borderTop: '3px solid #EB5E12',
        borderRadius: '4px',
        padding: 'clamp(1.25rem,3vw,2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            style={{
              width: '4.75rem',
              height: '4.75rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #EB5E12',
              boxShadow: '0 4px 14px rgba(235,94,18,0.15)',
              flexShrink: 0
            }}
          />
        ) : (
          <div
            style={{
              width: '4.75rem',
              height: '4.75rem',
              borderRadius: '50%',
              background: '#FBF2E9',
              border: '2px solid #EB5E12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: mono,
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#C2470A',
              flexShrink: 0
            }}
          >
            {p.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
          <span style={{ ...label, color: '#C2470A' }}>{p.group}</span>
          <h3 style={{ margin: 0, fontSize: 'clamp(1.25rem,1.8vw,1.5rem)', lineHeight: 1.15, fontWeight: 600 }}>{p.name}</h3>
          <span style={{ fontSize: '0.9375rem', color: '#3A342D', fontWeight: 600 }}>{p.title}</span>
        </div>
      </div>
      {p.bio ? <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#3A342D', textWrap: 'pretty' }}>{p.bio}</p> : null}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9375rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
        {p.email ? <a href={`mailto:${p.email}`} style={{ color: '#16130F', textDecoration: 'underline', overflowWrap: 'anywhere' }}>{p.email}</a> : null}
        {p.linkedin ? <a href={p.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#16130F', textDecoration: 'underline' }}>LinkedIn</a> : null}
      </div>
    </article>
  );
}

export default function About({ v }) {
  const { ui } = v;
  return (
    <FxScope>
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) 2.5rem', borderBottom: '2px solid #16130F', display: 'grid', gridTemplateColumns: ui.c75, gap: 'clamp(2rem,5vw,4rem)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div data-fx="" style={{ ...label, textTransform: 'none', letterSpacing: '.02em' }}>About us</div>
          <h1 data-fx="" style={{ margin: 0, fontSize: 'clamp(2rem,3.4vw,3.125rem)', lineHeight: 1.04, fontWeight: 650, fontStretch: '104%', letterSpacing: '-.02em', textWrap: 'balance', maxWidth: '44rem' }}>We build the system that used electronics run on.</h1>
          <p data-fx="" style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.6, color: '#3A342D', maxWidth: '40rem', textWrap: 'pretty' }}>
            {COMPANY_LEGAL_NAME} makes inphox, one platform to diagnose, erase, grade, repair, store and sell used phones and devices. Every device is tracked by IMEI from the moment it is plugged in until it ships. We build it ourselves, in house, and we work closely with the shops that use it every day.
          </p>
        </div>
        <HeroCluster />
      </section>

      <section style={{ padding: 'clamp(2rem,5vw,3.5rem) clamp(1rem,3vw,2.5rem) 1rem', display: 'grid', gridTemplateColumns: ui.c57, gap: 'clamp(1.5rem,4vw,3rem)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minWidth: 0 }}>
          <h2 data-fx="" style={{ margin: 0, fontSize: 'clamp(1.5rem,2.3vw,2rem)', lineHeight: 1.1, fontWeight: 600 }}>Who we are</h2>
          <p data-fx="" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#3A342D', textWrap: 'pretty' }}>
            inphox LLC is a small software company based in San Jose, California, founded by {FOUNDER_NAME}. Refurbishers, repair shops and buy-and-sell shops told us the same thing: diagnostics in one tool, inventory in a spreadsheet, listings somewhere else. We built one record per device, so the test result, the erasure certificate, the repair and the sale all live together.
          </p>
        </div>
        <div style={{ borderTop: '1px solid #16130F', minWidth: 0 }}>
          {FACTS.map(([k, val]) => (
            <div key={k} data-fx="" data-fx-gap="60" style={{ display: 'grid', gridTemplateColumns: '7.5rem 1fr', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #D9D0C2', fontSize: '0.9375rem' }}>
              <span style={{ ...label, paddingTop: '2px' }}>{k}</span>
              {val === null ? <ObfuscatedEmail style={{ color: '#16130F' }} /> : <span>{val}</span>}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: 'clamp(2rem,5vw,3.5rem) clamp(1rem,3vw,2.5rem) clamp(3rem,6vw,5rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 data-fx="" style={{ margin: 0, fontSize: 'clamp(1.5rem,2.3vw,2rem)', lineHeight: 1.1, fontWeight: 600 }}>Founders and team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,20rem),1fr))', gap: 'clamp(1rem,3vw,2rem)' }}>
          {TEAM.map(p => <Person key={p.name} p={p} />)}
        </div>
        <p data-fx="" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#3A342D' }}>
          We are hiring. See <a href="#/careers" style={{ color: '#16130F', textDecoration: 'underline' }}>Careers</a> for open roles, or write to <a href={`mailto:${FOUNDER_EMAIL}`} style={{ color: '#16130F', textDecoration: 'underline' }}>{FOUNDER_EMAIL}</a>.
        </p>
      </section>
    </FxScope>
  );
}
