// "Box it": phones come off the line graded A, B or C and fall toward three
// bins. Drag or flick each one into the bin of its grade before it lands.
// Three wrong boxes and the lot is closed. Canvas only, no sound, no deps.

const INK = '#16130F', CREAM = '#F6F2EA', ORANGE = '#EB5E12';
export const GRADES = [
  { g: 'A', col: '#2E9E62', name: 'Grade A' },
  { g: 'B', col: '#D99A1E', name: 'Grade B' },
  { g: 'C', col: '#E2552A', name: 'Grade C' }
];
const BEST_KEY = 'inphox.boxit.best';
export const readBest = () => { try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch { return 0; } };
const writeBest = v => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* private mode */ } };

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
const ease = t => 1 - Math.pow(1 - t, 3);

export function createBoxIt(canvas, { onPhase, top = 46, bottom = 26 } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 300, H = 600, dpr = 1;
  let phase = 'ready', score = 0, best = readBest(), lives = 3, streak = 0, t = 0, spawnIn = 0.4, shake = 0, flash = 0, flashCol = ORANGE;
  let phones = [], pops = [], bits = [], held = null, lastGrade = -1, newBest = false, nextId = 1;
  const binPulse = [0, 0, 0];

  const geo = () => {
    const floor = H - bottom, binH = Math.max(54, H * 0.15), binTop = floor - binH;
    const pw = Math.min(54, W * 0.17), ph = pw * 1.85;
    return { floor, binH, binTop, pw, ph };
  };
  // difficulty: falls faster and spawns sooner as the score climbs
  const level = () => Math.min(1, score / 40 + t / 240);
  const fallSpeed = () => H * (0.13 + 0.3 * level());
  const spawnGap = () => 1.55 - 0.95 * level();

  const resize = (w, h, ratio) => {
    if (!(w > 40 && h > 80)) return;   // detached / not laid out yet: keep the last size
    W = w; H = h; dpr = Math.min(2, ratio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);   // CSS sizes it to the field
  };

  const spawn = () => {
    const { pw, ph } = geo();
    let gi = Math.floor(Math.random() * 3);
    if (gi === lastGrade && Math.random() < 0.5) gi = (gi + 1 + Math.floor(Math.random() * 2)) % 3;
    lastGrade = gi;
    // mostly start over a wrong bin, so there is always something to do
    const bin = Math.random() < 0.75 ? (gi + 1 + Math.floor(Math.random() * 2)) % 3 : gi;
    const third = W / 3, m = pw / 2 + 6;
    const x = Math.max(m, Math.min(W - m, third * bin + third * (0.25 + Math.random() * 0.5)));
    phones.push({ id: nextId++, gi, x, y: top - ph * 0.6, vx: 0, vy: fallSpeed() * 0.6, a: (Math.random() - 0.5) * 0.3, va: 0, out: 0, seed: Math.random() * 1000 });
  };

  const start = () => {
    phase = 'play'; score = 0; lives = 3; streak = 0; t = 0; spawnIn = 0.5; phones = []; pops = []; bits = []; held = null; newBest = false;
    onPhase && onPhase(phase, { score, best });
  };

  const burst = (x, y, col, n = 14) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160;
      bits.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: 0.6 + Math.random() * 0.4, t: 0, col, r: 1.5 + Math.random() * 2.5 });
    }
  };

  const resolve = (p, bin) => {
    const ok = bin === p.gi;
    p.out = 0.0001; p.bin = bin; p.ok = ok;
    if (held && held.p === p) held = null;
    const { binTop } = geo();
    binPulse[bin] = 1;
    if (ok) {
      score++; streak++;
      const bonus = streak > 0 && streak % 10 === 0;
      const gained = bonus && lives < 3;
      if (gained) lives++;
      pops.push({ x: p.x, y: binTop - 8, text: gained ? '+1 life' : bonus ? `${streak} in a row` : '+1', col: GRADES[bin].col, t: 0 });
      burst(p.x, binTop, GRADES[bin].col, bonus ? 26 : 12);
      if (score > best) { best = score; newBest = true; }
    } else {
      lives--; streak = 0; shake = 0.35; flash = 1; flashCol = '#E2552A';
      pops.push({ x: p.x, y: binTop - 8, text: `That's a ${GRADES[p.gi].g}`, col: '#FF8A5C', t: 0 });
      if (lives <= 0) {
        phase = 'over'; held = null;
        if (newBest) writeBest(best);
        onPhase && onPhase(phase, { score, best, newBest });
      }
    }
  };

  const step = dt => {
    if (phase !== 'play') { stepFx(dt); return; }
    t += dt;
    const { binTop, binH, pw, ph } = geo();
    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = spawnGap() * (0.8 + Math.random() * 0.4); }
    const fall = fallSpeed();
    for (const p of phones) {
      if (p.out) { p.out += dt / 0.28; continue; }
      if (held && held.p === p) continue;
      p.vy += (fall - p.vy) * Math.min(1, dt * 2.2);   // ease back to the line speed after a flick
      p.vx *= Math.exp(-dt * 2.6);
      p.x += p.vx * dt; p.y += p.vy * dt;
      const m = pw / 2 + 3;
      if (p.x < m) { p.x = m; p.vx = Math.abs(p.vx) * 0.5; }
      if (p.x > W - m) { p.x = W - m; p.vx = -Math.abs(p.vx) * 0.5; }
      if (p.y < top - ph) { p.y = top - ph; p.vy = Math.max(p.vy, 0); }
      p.a += ((p.vx * 0.0016) - p.a) * Math.min(1, dt * 6);
      if (p.y + ph / 2 >= binTop + binH * 0.3) resolve(p, Math.max(0, Math.min(2, Math.floor(p.x / (W / 3)))));
    }
    phones = phones.filter(p => !p.out || p.out < 1);
    stepFx(dt);
  };
  const stepFx = dt => {
    for (const b of bits) { b.t += dt; b.vy += 520 * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
    bits = bits.filter(b => b.t < b.life);
    for (const p of pops) p.t += dt;
    pops = pops.filter(p => p.t < 0.9);
    shake = Math.max(0, shake - dt); flash = Math.max(0, flash - dt * 3);
    for (let i = 0; i < 3; i++) binPulse[i] = Math.max(0, binPulse[i] - dt * 3);
    if (phase !== 'play') for (const p of phones) if (p.out) p.out += dt / 0.28;
  };

  // ---------------------------------------------------------------- drawing
  const drawPhone = (p, lift) => {
    const { pw, ph } = geo();
    const k = p.out ? 1 - ease(Math.min(1, p.out)) : 1;
    if (k <= 0) return;
    ctx.save();
    ctx.translate(p.x, p.y + (p.out ? ease(Math.min(1, p.out)) * ph * 0.5 : 0));
    ctx.rotate(p.a); ctx.scale(k * (lift ? 1.08 : 1), k * (lift ? 1.08 : 1));
    ctx.globalAlpha = Math.min(1, k * 1.4);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, -pw / 2 + 3, -ph / 2 + (lift ? 9 : 4), pw, ph, pw * 0.2); ctx.fill();
    // body
    ctx.fillStyle = '#2B2621'; rr(ctx, -pw / 2, -ph / 2, pw, ph, pw * 0.2); ctx.fill();
    ctx.strokeStyle = '#57504A'; ctx.lineWidth = 1; ctx.stroke();
    // screen
    const s = pw * 0.08;
    const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
    g.addColorStop(0, '#FFF8EE'); g.addColorStop(1, '#E9DFCF');
    ctx.fillStyle = g; rr(ctx, -pw / 2 + s, -ph / 2 + s, pw - 2 * s, ph - 2 * s, pw * 0.14); ctx.fill();
    ctx.fillStyle = '#0B0907'; rr(ctx, -pw * 0.16, -ph / 2 + s * 1.6, pw * 0.32, pw * 0.09, pw * 0.05); ctx.fill();
    // wear by grade
    ctx.save(); rr(ctx, -pw / 2 + s, -ph / 2 + s, pw - 2 * s, ph - 2 * s, pw * 0.14); ctx.clip();
    if (p.gi === 1) {
      ctx.strokeStyle = 'rgba(22,19,15,.38)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-pw * 0.3, ph * 0.05); ctx.lineTo(pw * 0.25, -ph * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-pw * 0.2, ph * 0.22); ctx.lineTo(pw * 0.05, ph * 0.15); ctx.stroke();
    } else if (p.gi === 2) {
      ctx.strokeStyle = 'rgba(22,19,15,.55)'; ctx.lineWidth = 1.1;
      const cx = pw * 0.12, cy = ph * 0.12;
      for (let i = 0; i < 7; i++) {
        const a = p.seed + i * 0.95, len = pw * (0.5 + ((p.seed * (i + 3)) % 1) * 0.6);
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * len * 0.5 + 2, cy + Math.sin(a) * len * 0.5);
        ctx.lineTo(cx + Math.cos(a + 0.2) * len, cy + Math.sin(a + 0.2) * len); ctx.stroke();
      }
    }
    ctx.restore();
    // grade badge
    const gr = GRADES[p.gi], r = pw * 0.24;
    ctx.fillStyle = gr.col; ctx.beginPath(); ctx.arc(0, ph * 0.05, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; ctx.font = `700 ${Math.round(r * 1.25)}px Archivo, system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(gr.g, 0, ph * 0.05 + 1);
    ctx.restore();
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { floor, binH, binTop } = geo();
    // backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#221D18'); bg.addColorStop(1, INK);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const sx = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
    ctx.save(); ctx.translate(sx, 0);
    // lanes
    ctx.strokeStyle = 'rgba(246,242,234,.05)'; ctx.setLineDash([4, 8]); ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo((W / 3) * i, top + 8); ctx.lineTo((W / 3) * i, binTop); ctx.stroke(); }
    ctx.setLineDash([]);
    // bins
    for (let i = 0; i < 3; i++) {
      const gr = GRADES[i], x = (W / 3) * i + 4, w = W / 3 - 8, pulse = binPulse[i];
      ctx.fillStyle = gr.col + (pulse ? '55' : '26');
      rr(ctx, x, binTop, w, binH, 6); ctx.fill();
      ctx.strokeStyle = gr.col; ctx.lineWidth = 2 + pulse * 2; ctx.stroke();
      ctx.fillStyle = gr.col; ctx.fillRect(x - 2, binTop - 3, w + 4, 5);
      ctx.fillStyle = CREAM; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(binH * 0.42)}px Archivo, system-ui, sans-serif`;
      ctx.fillText(gr.g, x + w / 2, binTop + binH * 0.44);
      ctx.font = `600 ${Math.max(8, Math.round(binH * 0.14))}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(246,242,234,.6)'; ctx.fillText('BIN', x + w / 2, binTop + binH * 0.8);
    }
    ctx.fillStyle = '#0B0907'; ctx.fillRect(0, floor, W, H - floor);
    // phones (held one last, on top)
    // phones come out from under the line, never over the status bar
    ctx.save(); ctx.beginPath(); ctx.rect(-20, top + 4, W + 40, H); ctx.clip();
    for (const p of phones) if (!held || held.p !== p) drawPhone(p, false);
    ctx.restore();
    // the line: a conveyor at the top
    ctx.fillStyle = '#2B2621'; ctx.fillRect(0, top - 6, W, 10);
    ctx.fillStyle = '#3A342D';
    const off = (t * 40) % 16;
    for (let x = -16 + off; x < W; x += 16) ctx.fillRect(x, top - 6, 7, 10);
    if (held) drawPhone(held.p, true);
    // particles + pops
    for (const b of bits) { ctx.globalAlpha = 1 - b.t / b.life; ctx.fillStyle = b.col; ctx.fillRect(b.x - b.r / 2, b.y - b.r / 2, b.r, b.r); }
    ctx.globalAlpha = 1;
    for (const p of pops) {
      ctx.globalAlpha = 1 - p.t / 0.9; ctx.fillStyle = p.col; ctx.textAlign = 'center';
      ctx.font = '700 15px Archivo, system-ui, sans-serif'; ctx.fillText(p.text, p.x, p.y - ease(p.t / 0.9) * 34);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // HUD
    if (phase !== 'ready') {
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = CREAM; ctx.textAlign = 'center'; ctx.font = '700 30px Archivo, system-ui, sans-serif';
      ctx.fillText(String(score), W / 2, top + 40);
      ctx.font = '600 9px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(246,242,234,.55)';
      ctx.textAlign = 'left'; ctx.fillText(`BEST ${best}`, 14, top + 22);
      if (streak >= 3) { ctx.fillStyle = ORANGE; ctx.fillText(`${streak} IN A ROW`, 14, top + 35); }
      ctx.textAlign = 'right';
      for (let i = 0; i < 3; i++) {
        const x = W - 14 - i * 14, on = i < lives;
        ctx.fillStyle = on ? ORANGE : 'rgba(246,242,234,.15)';
        rr(ctx, x - 7, top + 13, 7, 12, 2); ctx.fill();
      }
    }
    if (flash > 0) { ctx.fillStyle = flashCol; ctx.globalAlpha = flash * 0.18; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  };

  // ---------------------------------------------------------------- input
  const hit = (x, y) => {
    const { pw, ph } = geo();
    for (let i = phones.length - 1; i >= 0; i--) {
      const p = phones[i];
      if (p.out) continue;
      if (Math.abs(x - p.x) <= pw / 2 + 12 && Math.abs(y - p.y) <= ph / 2 + 12) return p;
    }
    return null;
  };
  const down = (x, y, time) => {
    if (phase !== 'play') return false;
    const p = hit(x, y);
    if (!p) return false;
    held = { p, dx: p.x - x, dy: p.y - y, lx: x, ly: y, lt: time, vx: 0, vy: 0 };
    p.vx = 0; p.vy = 0;
    return true;
  };
  const move = (x, y, time) => {
    if (!held) return;
    const dtm = Math.max(1, time - held.lt) / 1000;
    const k = 0.45;   // smoothed pointer velocity for the flick
    held.vx = held.vx * (1 - k) + ((x - held.lx) / dtm) * k;
    held.vy = held.vy * (1 - k) + ((y - held.ly) / dtm) * k;
    held.lx = x; held.ly = y; held.lt = time;
    const p = held.p, { pw, ph, binTop, binH } = geo();
    p.x = Math.max(pw / 2 + 3, Math.min(W - pw / 2 - 3, x + held.dx));
    p.y = Math.max(top - ph * 0.3, y + held.dy);
    p.a += ((held.vx * 0.0012) - p.a) * 0.3;
    if (p.y + ph / 2 >= binTop + binH * 0.3) resolve(p, Math.max(0, Math.min(2, Math.floor(p.x / (W / 3)))));
  };
  const up = time => {
    if (!held) return;
    const p = held.p;
    const stale = time - held.lt > 90;   // finger stopped before lifting: no flick
    p.vx = stale ? 0 : Math.max(-1600, Math.min(1600, held.vx));
    p.vy = stale ? 0 : Math.max(-900, Math.min(2200, held.vy));
    held = null;
  };

  return {
    resize, step, draw, start, down, move, up,
    get phase() { return phase; }, get score() { return score; }, get best() { return best; }, get lives() { return lives; },
    debug: () => ({ W, H, t, phones: phones.map(p => [Math.round(p.x), Math.round(p.y), p.gi, p.out]) })
  };
}
