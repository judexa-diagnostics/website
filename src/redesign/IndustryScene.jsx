import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import './industryScene.css';

/* One looping scene per industry, drawn in a 400x300 SVG. Each scene is a pure
 * function of time t (seconds), so the loop, the on-screen pause and the
 * reduced-motion still frame all come from the same code. */

const INK = '#16130F';
const MUTED = '#6B6257';
const LINE = '#D9D0C2';
const CREAM = '#F6F2EA';
const WHITE = '#FFFFFF';
const OR = '#EB5E12';
const GR = '#1E7A4A';
const AM = '#B7791F';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const lerp = (a, b, p) => a + (b - a) * p;
const money = (n) => '$' + n.toLocaleString('en-US');

function Phone({ x, y, w = 16, h = 30, body = WHITE, screen = '#E9E2D4', stroke = INK, op = 1 }) {
  return (
    <g opacity={op}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w * 0.2} fill={body} stroke={stroke} strokeWidth="1.2" />
      <rect x={x - w / 2 + w * 0.12} y={y - h / 2 + h * 0.08} width={w * 0.76} height={h * 0.84} rx={w * 0.1} fill={screen} />
    </g>
  );
}
function Tick({ x, y, r = 6, c = GR, bad }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} />
      {bad ? <path d={`M${x} ${y - r * 0.5}V${y + r * 0.1}M${x} ${y + r * 0.5}v.1`} stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" />
        : <path d={`M${x - r * 0.45} ${y}l${r * 0.3} ${r * 0.35}l${r * 0.6} ${-r * 0.7}`} fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
}
function Card({ x, y, w, h, fill = WHITE, stroke = LINE, dash }) {
  return <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />;
}
function Chip({ x, y, w, label, fill, color = WHITE, op = 1 }) {
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height="15" rx="2" fill={fill} />
      <text x={x + w / 2} y={y + 10.5} textAnchor="middle" className="is-t" style={{ fill: color, fontWeight: 600 }}>{label}</text>
    </g>
  );
}

/* ---------------------------- 0 Refurbishers ---------------------------- */
const R_GRADES = ['A', 'B', 'A', 'C'];
const R_COL = { A: GR, B: AM, C: MUTED };
const R_BINY = { A: 70, B: 160, C: 250 };
const R_IDS = ['7F3A', '2C91', 'B05E', '4D18'];
function Refurb({ t }) {
  const info = R_GRADES.map((g, i) => {
    const p = clamp((t - i * 1.1) / 5.2);
    const started = t >= i * 1.1;
    let x, y;
    if (p < 0.72) { x = lerp(26, 280, p / 0.72); y = 160; } else { const q = ease((p - 0.72) / 0.28); x = lerp(280, 358, q); y = lerp(160, R_BINY[g], q); }
    return { g, i, p, started, x, y };
  });
  const tested = info.filter((o) => o.started && o.x >= 105).length;
  const erased = info.filter((o) => o.started && o.x >= 215);
  const graded = info.filter((o) => o.started && o.x >= 255).length;
  const binCount = (g) => info.filter((o) => o.g === g && o.p >= 1).length;
  return (
    <g>
      <text x="12" y="20" className="is-t">LOT 0417 · INBOUND TRAY · 4 UNITS</text>
      <Card x="8" y="130" width="40" w="38" h="60" />
      <text x="27" y="204" textAnchor="middle" className="is-t is-sm">TRAY</text>
      <rect x="14" y="173" width="270" height="4" fill={LINE} />
      {[['TEST', 95], ['ERASE', 175], ['GRADE', 255]].map(([n, cx]) => (
        <g key={n}>
          <rect x={cx - 30} y="88" width="60" height="32" rx="3" fill={INK} />
          <text x={cx} y="108" textAnchor="middle" className="is-t" style={{ fill: CREAM, fontWeight: 600, fontSize: 10 }}>{n}</text>
          <rect x={cx - 1} y="120" width="2" height="12" fill={INK} />
        </g>
      ))}
      <text x="95" y="196" textAnchor="middle" className="is-t">pass {tested}/4</text>
      <text x="175" y="196" textAnchor="middle" className="is-t">wiped {erased.length}/4</text>
      <text x="255" y="196" textAnchor="middle" className="is-t">graded {graded}/4</text>
      {erased.length > 0 && (
        <g>
          <rect x="125" y="212" width="100" height="18" rx="2" fill={WHITE} stroke={GR} />
          <Tick x={137} y={221} r={5} />
          <text x="147" y="224.5" className="is-t" style={{ fill: INK }}>{'CERT #' + R_IDS[erased.length - 1]}</text>
        </g>
      )}
      {['A', 'B', 'C'].map((g) => (
        <g key={g}>
          <Card x="332" y={R_BINY[g] - 32} w="56" h="64" />
          <text x="338" y={R_BINY[g] - 19} className="is-t" style={{ fill: R_COL[g], fontWeight: 700 }}>{'GRADE ' + g}</text>
          <text x="338" y={R_BINY[g] + 27} className="is-t is-sm">{binCount(g)} out</text>
        </g>
      ))}
      {info.map((o) => {
        const waiting = !o.started;
        const px = waiting ? 27 : o.x;
        const py = waiting ? 160 - 0 : o.y;
        const bx = waiting ? 3 * o.i : 0;
        const inBelt = o.p < 0.72;
        return (
          <g key={o.i}>
            <Phone x={px + (waiting ? 0 : 0)} y={py - (waiting ? bx : 0)} />
            {!waiting && inBelt && o.x >= 105 && o.x < 255 && <Tick x={o.x} y={134} r={5.5} />}
            {!waiting && o.x >= 150 && o.x < 215 && (
              <g>
                <rect x={o.x - 16} y={o.y + 22} width="32" height="4" fill={LINE} />
                <rect x={o.x - 16} y={o.y + 22} width={32 * clamp((o.x - 150) / 60)} height="4" fill={OR} />
              </g>
            )}
            {!waiting && o.x >= 255 && o.p < 0.98 && (
              <text x={o.x} y={o.y - 22} textAnchor="middle" className="is-b" style={{ fill: R_COL[o.g], fontSize: 13, fontWeight: 700 }}>{o.g}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ---------------------------- 1 Repair shops ---------------------------- */
const REPAIR_STEPS = ['Checked in', 'Fault found', 'Part fitted', 'Retest', 'Ready'];
function Repair({ t }) {
  const slide = ease(prog(t, 0.2, 1.2));
  const px = lerp(-50, 130, slide);
  const part = ease(prog(t, 2.4, 3.4));
  const fitted = t >= 3.4;
  const crack = t >= 1.4 && !fitted;
  const stepAt = [1.2, 1.4, 3.4, 4.0, 5.6];
  const done = stepAt.filter((s) => t >= s).length;
  const flag = t < 1.4 ? null : t < 3.4 ? ['CRACKED SCREEN', AM, 130] : t < 4.0 ? ['PART FITTED', INK, 100] : t < 5.2 ? ['RETESTING', INK, 90] : ['ALL TESTS PASS', GR, 112];
  const tests = ['TOUCH', 'DISPLAY', 'BATTERY'];
  const notice = ease(prog(t, 5.6, 6.2));
  return (
    <g>
      <text x="12" y="20" className="is-t">BENCH 02 · REPAIR TICKET</text>
      <rect x="10" y="222" width="212" height="6" rx="1" fill={LINE} />
      <Phone x={px} y={150} w={70} h={130} screen={fitted ? '#1d1a16' : '#E9E2D4'} />
      {crack && (
        <g stroke={INK} strokeWidth="1.2" fill="none" opacity="0.85" transform={`translate(${px - 130} 0)`}>
          <path d="M118 110 L132 138 L124 152 L142 176 M132 138 L152 142 M124 152 L110 160" />
          <path d="M132 138 L128 124" strokeWidth="0.8" />
        </g>
      )}
      {fitted && (
        <g>
          <path d={`M${px - 24} 98 L${px + 6} 98 L${px - 24} 140Z`} fill={WHITE} opacity="0.08" />
          {tests.map((n, i) => {
            const at = 4.0 + i * 0.4;
            return (
              <g key={n} opacity={t >= at ? 1 : 0.0}>
                <text x={px - 24} y={140 + i * 18} className="is-t" style={{ fill: CREAM, fontSize: 9 }}>{n}</text>
                <path d={`M${px + 14} ${137 + i * 18}l3 3.5l6 -7`} fill="none" stroke="#5FD39A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
      )}
      {t >= 2.4 && t < 3.4 && (
        <g opacity={clamp(1 - prog(t, 3.2, 3.4))}>
          <rect x={130 - 31} y={lerp(300, 150, part) - 56} width="62" height="112" rx="8" fill={WHITE} stroke={OR} strokeWidth="1.6" strokeDasharray="4 3" />
          <Chip x={130 - 42} y={lerp(300, 150, part) + 30} w={84} label="SN 4F9-2210" fill={INK} />
        </g>
      )}
      {flag && (
        <g>
          <rect x={130 - flag[2] / 2} y="56" width={flag[2]} height="18" rx="2" fill={flag[1]} />
          <text x="130" y="68" textAnchor="middle" className="is-t" style={{ fill: WHITE, fontWeight: 600 }}>{flag[0]}</text>
          <rect x="129" y="74" width="2" height="9" fill={flag[1]} />
        </g>
      )}
      <Card x="232" y="34" w="156" h="136" />
      <text x="242" y="52" className="is-b" style={{ fontSize: 10.5 }}>iPhone 13 · 128GB</text>
      <text x="242" y="65" className="is-t is-sm">TICKET #2041 · WALK-IN</text>
      {REPAIR_STEPS.map((s, i) => {
        const on = i < done;
        const warn = i === 1;
        return (
          <g key={s}>
            <circle cx="248" cy={85 + i * 17} r="4.5" fill={on ? (warn ? AM : GR) : WHITE} stroke={on ? 'none' : LINE} strokeWidth="1.2" />
            <text x="260" y={88 + i * 17} className="is-t" style={{ fill: on ? INK : MUTED, fontSize: 9.5 }}>{s}</text>
          </g>
        );
      })}
      <g opacity={notice} transform={`translate(0 ${(1 - notice) * 12})`}>
        <rect x="232" y="184" width="156" height="40" rx="3" fill={GR} />
        <text x="244" y="201" className="is-b" style={{ fill: WHITE }}>Ready for pickup</text>
        <text x="244" y="214" className="is-t" style={{ fill: '#CFE8DA' }}>SMS sent to customer</text>
      </g>
    </g>
  );
}

/* ---------------------------- 2 Wholesale ---------------------------- */
const MANIFEST = ['iPhone 13 128GB', 'iPhone 12 64GB', 'Galaxy S23 256GB', 'iPhone 14 128GB', 'Galaxy S22 128GB', 'iPhone 11 64GB'];
const MISMATCH = 3;
function Wholesale({ t }) {
  const doneAt = MANIFEST.map((_, i) => i * 0.8 + 0.5);
  const scanned = doneAt.filter((d) => t >= d).length;
  const ok = scanned - (t >= doneAt[MISMATCH] ? 1 : 0);
  const si = Math.min(MANIFEST.length - 1, Math.floor(t / 0.8));
  const sp = clamp((t - si * 0.8) / 0.8);
  const scanning = t < MANIFEST.length * 0.8;
  const stage = t < 5.2 ? 0 : t < 6.1 ? 1 : t < 6.9 ? 2 : t < 7.7 ? 3 : 4;
  const offers = [null, ['BUYER', 4100], ['YOU', 4350], ['BUYER', 4250], ['ACCEPTED', 4250]][stage];
  return (
    <g>
      <text x="12" y="20" className="is-t">INBOUND LOT 3318 · TRADE BUYER</text>
      <Card x="10" y="28" w="222" h="164" />
      <text x="20" y="44" className="is-t" style={{ fill: INK, fontWeight: 600 }}>MANIFEST</text>
      <text x="222" y="44" textAnchor="end" className="is-t">{ok}/6 ok{scanned > MISMATCH ? ' · 1 flag' : ''}</text>
      {MANIFEST.map((n, i) => {
        const y = 52 + i * 22;
        const on = t >= doneAt[i];
        const bad = i === MISMATCH;
        return (
          <g key={n}>
            <rect x="14" y={y} width="214" height="20" rx="2" fill={on && bad ? '#F6E7CB' : on ? '#E3EFE8' : 'transparent'} />
            <text x="22" y={y + 13.5} className="is-t" style={{ fill: INK, fontSize: 9.5 }}>{n}</text>
            {on ? (bad ? <Tick x={216} y={y + 10} r={6} c={AM} bad /> : <Tick x={216} y={y + 10} r={6} />)
              : <circle cx="216" cy={y + 10} r="5.5" fill="none" stroke={LINE} strokeWidth="1.2" />}
            {on && bad && <text x="196" y={y + 13.5} textAnchor="end" className="is-t" style={{ fill: AM, fontWeight: 600 }}>IMEI ≠</text>}
          </g>
        );
      })}
      <Card x="244" y="28" w="146" h="164" />
      <text x="254" y="44" className="is-t" style={{ fill: INK, fontWeight: 600 }}>DOCK SCAN</text>
      <rect x="254" y="109" width="126" height="2" fill={OR} opacity={scanning ? 1 : 0.25} />
      <rect x="254" y="109" width="126" height="22" fill={OR} opacity={scanning ? 0.08 : 0} />
      {scanning && <Phone x={317} y={lerp(58, 168, sp)} w={20} h={38} op={Math.min(1, sp * 8, (1 - sp) * 8)} />}
      <text x="317" y="184" textAnchor="middle" className="is-t is-sm">{scanning ? 'scanning ' + (si + 1) + '/6' : 'dock clear'}</text>
      <Card x="10" y="204" w="380" h="84" />
      <text x="20" y="220" className="is-t" style={{ fill: INK, fontWeight: 600 }}>OFFER · LOT 3318</text>
      {!offers && <text x="20" y="254" className="is-t">Waiting for buyer…</text>}
      {offers && (
        <g>
          <text x="20" y="256" className="is-big" style={{ fill: stage === 4 ? GR : INK }}>{money(offers[1])}</text>
          <text x="20" y="272" className="is-t is-sm">{stage === 4 ? 'FINAL' : offers[0] === 'YOU' ? 'YOUR COUNTER' : 'BUYER OFFER'}</text>
        </g>
      )}
      <g>
        {[4100, 4350, 4250].map((v, i) => {
          const shown = stage > i;
          return <text key={v} x={170 + i * 70} y="244" className="is-t" style={{ opacity: shown ? 1 : 0.0, fill: MUTED, textDecoration: shown && stage - 1 > i ? 'line-through' : 'none' }}>{money(v)}</text>;
        })}
        {stage >= 1 && <path d="M205 240h-0M242 240h0" />}
      </g>
      <Chip x={296} y={248} w={84} label="ACCEPTED" fill={GR} op={stage === 4 ? 1 : 0} />
      <Chip x={296} y={248} w={84} label="NEGOTIATING" fill={MUTED} op={stage >= 1 && stage < 4 ? 1 : 0} />
    </g>
  );
}

/* ---------------------------- 3 Retail ---------------------------- */
const STORES = [{ x: 55, n: 41 }, { x: 150, n: 27 }, { x: 250, n: 33 }, { x: 345, n: 12 }];
const HUBP = { x: 200, y: 92 };
function Retail({ t }) {
  const stock = [
    STORES[0].n + (t >= 1.6 ? 1 : 0) - (t >= 2.0 ? 1 : 0),
    STORES[1].n, STORES[2].n,
    STORES[3].n + (t >= 6.6 ? 1 : 0),
  ];
  const hub = 118 + (t >= 3.8 ? 1 : 0) - (t >= 4.8 ? 1 : 0);
  const out = prog(t, 2.0, 3.8);
  const back = prog(t, 4.8, 6.6);
  let box = null;
  if (t >= 2.0 && t < 3.8) box = [lerp(55, HUBP.x, ease(out)), lerp(199, HUBP.y, ease(out))];
  else if (t >= 4.8 && t < 6.6) box = [lerp(HUBP.x, 345, ease(back)), lerp(HUBP.y, 199, ease(back))];
  const flash = (a) => clamp(1 - (t - a) / 0.8);
  const pulse = t >= 3.8 && t < 4.8 ? (t - 3.8) : -1;
  return (
    <g>
      <text x="12" y="20" className="is-t">NETWORK · 4 STORES + HUB</text>
      {STORES.map((s, i) => (
        <path key={i} d={`M${HUBP.x} ${HUBP.y}L${s.x} 199`} stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      ))}
      <Card x="140" y="52" w="120" h="40" fill={INK} stroke={INK} />
      <text x="200" y="68" textAnchor="middle" className="is-t" style={{ fill: CREAM, fontWeight: 600 }}>HUB</text>
      <text x="200" y="82" textAnchor="middle" className="is-t" style={{ fill: pulse >= 0 ? '#F6B588' : '#BDB3A3', fontSize: 8.5 }}>{pulse >= 0 ? 'test · erase · grade' : 'stock ' + hub}</text>
      {pulse >= 0 && <rect x={140 - pulse * 10} y={52 - pulse * 10} width={120 + pulse * 20} height={40 + pulse * 20} rx="5" fill="none" stroke={OR} strokeWidth="1.2" opacity={1 - pulse} />}
      {STORES.map((s, i) => (
        <g key={i}>
          <Card x={s.x - 41} y="199" w="82" h="58" />
          <rect x={s.x - 41} y="199" width="82" height="16" rx="3" fill={i === 0 || i === 3 ? '#FBE3D2' : '#EDE7DC'} />
          <text x={s.x} y="210.5" textAnchor="middle" className="is-t" style={{ fill: INK, fontWeight: 600 }}>{'STORE 0' + (i + 1)}</text>
          <text x={s.x} y="238" textAnchor="middle" className="is-big" style={{ fontSize: 19, fill: (i === 0 && (flash(1.6) > 0 || flash(2.0) > 0)) || (i === 3 && flash(6.6) > 0) ? OR : INK }}>{stock[i]}</text>
          <text x={s.x} y="251" textAnchor="middle" className="is-t is-sm" style={{ fontSize: 7.5 }}>in stock</text>
        </g>
      ))}
      {t >= 0.6 && t < 2.0 && (
        <g opacity={Math.min(1, prog(t, 0.6, 0.9), 1 - prog(t, 1.7, 2.0))}>
          <Phone x={55} y={170} w={16} h={28} />
          <Chip x={14} y={140} w={58} label="TRADE-IN" fill={OR} />
          <rect x="54" y="155" width="2" height="0" />
        </g>
      )}
      {box && (
        <g>
          <rect x={box[0] - 11} y={box[1] - 22} width="22" height="18" rx="2" fill="#C98E4C" stroke={INK} strokeWidth="1" />
          <rect x={box[0] - 11} y={box[1] - 16} width="22" height="3" fill={INK} opacity="0.25" />
        </g>
      )}
      {t >= 6.6 && t < 7.8 && (
        <text x="345" y={192 - (t - 6.6) * 14} textAnchor="middle" className="is-t" style={{ fill: GR, fontWeight: 700, fontSize: 11, opacity: 1 - prog(t, 6.6, 7.8) }}>+1</text>
      )}
      <text x="12" y="285" className="is-t is-sm">{t < 2.0 ? 'Trade-in taken at Store 01' : t < 3.8 ? 'Box 0918 to hub' : t < 4.8 ? 'Hub tests and wipes it' : t < 6.6 ? 'Hub to Store 04, where it sells' : 'Counters updated everywhere'}</text>
    </g>
  );
}

/* ---------------------------- 4 Marketplace ---------------------------- */
function Market({ t }) {
  const listed = t >= 0.9;
  const sold = ease(prog(t, 2.4, 2.8));
  const label = ease(prog(t, 3.4, 4.4));
  const labelOut = 1 - prog(t, 4.8, 5.1);
  const parcelX = t < 5.0 ? 440 : lerp(330, 440, ease(prog(t, 5.6, 6.5)));
  const parcelOn = t >= 5.0 && t < 6.5;
  const ret = ease(prog(t, 6.3, 7.4));
  const retX = lerp(440, 190, ret);
  const arrived = t >= 7.4;
  return (
    <g>
      <text x="12" y="20" className="is-t">MARKETPLACE · LISTING + FULFILMENT</text>
      <Card x="12" y="30" w="150" h="164" stroke={listed ? LINE : AM} dash={listed ? undefined : '3 3'} />
      <Phone x={50} y={90} w={34} h={62} />
      <Chip x={20} y={158} w={44} label="GRADE A" fill={GR} />
      {listed && (
        <g>
          <text x="82" y="62" className="is-b" style={{ fontSize: 10 }}>iPhone 13</text>
          <text x="82" y="75" className="is-t is-sm">128GB</text>
          <text x="82" y="102" className="is-big" style={{ fontSize: 17 }}>$389</text>
          <Chip x={82} y={112} w={62} label="LISTED" fill={INK} op={sold > 0 ? 0 : 1} />
          <rect x="82" y="162" width="68" height="20" rx="2" fill={OR} />
          <text x="116" y="175.5" textAnchor="middle" className="is-t" style={{ fill: INK, fontWeight: 700 }}>BUY NOW</text>
        </g>
      )}
      {sold > 0 && (
        <g transform={`translate(87 130) rotate(-12) scale(${lerp(1.7, 1, sold)})`} opacity={sold}>
          <rect x="-34" y="-11" width="68" height="22" rx="2" fill="none" stroke={GR} strokeWidth="2.2" />
          <text x="0" y="5" textAnchor="middle" className="is-b" style={{ fill: GR, fontSize: 14, fontWeight: 800, letterSpacing: '.1em' }}>SOLD</text>
        </g>
      )}
      <rect x="186" y="58" width="82" height="34" rx="3" fill={INK} />
      <text x="227" y="73" textAnchor="middle" className="is-t" style={{ fill: CREAM, fontWeight: 600 }}>LABEL PRINTER</text>
      <rect x="196" y="84" width="62" height="3" fill="#3A342D" />
      {label > 0 && (
        <g opacity={labelOut}>
          <clipPath id="is-slot"><rect x="186" y="88" width="82" height="110" /></clipPath>
          <g clipPath="url(#is-slot)">
            <g transform={`translate(0 ${lerp(-70, 4, label)})`}>
              <rect x="190" y="90" width="74" height="82" rx="2" fill={WHITE} stroke={LINE} />
              <text x="197" y="103" className="is-t is-sm" style={{ fill: INK, fontWeight: 600 }}>CARRIER LABEL</text>
              {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={197 + i * 3.5} y="112" width={i % 3 === 0 ? 2 : 1} height="26" fill={INK} />)}
              <text x="197" y="152" className="is-t is-sm">TO: Buyer 4417</text>
              <text x="197" y="163" className="is-t is-sm">1.2 lb · Std</text>
            </g>
          </g>
        </g>
      )}
      {parcelOn && (
        <g opacity={t < 5.3 ? prog(t, 5.0, 5.3) : 1}>
          <rect x={parcelX - 26} y="130" width="52" height="40" rx="2" fill="#C98E4C" stroke={INK} />
          <rect x={parcelX - 26} y="144" width="52" height="4" fill={INK} opacity="0.2" />
          <rect x={parcelX - 18} y="152" width="22" height="13" fill={WHITE} stroke={INK} strokeWidth=".6" />
        </g>
      )}
      <text x="330" y="118" textAnchor="middle" className="is-t is-sm" style={{ opacity: parcelOn && t > 5.6 ? 1 : 0 }}>shipped</text>
      <Card x="12" y="218" w="150" h="60" stroke={arrived ? AM : LINE} />
      <text x="22" y="234" className="is-t" style={{ fill: INK, fontWeight: 600 }}>TESTING</text>
      <text x="22" y="250" className="is-t is-sm">{arrived ? 'RMA 118 · back in the queue' : 'nothing waiting'}</text>
      {arrived ? <Chip x={22} y={257} w={92} label="RETURN RECEIVED" fill={AM} /> : null}
      {ret > 0 && !arrived && (
        <g>
          <rect x={retX - 22} y="236" width="44" height="32" rx="2" fill="#C98E4C" stroke={INK} />
          <path d={`M${retX + 40} 252h-18`} stroke={AM} strokeWidth="1.6" />
        </g>
      )}
      {ret > 0 && (
        <g>
          <path d="M386 252H176" stroke={AM} strokeWidth="1.4" strokeDasharray="4 4" fill="none" opacity="0.5" />
          <path d="M176 252l7 -4v8z" fill={AM} opacity="0.7" />
          <text x="388" y="240" textAnchor="end" className="is-t is-sm" style={{ fill: AM, fontWeight: 600 }}>RETURN</text>
        </g>
      )}
    </g>
  );
}

const SCENES = [
  { C: Refurb, D: 9, still: 8.5, label: 'Phones move along a tray through test, erase and grading, then are routed to grade bins.' },
  { C: Repair, D: 8, still: 7, label: 'A phone is checked in, a cracked screen is flagged, a serialised part is fitted, the retest passes and the customer is told it is ready.' },
  { C: Wholesale, D: 9, still: 8.3, label: 'Units scan against a lot manifest, one mismatch is flagged, and an offer is countered and accepted.' },
  { C: Retail, D: 9, still: 8.2, label: 'A trade-in at one store travels via the hub to another store and stock counters update.' },
  { C: Market, D: 9, still: 8.2, label: 'A graded phone is listed, sold, shipped with a printed label, and a return comes back to testing.' },
];

export default function IndustryScene({ index = 0 }) {
  const sc = SCENES[index] || SCENES[0];
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [t, setT] = useState(sc.still);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !vis) {
      if (reduce) setT(sc.still);
      return undefined;
    }
    let raf = 0;
    let last = 0;
    const t0 = performance.now() - 300;
    const tick = (now) => {
      if (now - last > 33) {
        last = now;
        setT(((now - t0) / 1000) % sc.D);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, vis, sc]);

  const { C, D } = sc;
  const fade = reduce ? 1 : Math.min(1, t / 0.35, (D - t) / 0.4);
  return (
    <div ref={ref} className="is-wrap">
      <svg className="is-svg" viewBox="0 0 400 300" role="img" aria-label={sc.label} preserveAspectRatio="xMidYMid meet">
        <rect width="400" height="300" fill={CREAM} />
        <g opacity={fade}><C t={t} /></g>
      </svg>
    </div>
  );
}
