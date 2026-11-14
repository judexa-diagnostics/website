import terms from '../legal/terms.txt?raw';
import privacy from '../legal/privacy.txt?raw';
import refunds from '../legal/refunds.txt?raw';
import copyright from '../legal/copyright.txt?raw';
import lawEnforcement from '../legal/law-enforcement.txt?raw';
import subprocessors from '../legal/subprocessors.txt?raw';
import erasure from '../legal/erasure.txt?raw';
import cookies from '../legal/cookies.txt?raw';
import accessibility from '../legal/accessibility.txt?raw';
import { parseLegal } from '../legalDoc.js';
import ObfuscatedEmail from '../components/ObfuscatedEmail.jsx';

const DOCS = {
  terms: parseLegal(terms),
  privacy: parseLegal(privacy),
  refunds: parseLegal(refunds),
  copyright: parseLegal(copyright),
  'law-enforcement': parseLegal(lawEnforcement),
  subprocessors: parseLegal(subprocessors),
  erasure: parseLegal(erasure),
  cookies: parseLegal(cookies),
  accessibility: parseLegal(accessibility),
};
const mono = "'JetBrains Mono',monospace";
// "7. Plans, payments and no refunds. ...": the numbered heading is bold so the sections can be scanned.
const HEAD = /^(\d+\. [^.]+\.)\s+/;
const para = p => { const m = p.match(HEAD); return m ? [<strong key="h" style={{ color: '#16130F' }}>{m[1]}</strong>, ' ' + p.slice(m[0].length)] : p; };

export default function Legal({ doc }) {
  const d = DOCS[doc] || DOCS.terms;
  const other = doc === 'privacy' ? ['#/terms', 'Terms of Service'] : ['#/privacy', 'Privacy Policy'];
  // A page whose Version line says Draft shows a plain banner (website#20 / odm#1333). Published pages carry a plain date.
  const isDraft = /\bDraft\b/i.test(d.version || '');
  return (
    <section style={{ maxWidth: '46rem', margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) 1rem', minWidth: 0 }}>
      {isDraft ? (
        <div role="note" style={{ margin: '0 0 1.25rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'var(--pmm-brand-soft, #FBEEE6)', color: '#6B3A12', fontSize: '0.875rem', lineHeight: 1.5 }}>
          This page is a draft and may change before it takes effect.
        </div>
      ) : null}
      <div style={{ fontFamily: mono, fontSize: '0.6875rem', color: '#6B6257' }}>{'Version ' + d.version}</div>
      <h1 style={{ margin: '0.5rem 0 1.5rem', fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05, fontWeight: 600 }}>{d.title}</h1>
      {d.paragraphs.map((p, i) => (
        <p key={i} style={{ margin: '0 0 1rem', fontSize: '1rem', lineHeight: 1.65, color: '#3A342D', overflowWrap: 'anywhere' }}>{para(p)}</p>
      ))}
      <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        <a href={other[0]} style={{ color: '#C2470A' }}>{other[1]}</a>{' · '}
        <ObfuscatedEmail style={{ color: '#C2470A' }} />
      </p>
    </section>
  );
}
