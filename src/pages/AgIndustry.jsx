import { useMemo } from 'react';
import { INDUSTRIES } from '../autograding/industries.js';
import { industryMeta } from '../autograding/industryMeta.js';
import IndustryIndex from '../autograding/IndustryIndex.jsx';
import { AG_DOCS, AG_PRICING, visitorRef } from '../chrome.js';
import { ctaHref } from '../autograding/industryLinks.js';
import '../autograding/industry.css';

// inphox Autograding for one industry (/autograding/buyback ...): one layout, each industry's own copy and its own
// worked example (src/autograding/industries.js). Its own chunk, like /autograding; the build prerender hands it in
// eagerly so crawlers get the whole page. data-no-tr: the Spanish copy is written, not machine-swapped.

const UI = {
  en: { home: 'Autograding', ex: 'Example', does: 'What it does', doesnt: 'What it does not do', faq: 'Questions', meta: ['Phones, tablets, laptops and smartwatches', 'Cosmetic grading from photos', 'Prepaid, no contract'],
    illus: 'Illustrative', docs: 'API docs', pricing: 'Pricing', grade: 'Grade', real: 'See a real graded device' },
  es: { home: 'Autograding', ex: 'Ejemplo', does: 'Qué hace', doesnt: 'Qué no hace', faq: 'Preguntas', meta: ['Teléfonos, tabletas, laptops y relojes', 'Evaluación estética con fotos', 'Prepago, sin contrato'],
    illus: 'Ilustrativo', docs: 'Documentación de la API', pricing: 'Precios', grade: 'Calificación', real: 'Ve un dispositivo calificado real' }
};

function Example({ kind, x, t, u }) {
  if (kind === 'compare') return (
    <div className="agi-cols">
      {x.cols.map(([label, value, sub], i) => (
        <div key={label} className={'agi-col' + (i === 1 ? ' is-on' : '')}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>
      ))}
    </div>
  );
  if (kind === 'batch') return (
    <div className="agi-scroll">
      <table className="agi-table">
        <thead><tr>{x.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{x.rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? 'agi-mono' : undefined}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  if (kind === 'steps' || kind === 'share') {
    const r = x.result || x.share;
    return (
      <>
        {kind === 'steps' ? <div className="agi-steps3">{t.flow.steps.map(([h, p], i) => <div key={h}><span className="agi-mono agi-n">{String(i + 1).padStart(2, '0')}</span><b>{h}</b><span>{p}</span></div>)}</div> : null}
        <div className="agi-result">
          <span className="agi-grade" aria-label={`${u.grade} ${r.grade}`}>{r.grade}</span>
          <div>
            <b style={{ fontSize: 20 }}>{r.score ? `${r.score} / 100` : r.standard}</b>
            <div className="agi-mono" style={{ fontSize: 12, color: 'var(--mut)', marginTop: 4 }}>{r.score ? r.standard : r.expires}</div>
            <div style={{ marginTop: 12 }}>
              {r.sides.map(s => (
                <div key={s[0]} className="agi-side">
                  <span>{s[0]}</span><span className="agi-grade" style={{ minWidth: 30, height: 30 }}>{s[1]}</span>
                  {s.length === 4 ? <><span className="agi-mono">{s[2]}</span><span>{s[3]}</span></> : <><span /><span>{s[2]}</span></>}
                </div>
              ))}
            </div>
            {r.action ? <p className="agi-mono" style={{ marginTop: 14, fontSize: 13, color: 'var(--ot)' }}>{r.action} &rarr;</p> : null}
          </div>
        </div>
      </>
    );
  }
  if (kind === 'api') return (
    <div className="agi-code">
      <div><small className="agi-mono">POST /v1/grades</small><pre><code>{x.request}</code></pre></div>
      <div><small className="agi-mono">GET /v1/grades/&#123;job_id&#125;</small><pre><code>{x.response}</code></pre></div>
    </div>
  );
  if (kind === 'viewas') return (
    <div className="agi-cols">
      {x.sides.map(([label, value, sub], i) => (
        <div key={label} className={'agi-col' + (i === 1 ? ' is-on' : '')}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>
      ))}
    </div>
  );
  if (kind === 'beforeafter') return (
    <div className="agi-scroll">
      <table className="agi-table">
        <tbody>{x.rows.map(([stage, grade, found]) => <tr key={stage}><th scope="row" style={{ border: 0, paddingLeft: 0 }}>{stage}</th><td><b>{grade}</b></td><td>{found}</td></tr>)}</tbody>
      </table>
    </div>
  );
  throw new Error('industry example: unknown kind ' + kind);
}

export default function AgIndustry({ v, page }) {
  const lang = v && v.langCode === 'ES' ? 'es' : 'en';
  const meta = industryMeta(page);
  const ind = INDUSTRIES[meta.slug], t = ind[lang], u = UI[lang];
  const ref = useMemo(visitorRef, []);
  const href = (cta, spot) => ctaHref(cta, lang, ref, `${meta.slug}-${spot}`);
  const home = lang === 'es' ? '/es/autograding' : '/autograding';
  const CTAs = ({ spot }) => (
    <div className="agi-ctas">
      <a className="agi-btn is-primary" href={href(t.cta.primary, spot)}>{t.cta.primary.label}</a>
      <a className="agi-btn is-ghost" href={href(t.cta.secondary, spot)}>{t.cta.secondary.label}</a>
    </div>
  );
  return (
    <div className="agi" lang={lang} data-no-tr="">
      <section className="agi-hero" aria-labelledby="agi-h1">
        <div className="agi-wrap">
          <nav className="agi-crumb agi-mono" aria-label="Breadcrumb"><a href={home}>inphox {u.home}</a> / <span>{meta[lang].nav}</span></nav>
          <span className="agi-k agi-mono">{t.kicker}</span>
          <h1 id="agi-h1">{t.h1[0]} <em>{t.h1[1]}</em></h1>
          <p className="agi-intro">{t.intro}</p>
          <CTAs spot="hero" />
          <div className="agi-meta agi-mono">{u.meta.map(m => <span key={m}>{m}</span>)}<a href={AG_DOCS} style={{ color: 'inherit' }}>{u.docs}</a><a href={AG_PRICING} style={{ color: 'inherit' }}>{u.pricing}</a></div>
        </div>
      </section>

      <section className="agi-flow" aria-labelledby="agi-flow-h">
        <div className="agi-wrap">
          <span className="agi-k agi-mono">{t.flow.k}</span>
          <h2 id="agi-flow-h">{t.flow.h}</h2>
          <ol className="agi-steps">
            {t.flow.steps.map(([h, p], i) => <li key={h}><span className="agi-n agi-mono">{String(i + 1).padStart(2, '0')}</span><b>{h}</b><span>{p}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="agi-sec">
        <div className="agi-wrap">
          {t.sections.map(s => (
            <div key={s.k} className="agi-row">
              <div><span className="agi-n agi-mono">{s.k}</span><h2 style={{ fontSize: 'clamp(24px,2.6vw,34px)' }}>{s.h}</h2></div>
              <div>
                <p>{s.p}</p>
                {s.list ? <ul className="agi-list">{s.list.map(l => <li key={l}>{l}</li>)}</ul> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="example" className="agi-ex" aria-labelledby="agi-ex-h">
        <div className="agi-wrap">
          <span className="agi-k agi-mono">{t.example.k}</span>
          <h2 id="agi-ex-h">{t.example.h}</h2>
          <div className="agi-card">
            <span className="agi-tag agi-mono" style={{ marginBottom: 16 }}>{u.illus}</span>
            <div style={{ marginTop: 16 }}><Example kind={ind.example} x={t.example} t={t} u={u} /></div>
          </div>
          <p className="agi-note">{t.example.note}</p>
          <p style={{ marginTop: 14 }}><a className="agi-btn is-ghost" href={href({ to: 'sample' }, 'example')}>{u.real} &rarr;</a></p>
        </div>
      </section>

      <section className="agi-sec" aria-labelledby="agi-fit-h">
        <div className="agi-wrap">
          <span className="agi-k agi-mono">{t.fit.k}</span>
          <h2 id="agi-fit-h">{t.fit.h}</h2>
          <div className="agi-fit">
            <div className="agi-yes"><h3>{u.does}</h3><ul>{t.fit.does.map(d => <li key={d}>{d}</li>)}</ul></div>
            <div className="agi-no"><h3>{u.doesnt}</h3><ul>{t.fit.doesnt.map(d => <li key={d}>{d}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section className="agi-sec agi-eval" aria-labelledby="agi-eval-h">
        <div className="agi-wrap">
          <span className="agi-k agi-mono">{t.evaluate.k}</span>
          <h2 id="agi-eval-h">{t.evaluate.h}</h2>
          <ol>{t.evaluate.steps.map(s => <li key={s}>{s}</li>)}</ol>
          <div className="agi-faq">
            <h3 className="agi-mono" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ot)', margin: '28px 0 6px' }}>{u.faq}</h3>
            {t.faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="agi-close" aria-labelledby="agi-close-h">
        <div className="agi-wrap">
          <h2 id="agi-close-h">{t.close.h}</h2>
          <p>{t.close.p}</p>
          <CTAs spot="close" />
        </div>
      </section>

      <IndustryIndex lang={lang} current={page} />
    </div>
  );
}
