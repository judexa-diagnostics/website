// Spanish for strings built from numbers or names (counts, prices, versions): [English pattern, Spanish replacement].
// Checked in order after the exact dictionary (es.js) has no entry.
const PLAN = '(Always Free|Basics|Growth|Max|Enterprise)';
const planEs = p => (p === 'Always Free' ? 'Siempre gratis' : p);
export const ES_PATTERNS = [
  [/^Version (.+)$/, 'Versión $1'],
  [/^\$([\d,]+) \/ month$/, (m, n) => `$${n} / mes`],
  [/^([\d,]+) device checks included a month$/, '$1 revisiones de dispositivos incluidas al mes'],
  [/^([\d,]+) device checks a month$/, '$1 revisiones de dispositivos al mes'],
  [/^([\d,]+) locations$/, '$1 ubicaciones'],
  [/^([\d,]+) units$/, '$1 unidades'],
  [/^([\d,]+) inbound$/, '$1 entrantes'],
  [/^(\d+) of (\d+) fields read$/, '$1 de $2 campos leídos'],
  [/^(\d+) of (\d+) done · (\d+) testing$/, '$1 de $2 listos · $3 en prueba'],
  [/^(\d+) of (\d+) scanned in$/, '$1 de $2 escaneados'],
  [/^(\d+)–(\d+) of (\d+)$/, '$1–$2 de $3'],
  [/^Testing (\d+)\/(\d+)$/, 'Probando $1/$2'],
  [/^(\d+)% health · ([\d,]+) cycles$/, '$1% de salud · $2 ciclos'],
  [/^Battery (\d+)% · ([\d,]+) cycles$/, 'Batería $1% · $2 ciclos'],
  [/^([\d.]+) GB · ([\d.]+) GB used$/, '$1 GB · $2 GB usados'],
  [/^Accept \$([\d,]+)$/, (m, n) => `Aceptar $${n}`],
  [/^Select (.+)$/, 'Seleccionar $1'],
  [new RegExp(`^Everything in ${PLAN}, plus$`), (m, p) => `Todo lo de ${planEs(p)}, y además`],
  [new RegExp(`^${PLAN} · \\$([\\d,]+)\\/mo$`), (m, p, n) => `${planEs(p)} · $${n}/mes`],
  [new RegExp(`^You picked ${PLAN}$`), (m, p) => `Elegiste ${planEs(p)}`],
  [/^(.+), Waiting$/, '$1, en espera'],
  [/^(.+), Connecting$/, '$1, conectando'],
  [/^(.+), Pairing$/, '$1, emparejando']
];
