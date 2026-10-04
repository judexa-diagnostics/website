// Plans, prices and pricing copy. Every number on the site about plans comes from
// the `pricing` object below (billing spec 2026-10-04, section 2), so a price
// change is one edit here. Plain data and pure functions: no React and no DOM,
// so `npm test` imports this file directly.

export const pricing = {
  plans: [
    {
      code: 'starter', name: 'Starter', who: 'A small shop getting set up',
      price: { month: 300, year: 3000 },
      checksIncluded: 500, overagePerCheck: 0.75,
      devicesPerMonth: 1500, stations: 2, users: 5,
      support: 'Email support',
      compareSupport: 'Email'
    },
    {
      code: 'growth', name: 'Growth', who: 'A busy shop running several benches',
      price: { month: 700, year: 7000 },
      checksIncluded: 1500, overagePerCheck: 0.60,
      devicesPerMonth: 4500, stations: 5, users: 15,
      support: 'Email support, answered within one business day',
      compareSupport: 'Email · 1 business day',
      highlight: true
    },
    {
      // Sold through checkout on annual billing only; monthly is by contract.
      code: 'enterprise', name: 'Enterprise', who: 'Multi-site operators and wholesalers',
      price: { month: 5000, year: 50000 },
      checksIncluded: 15000, overagePerCheck: 0.45,
      devicesPerMonth: null, stations: null, users: null, // null = unlimited
      support: 'A named contact and an onboarding call',
      compareSupport: 'Named contact + onboarding call',
      annualCommitment: true
    }
  ],
  // `value` is what POST /billing/checkout receives as `interval` / `payment_mode`.
  intervals: [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Annual · 2 months free' }
  ],
  paymentModes: [
    { value: 'card', label: 'Card' },
    { value: 'invoice_usdc', label: 'USDC invoice', monthlyOnly: true }
  ],
  monthlyOnlyNote: 'USDC invoices are billed monthly.',
  paymentLine: 'Pay by card, or by monthly USDC invoice.',
  footnote: "Included checks reset monthly and don't roll over. Overage is billed at the end of the month and capped by a limit you set; you can turn overage off.",
  faq: [
    {
      q: 'What counts as a device check?',
      a: "One device check is one lookup of a device's IMEI, blacklist, carrier and manufacturer data. Each lookup counts once, and a check that fails before the lookup runs isn't counted. Devices processed is a separate number on each plan: it never blocks work and is never charged."
    },
    {
      q: 'What happens when we reach our included checks?',
      a: "Checks keep working. Each one past your included amount is billed at your plan's per-check rate at the end of the month, capped by a limit you set. At that limit, new checks pause until the owner raises it or the month resets, and you can turn overage off so the included checks become a hard stop. We never move a shop to a bigger plan on our own."
    }
  ]
};

export const findPlan = code => pricing.plans.find(p => p.code === code) || null;

export const money = (n, digits = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const count = n => n.toLocaleString('en-US');
const limit = (n, unit) => (n == null ? 'Unlimited ' : count(n) + ' ') + unit;

/** The interval actually billed: USDC invoices are monthly whatever the toggle says. */
export function billedInterval(interval, paymentMode) {
  const mode = pricing.paymentModes.find(m => m.value === paymentMode);
  return mode && mode.monthlyOnly ? 'month' : interval;
}

/** False for a plan/interval pair checkout refuses (Enterprise billed monthly is contract only). */
export function sellsOnline(plan, interval) {
  return !(plan.annualCommitment && interval === 'month');
}

/** Headline price per month (annual: the yearly price / 12, rounded to the dollar) and the yearly total. */
export function priceFor(plan, interval) {
  return { perMonth: interval === 'year' ? Math.round(plan.price.year / 12) : plan.price.month, yearTotal: plan.price.year };
}

/** The display strings for one plan card. */
export function planCard(plan, interval, paymentMode) {
  const { perMonth, yearTotal } = priceFor(plan, interval);
  let billed;
  if (interval === 'year') billed = `Billed annually · ${money(yearTotal)} / year · 2 months free`;
  else if (plan.annualCommitment) billed = 'Annual commitment · monthly billing by contract';
  else if (paymentMode === 'invoice_usdc') billed = 'Invoiced monthly · pay in USDC';
  else billed = 'Billed monthly · cancel any time';
  return {
    code: plan.code, name: plan.name, who: plan.who,
    tag: plan.annualCommitment ? 'Annual commitment' : plan.highlight ? 'Most shops start here' : '',
    priceStr: money(perMonth), billed,
    checks: `${count(plan.checksIncluded)} device checks included per month`,
    overage: `then ${money(plan.overagePerCheck, 2)} per check, capped by a limit you set`,
    items: [limit(plan.devicesPerMonth, 'devices processed per month'), limit(plan.stations, 'stations'), limit(plan.users, 'staff users'), plan.support]
  };
}

/** Rows for the "Compare plans" table: [label, value per plan]. */
export function compareRows() {
  const P = pricing.plans;
  return [
    ['Price, billed monthly', ...P.map(p => (p.annualCommitment ? 'By contract' : money(p.price.month) + ' / mo'))],
    ['Price, billed annually', ...P.map(p => money(p.price.year) + ' / yr')],
    ['Device checks included / month', ...P.map(p => count(p.checksIncluded))],
    ['Then, per check', ...P.map(p => money(p.overagePerCheck, 2))],
    ['Devices processed / month', ...P.map(p => (p.devicesPerMonth == null ? 'Unlimited' : count(p.devicesPerMonth)))],
    ['Stations', ...P.map(p => (p.stations == null ? 'Unlimited' : count(p.stations)))],
    ['Staff users', ...P.map(p => (p.users == null ? 'Unlimited' : count(p.users)))],
    ['Support', ...P.map(p => p.compareSupport)]
  ];
}

/** What a month costs on `plan` at `checks` device checks, with overage at the plan's rate. */
export function estimate(plan, checks, interval) {
  const base = interval === 'year' ? plan.price.year / 12 : plan.price.month;
  const overageChecks = Math.max(0, checks - plan.checksIncluded);
  const overage = overageChecks * plan.overagePerCheck;
  return { base, overageChecks, overage, total: base + overage };
}

/** True when the plan has room for this many stations. */
export const fitsStations = (plan, stations) => plan.stations == null || stations <= plan.stations;

/** The lowest-cost plan for this volume and station count. */
export function cheapestPlan(checks, stations, interval) {
  let best = null;
  for (const p of pricing.plans) {
    if (!fitsStations(p, stations)) continue;
    if (!best || estimate(p, checks, interval).total < estimate(best, checks, interval).total) best = p;
  }
  return best;
}
