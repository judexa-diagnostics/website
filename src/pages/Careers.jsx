import { useState } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';

const MAIL = 'christopher@inphox.net';
const mono = "'JetBrains Mono',monospace";
const mailto = subject => `mailto:${MAIL}?subject=${encodeURIComponent(subject)}`;

const ROLES = [
  {
    k: '01', tag: 'Internship', title: 'Sales intern',
    lede: 'Help used-phone shops find out what InPhox can do for them, and learn how a software company sells from the inside.',
    doing: [
      'Talk with refurbishers, repair shops and wholesale buyers about how they work today',
      'Book and sit in on demos, then follow up',
      'Help new shops get set up and make sure their first week goes well',
      'Keep the pipeline tidy and tell us what customers keep asking for'
    ],
    you: [
      'Curious, organised and comfortable picking up the phone',
      'Clear, friendly writing',
      'Interest in phones, electronics or resale is a plus, not a requirement'
    ],
    note: 'Hours, start date and location are flexible. Tell us what works for you.',
    cta: 'Apply for the sales internship', subject: 'Sales intern application'
  },
  {
    k: '02', tag: 'Open application', title: "Don't see your role?",
    lede: "We're a small team building the system that used electronics run on. If you think you can help, we'd like to hear from you, whatever you do.",
    doing: [
      'Engineering, design, operations, support, sales, or something we haven’t thought of',
      'Tell us what you’d want to work on and why'
    ],
    you: [
      'Send your CV, or a link to work you’re proud of',
      'A few lines about yourself is plenty'
    ],
    note: 'Every message is read by a person.',
    cta: `Send your CV to ${MAIL}`, subject: 'Open application'
  }
];

// A small looping "inbox": CVs arrive and get a reply. Purely decorative.
function Inbox() {
  const reduce = useReducedMotion();
  const rows = [['Sales intern', 'cv_final_v2.pdf'], ['Open application', 'portfolio link'], ['Sales intern', 'cv.pdf'], ['Open application', 'cv_FINAL_final.pdf']];
  return (
    <div aria-hidden="true" style={{ background: '#16130F', color: '#F6F2EA', borderRadius: '4px', padding: '1rem', fontFamily: mono, fontSize: '0.75rem', overflow: 'hidden', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B9AE9E', paddingBottom: '0.625rem', borderBottom: '1px solid #3A342D' }}>
        <span>{MAIL}</span><span style={{ color: '#EB5E12' }}>inbox</span>
      </div>
      {rows.map(([r, f], i) => (
        <m.div key={i}
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={reduce ? undefined : { opacity: [0, 1, 1, 1, 0], x: [-16, 0, 0, 0, 0] }}
          transition={{ duration: 9, times: [0, 0.06, 0.5, 0.9, 1], delay: i * 1.4, repeat: Infinity, repeatDelay: 0 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #2A251F' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{ color: '#F6F2EA' }}>{r}</span><span style={{ color: '#8E857A' }}>{' · ' + f}</span></span>
          <m.span
            initial={reduce ? false : { color: '#8E857A' }}
            animate={reduce ? undefined : { color: ['#8E857A', '#8E857A', '#3FB27F', '#3FB27F'] }}
            transition={{ duration: 9, times: [0, 0.3, 0.34, 1], delay: i * 1.4, repeat: Infinity }}
          >{'read ✓'}</m.span>
        </m.div>
      ))}
    </div>
  );
}

function Role({ r }) {
  const [hover, setHover] = useState(false);
  const list = items => items.map((t, j) => (
    <div key={j} style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr', padding: '0.5rem 0', borderBottom: '1px solid #EDE7DC', fontSize: '0.9375rem', lineHeight: 1.5 }}>
      <span style={{ fontFamily: mono, fontSize: '0.75rem', color: '#B9AE9E', paddingTop: '2px' }}>{'0' + (j + 1)}</span><span>{t}</span>
    </div>
  ));
  return (
    <m.article
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: [0.2, 0.75, 0.2, 1] }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: '#FFFFFF', border: '1px solid ' + (hover ? '#16130F' : '#D9D0C2'), borderTop: '3px solid #EB5E12', borderRadius: '4px', padding: 'clamp(1.25rem,3vw,2rem)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'border-color .2s', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontFamily: mono, fontSize: '0.6875rem', color: '#6B6257' }}>
        <span style={{ color: '#C2470A' }}>{r.k + ' · ' + r.tag}</span><span>Open</span>
      </div>
      <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem,2.3vw,2rem)', lineHeight: 1.1, fontWeight: 600, fontStretch: '102%', textWrap: 'balance' }}>{r.title}</h2>
      <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#3A342D', textWrap: 'pretty' }}>{r.lede}</p>
      <div>
        <div style={{ fontFamily: mono, fontSize: '0.6875rem', color: '#6B6257', paddingBottom: '0.375rem', borderBottom: '1px solid #16130F' }}>{r.k === '01' ? "What you'll do" : 'Any field'}</div>
        {list(r.doing)}
      </div>
      <div>
        <div style={{ fontFamily: mono, fontSize: '0.6875rem', color: '#6B6257', paddingBottom: '0.375rem', borderBottom: '1px solid #16130F' }}>{r.k === '01' ? 'About you' : 'What to send'}</div>
        {list(r.you)}
      </div>
      <p style={{ margin: 0, fontFamily: mono, fontSize: '0.75rem', color: '#6B6257' }}>{r.note}</p>
      <a className="hv-2" href={mailto(r.subject)} style={{ marginTop: 'auto', minHeight: '3rem', padding: '0.5rem 1.125rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#EB5E12', color: '#16130F', borderRadius: '2px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', overflowWrap: 'anywhere' }}>{r.cta}</a>
    </m.article>
  );
}

export default function Careers({ v }) {
  const { ui } = v;
  return (
    <LazyMotion features={domAnimation}>
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1rem,3vw,2.5rem) 2.5rem', display: 'grid', gridTemplateColumns: ui.c57, gap: 'clamp(1.5rem,4vw,3rem)', alignItems: 'center', borderBottom: '2px solid #16130F' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem', minWidth: 0 }}>
          <div style={{ fontFamily: mono, fontSize: '0.6875rem', letterSpacing: '.02em', color: '#6B6257' }}>Careers · 2 openings</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem,3.4vw,3.125rem)', lineHeight: 1.04, fontWeight: 650, fontStretch: '104%', letterSpacing: '-.02em', textWrap: 'balance' }}>Help build the system used electronics run on.</h1>
          <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.6, color: '#3A342D', maxWidth: '36rem', textWrap: 'pretty' }}>
            We're small, we build everything in house, and we work closely with the shops that use InPhox every day. No forms and no portals: email us and a person will reply.
          </p>
        </div>
        <Inbox />
      </section>
      <section style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1rem,3vw,2.5rem) clamp(3rem,6vw,5rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,24rem),1fr))', gap: 'clamp(1rem,3vw,2rem)' }}>
        {ROLES.map(r => <Role key={r.k} r={r} />)}
      </section>
    </LazyMotion>
  );
}
