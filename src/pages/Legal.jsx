import terms from '../legal/terms.txt?raw';
import privacy from '../legal/privacy.txt?raw';
import { parseLegal } from '../legalDoc.js';

const DOCS = { terms: parseLegal(terms), privacy: parseLegal(privacy) };
const mono = "'JetBrains Mono',monospace";
// "7. Plans, payments and no refunds. ...": the numbered heading is bold so the sections can be scanned.
const HEAD = /^(\d+\. [^.]+\.)\s+/;
const para = p => { const m = p.match(HEAD); return m ? [<strong key="h" style={{ color: '#16130F' }}>{m[1]}</strong>, ' ' + p.slice(m[0].length)] : p; };

export default function Legal({ doc }) {
  const d = DOCS[doc] || DOCS.terms;
  const other = doc === 'privacy' ? ['#/terms', 'Terms of Service'] : ['#/privacy', 'Privacy Policy'];
  return (
    <section style={{ maxWidth: '46rem', margin: '0 auto', padding: 'clamp(2rem,6vw,4rem) 1rem', minWidth: 0 }}>
      <div style={{ fontFamily: mono, fontSize: '0.6875rem', color: '#6B6257' }}>{'Version ' + d.version}</div>
      <h1 style={{ margin: '0.5rem 0 1.5rem', fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05, fontWeight: 600 }}>{d.title}</h1>
      {d.paragraphs.map((p, i) => (
        <p key={i} style={{ margin: '0 0 1rem', fontSize: '1rem', lineHeight: 1.65, color: '#3A342D', overflowWrap: 'anywhere' }}>{para(p)}</p>
      ))}
      <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        <a href={other[0]} style={{ color: '#C2470A' }}>{other[1]}</a>{' · '}
        <a href="mailto:support@inphox.net" style={{ color: '#C2470A' }}>support@inphox.net</a>
      </p>
    </section>
  );
}
