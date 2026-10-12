import { useEffect, useRef, useState } from 'react';
import { readBest } from './boxItEngine.js';

// The phone's home screen, shown when the hero "app" is swiped closed.
export function StatusBar({ tone = 'light' }) {
  return (
    <div className={'hs-status ' + tone} aria-hidden="true">
      <span>9:41</span><span className="hp-bars"><i /><i /><i /><i /><b /></span>
    </div>
  );
}

const sv = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const GLYPH = {
  imei: <svg {...sv}><path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12" /></svg>,
  grades: <svg {...sv}><path d="M6 19 12 5l6 14M8.5 14h7" /></svg>,
  offers: <svg {...sv}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.4" /></svg>,
  labels: <svg {...sv}><path d="M7 8V3h10v5M5 8h14a2 2 0 0 1 2 2v6h-4v5H7v-5H3v-6a2 2 0 0 1 2-2Z" /><path d="M9 15h6M9 18h6" /></svg>,
  stock: <svg {...sv}><path d="M3 8h8v8H3zM13 8h8v8h-8zM8 2h8v6H8z" /></svg>,
  erase: <svg {...sv}><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" /></svg>,
  ship: <svg {...sv}><path d="M2 16 22 8l-4 10-6-3-3 4v-5" /></svg>,
  game: <svg {...sv}><path d="M3 9h18l-2 11H5L3 9Z" /><path d="M9 9V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" /><path d="m10 14 2 2 2-2" /></svg>,
  scan: <svg {...sv}><path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4M7 12h10" /></svg>,
  buyers: <svg {...sv}><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M9 10h6" /></svg>,
  board: <svg {...sv}><path d="M3 4h18v12H3zM8 20l4-4 4 4" /><path d="m7 9 2 2 3-4 2 3 3-2" /></svg>
};

// [key, label, tile colour, glyph colour, what happens when you tap it]
const APPS = [
  ['imei', 'IMEI', '#16130F', '#F6F2EA', '356798114520349 · clean, unlocked'],
  ['grades', 'Grades', '#EB5E12', '#16130F', 'A, B or C. No vibes involved.'],
  ['offers', 'Offers', '#1E7A4A', '#F6F2EA', 'Countered at $346. Above your floor.'],
  ['labels', 'Labels', '#F6F2EA', '#16130F', 'Printing… on the real station.'],
  ['stock', 'Stock', '#3A342D', '#F6F2EA', '312 units. All accounted for.'],
  ['erase', 'Erase', '#F6F2EA', '#C2470A', 'Wiped. Certificate attached.'],
  ['ship', 'Ship', '#16130F', '#EB5E12', 'SO-10422 is in the hold.'],
  ['game', 'Box it', '#EB5E12', '#16130F', null]
];
const DOCK = [
  ['scan', 'Scanner', '#F6F2EA', '#16130F', 'Point it at an IMEI. It knows.'],
  ['inphox', 'InPhox', null, null, null],
  ['buyers', 'Buyers', '#1E7A4A', '#F6F2EA', '3 new bids on Lot L-0418.'],
  ['board', 'Whiteboard', '#D9D0C2', '#6B6257', 'Retired. InPhox knows where it all is.']
];

export default function HomeScreen({ onOpenApp, onOpenGame, focusFirst }) {
  const [toast, setToast] = useState(null);
  const [wig, setWig] = useState(null);
  const [best] = useState(readBest);
  const timer = useRef(null), dockRef = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!focusFirst) return undefined;
    // wait a frame or two: the layer is visibility:hidden until the close starts
    const id = setTimeout(() => dockRef.current?.focus({ preventScroll: true }), 90);
    return () => clearTimeout(id);
  }, [focusFirst]);

  const tap = (key, msg, e) => {
    if (key === 'inphox') return onOpenApp(e);
    if (key === 'game') return onOpenGame(e);
    setWig(key); setToast({ msg, k: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setToast(null); setWig(null); }, 2000);
  };
  const icon = ([key, label, bg, fg, msg], dock) => (
    <button
      key={key} type="button" ref={key === 'inphox' ? dockRef : undefined}
      className={'hs-app' + (wig === key ? ' wig' : '') + (key === 'inphox' ? ' main' : '') + (key === 'game' ? ' game' : '')}
      onClick={e => tap(key, msg, e)}
      aria-label={key === 'inphox' ? 'Open InPhox' : key === 'game' ? 'Play Box it' : label}
    >
      <span className="hs-tile" style={bg ? { background: bg, color: fg } : undefined}>
        {key === 'inphox' ? <img src="assets/inphox-logo.png" alt="" /> : GLYPH[key]}
        {key === 'buyers' ? <i className="hs-badge">3</i> : null}
      </span>
      {dock ? null : <span className="hs-name">{label}</span>}
    </button>
  );

  return (
    <div className="hs">
      <StatusBar />
      <div className="hs-widget" aria-hidden="true">
        <div className="hs-wk"><span>Lot L-0418</span><span>Today</span></div>
        <div className="hs-wn">312<small> units</small></div>
        <div className="hs-wbar"><span /></div>
        <div className="hs-ws"><span>98% graded</span><span>0 on the whiteboard</span></div>
      </div>
      <div className="hs-grid">{APPS.map(a => icon(a, false))}</div>
      <button type="button" className="hs-card" onClick={e => onOpenGame(e)}>
        <span className="hs-ck">Box it · today's lot</span>
        <span className="hs-cb">{best ? `Your best: ${best} boxed` : 'Sort the lot before it lands'}</span>
        <span className="hs-cp">Play →</span>
      </button>
      <div className={'hs-toast' + (toast ? ' on' : '')} role="status" aria-live="polite">{toast ? toast.msg : ''}</div>
      <div className="hs-dots" aria-hidden="true"><i className="on" /><i /></div>
      <div className="hs-dock">{DOCK.map(a => icon(a, true))}</div>
    </div>
  );
}
