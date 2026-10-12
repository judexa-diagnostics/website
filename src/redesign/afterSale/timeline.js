// Deterministic choreography: everything in the scene is a pure function of
// the loop time t, so the loop is seamless and any moment can be jumped to.

export const LOOP = 50;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (x) => x * x * (3 - 2 * x);
export const ease = (t, a, b) => smooth(prog(t, a, b));
// rises over [a, a+r], holds, falls over [b-r, b]
export const window_ = (t, a, b, r = 0.35) => Math.min(ease(t, a, a + r), 1 - ease(t, b - r, b));
export const lerp = (a, b, k) => a + (b - a) * k;
export function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

// Positions on the counter (metres)
export const SLOT = (i) => [-0.2 + i * 0.2, -0.1];
export const SLOT2 = (i) => [-0.24 + i * 0.17, 0.13];
export const TOTE_POS = [-0.48, 0.1];
export const CASH_POS = [0.12, -0.15];

export const OPERATOR = {
  start: { x: 4.5, z: -0.3, yaw: -Math.PI / 2 },
  moves: [
    { t0: 0.0, t1: 3.7, pts: [[4.5, -0.3], [3.4, -0.3], [2.25, -0.25], [1.75, 0.5], [1.0, 0.85], [-0.1, 0.72]] },
    { t0: 4.7, t1: 6.0, pts: [[-0.1, 0.72], [0.25, 0.68], [0.6, 0.62]] },
    { t0: 36.4, t1: 37.6, pts: [[0.6, 0.62], [0.3, 0.68], [0.0, 0.68]] },
    { t0: 40.6, t1: 41.4, pts: [[0.0, 0.68], [0.0, 1.02]], back: true },
    { t0: 41.6, t1: 46.3, pts: [[0.0, 1.02], [0.7, 1.12], [1.5, 0.85], [2.0, 0.05], [2.4, -0.28], [3.4, -0.3], [4.5, -0.3]] },
  ],
  faces: [[3.7, Math.PI], [6.0, Math.PI], [37.6, Math.PI], [46.3, -Math.PI / 2]],
};

export const CUSTOMER = {
  start: { x: -4.7, z: -4.6, yaw: Math.PI / 2 },
  moves: [
    { t0: 1.4, t1: 7.0, pts: [[-4.7, -4.6], [-2.3, -4.5], [-1.25, -4.0], [-1.12, -3.1], [-0.6, -1.75], [0.0, -0.66]] },
    { t0: 33.2, t1: 38.6, pts: [[0.0, -0.66], [-0.45, -1.5], [-1.08, -3.0], [-1.2, -4.0], [-0.4, -4.55], [1.4, -4.7]] },
  ],
  faces: [[7.0, 0.08], [33.0, 0.08], [38.6, Math.PI / 2]],
};

// Trapezoidal speed profile along a move (accelerate, cruise, decelerate)
function trap(s, a) {
  const v = 1 / (1 - a);
  if (s < a) return (v * s * s) / (2 * a);
  if (s < 1 - a) return v * (s - a / 2);
  return 1 - (v * (1 - s) * (1 - s)) / (2 * a);
}

function polyline(pts) {
  // Rounded polyline: quadratic fillets at the inner points, sampled densely.
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], [cx, cz] = pts[i + 1];
    const l1 = Math.hypot(bx - ax, bz - az), l2 = Math.hypot(cx - bx, cz - bz);
    const r = Math.min(0.45, l1 * 0.45, l2 * 0.45);
    const p = [bx + ((ax - bx) / l1) * r, bz + ((az - bz) / l1) * r];
    const q = [bx + ((cx - bx) / l2) * r, bz + ((cz - bz) / l2) * r];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      out.push([(1 - u) * (1 - u) * p[0] + 2 * (1 - u) * u * bx + u * u * q[0], (1 - u) * (1 - u) * p[1] + 2 * (1 - u) * u * bz + u * u * q[1]]);
    }
  }
  out.push(pts[pts.length - 1]);
  const cum = [0];
  for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  const len = cum[cum.length - 1];
  return {
    len,
    at(d) {
      d = clamp(d, 0, len);
      let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
      const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      return [lerp(out[i - 1][0], out[i][0], k), lerp(out[i - 1][1], out[i][1], k)];
    },
  };
}

// Precompute position / heading / gait phase at 60 Hz over the loop.
export function buildTrack(spec, stride) {
  const HZ = 60, N = Math.round(LOOP * HZ);
  const moves = spec.moves.map((m) => ({ ...m, path: polyline(m.pts) }));
  const posAt = (t) => {
    let p = [spec.start.x, spec.start.z], back = false;
    for (const m of moves) {
      if (t >= m.t1) { p = m.pts[m.pts.length - 1]; continue; }
      if (t >= m.t0) {
        const dur = m.t1 - m.t0, a = Math.min(0.3, 0.55 / dur);
        p = m.path.at(trap((t - m.t0) / dur, a) * m.path.len); back = !!m.back; break;
      }
      break;
    }
    return [p[0], p[1], back];
  };
  const faceAt = (t) => {
    let y = spec.start.yaw;
    for (const [ft, fy] of spec.faces) if (t >= ft) y = fy;
    return y;
  };
  const X = new Float32Array(N + 1), Z = new Float32Array(N + 1), Y = new Float32Array(N + 1), P = new Float64Array(N + 1), S = new Float32Array(N + 1), T = new Float32Array(N + 1);
  let yaw = spec.start.yaw, phase = 0;
  const dt = 1 / HZ;
  // two passes so the loop's end state feeds its start (seamless)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i <= N; i++) {
      const t = i * dt;
      const [x, z, back] = posAt(t);
      const [x2, z2] = posAt(Math.min(LOOP, t + dt));
      const vx = (x2 - x) / dt, vz = (z2 - z) / dt, sp = Math.hypot(vx, vz);
      let want = faceAt(t);
      if (sp > 0.08) want = Math.atan2(vx, vz) + (back ? Math.PI : 0);
      const d = angDiff(yaw, want);
      const rate = clamp(d * 5.5, -3.2, 3.2);
      const dy = rate * dt;
      yaw += dy;
      const fwd = vx * Math.sin(yaw) + vz * Math.cos(yaw);
      phase += fwd * dt + Math.abs(dy) * 0.16;
      X[i] = x; Z[i] = z; Y[i] = yaw; P[i] = phase; S[i] = sp; T[i] = Math.abs(rate);
    }
  }
  return {
    sample(t) {
      const f = clamp(t, 0, LOOP) * HZ, i = Math.min(N - 1, Math.floor(f)), k = f - i;
      return {
        x: lerp(X[i], X[i + 1], k), z: lerp(Z[i], Z[i + 1], k),
        yaw: Y[i] + angDiff(Y[i], Y[i + 1]) * k,
        phase: lerp(P[i], P[i + 1], k) / stride,
        speed: lerp(S[i], S[i + 1], k), turn: lerp(T[i], T[i + 1], k),
      };
    },
  };
}

// Speech bubbles and corner chips
export const BUBBLES = [
  { who: 'c', t0: 15.6, t1: 17.9, text: '$520 for all three?' },
  { who: 'o', t0: 18.0, t1: 20.3, text: 'Best I can do is $460.' },
  { who: 'c', t0: 20.5, t1: 22.7, text: 'Meet me at $490?' },
  { who: 'o', t0: 22.9, t1: 25.2, text: 'Deal. $490.' },
  { who: 'c', t0: 32.2, t1: 33.8, text: 'Thanks!' },
];
export const CHIPS = [
  { t0: 8.6, t1: 15.4, dot: '#EB5E12', text: 'Intake · 3 devices' },
  { t0: 15.4, t1: 23.0, dot: '#1E7A4A', text: 'Checks clean · A · B · A' },
  { t0: 23.0, t1: 29.4, dot: '#EB5E12', text: 'Offer accepted · $490' },
  { t0: 29.4, t1: 36.4, dot: '#1E7A4A', text: 'Paid · cash $490' },
  { t0: 40.0, t1: 47.5, dot: '#16130F', text: 'Routed to testing · 3 devices' },
];

// POS screen state
export function screenState(t) {
  const scans = [11.4, 13.0, 14.6];
  const n = scans.filter((s) => t >= s).length;
  const scanning = t >= 9.8 && t < 14.6 ? Math.min(2, Math.floor((t - 9.8) / 1.6)) : -1;
  if (t < 8.6 || t >= 46.5) return { n: 0 };
  if (t >= 36.0) return { done: true };
  const offer = t >= 15.6;
  return {
    n, scanning: n < 3 ? scanning : -1, offer,
    ask: t >= 15.8 ? (t >= 18.2 ? 'struck' : 'on') : null,
    offerShown: t >= 18.2 ? (t >= 20.7 ? 'struck' : 'on') : null,
    counter: t >= 20.7 ? 'on' : null,
    accepted: t >= 23.0,
    paid: t >= 29.4,
  };
}
