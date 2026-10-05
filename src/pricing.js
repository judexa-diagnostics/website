// Plans, prices and pricing copy. Every number on the site about plans comes from
// the `pricing` object below (billing spec 2026-10-04, section 2), so a price
// change is one edit here. Plain data and pure functions: no React and no DOM,
// so `npm test` imports this file directly.
//
// The website takes no payment. A plan button starts the sign-up flow (the Start
// page); the plan is chosen at the end of it and paid for inside the app.

/** No device check is ever billed below this, however many a shop runs. */
export const PER_CHECK_FLOOR = 0.35;

/**
 * What each plan includes, in the order the cards and the compare table list it.
 * `from` is the first plan that has it; every plan after it has it too.
 */
export const products = [
  { id: 'intake', name: 'Phone Intake', desc: 'Customer check-in, ID and device photos, signed bill of sale, CAPSS export', from: 'starter' },
  { id: 'checks', name: 'Device checks', desc: 'IMEI, blacklist, carrier and activation-lock lookups on every device', from: 'starter' },
  { id: 'dm', name: 'Device Management', desc: 'Inventory and locations, repair tickets, sales and point of sale, sales tax', from: 'starter' },
  { id: 'selling', name: 'Selling tools', desc: 'Shipping labels, inventory sharing and buyer offers, buyer portal, market pricing, analytics', from: 'starter' },
  { id: 'station', name: 'Double Puff station app', desc: 'Plug in a phone: identity and full diagnostics land on the device record, no typing', from: 'growth' }
];

export const pricing = {
  plans: [
    {
      code: 'starter', name: 'Starter', who: 'A small shop getting set up',
      price: { month: 300, year: 3000 },
      checksIncluded: 500,
      // Graduated per-check rates past the included checks: `upTo` counts checks
      // over the included amount (null = no upper bound). Ends at the floor.
      overageTiers: [
        { upTo: 1000, rate: 0.75 }, { upTo: 5000, rate: 0.65 }, { upTo: 10000, rate: 0.55 },
        { upTo: 25000, rate: 0.45 }, { upTo: null, rate: PER_CHECK_FLOOR }
      ],
      // No Double Puff station app on Starter, so no stations (0, not null: null means unlimited).
      devicesPerMonth: 1500, stations: 0, users: 5,
      support: 'Email support',
      compareSupport: 'Email'
    },
    {
      code: 'growth', name: 'Growth', who: 'A busy shop running several benches',
      price: { month: 700, year: 7000 },
      checksIncluded: 1500,
      overageTiers: [
        { upTo: 1000, rate: 0.60 }, { upTo: 5000, rate: 0.52 }, { upTo: 10000, rate: 0.45 },
        { upTo: 25000, rate: 0.40 }, { upTo: null, rate: PER_CHECK_FLOOR }
      ],
      devicesPerMonth: 4500, stations: 5, users: 15,
      support: 'Email support, answered within one business day',
      compareSupport: 'Email · 1 business day',
      highlight: true
    },
    {
      // Annual billing only; monthly is by contract.
      code: 'enterprise', name: 'Enterprise', who: 'Multi-site operators and wholesalers',
      price: { month: 5000, year: 50000 },
      checksIncluded: 15000,
      overageTiers: [
        { upTo: 1000, rate: 0.45 }, { upTo: 5000, rate: 0.42 }, { upTo: 10000, rate: 0.39 },
        { upTo: 25000, rate: 0.37 }, { upTo: null, rate: PER_CHECK_FLOOR }
      ],
      devicesPerMonth: null, stations: null, users: null, // null = unlimited
      support: 'A named contact and an onboarding call',
      compareSupport: 'Named contact + onboarding call',
      annualCommitment: true
    }
  ],
  intervals: [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Annual · 2 months free' }
  ],
  paymentLine: "Nothing is charged on this site. Choose your plan at the end of sign-up, then add a card or set up monthly USDC invoicing when you finish setting up your shop.",
  footnote: "Included checks reset monthly and don't roll over. Checks past your included amount get cheaper the more you run, down to $0.35 each. Overage is billed at the end of the month and capped by a limit you set; you can turn overage off.",
  faq: [
    {
      q: 'What counts as a device check?',
      a: "One device check is one lookup of a device's IMEI, blacklist, carrier and manufacturer data. Each lookup counts once, and a check that fails before the lookup runs isn't counted. Devices processed is a separate number on each plan: it never blocks work and is never charged."
    },
    {
      q: 'Does per-check pricing get cheaper at volume?',
      a: "Yes. Checks past your included amount are billed in bands, like tax brackets: the first 1,000 at your plan's starting rate, the next 4,000 lower, and so on, down to $0.35 a check. Crossing a band only lowers the price of the checks above it, so a bigger month never costs more per check."
    },
    {
      q: 'What happens when we reach our included checks?',
      a: "Checks keep working. Each one past your included amount is billed at your plan's volume rates at the end of the month, capped by a limit you set. At that limit, new checks pause until the owner raises it or the month resets, and you can turn overage off so the included checks become a hard stop. We never move a shop to a bigger plan on our own."
    },
    {
      q: 'When do we pay?',
      a: "Not on this website. Create your account and choose a plan at the end of sign-up. You add payment (card, or a monthly USDC invoice) as the last step of setting up your shop inside InPhox, and your plan starts then."
    }
  ]
};

export const findPlan = code => pricing.plans.find(p => p.code === code) || null;
const planIndex = code => pricing.plans.findIndex(p => p.code === code);

export const money = (n, digits = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const count = n => n.toLocaleString('en-US');
const limit = (n, unit) => (n == null ? 'Unlimited ' : count(n) + ' ') + unit;

/** True when `plan` includes the product. */
export const hasProduct = (plan, product) => planIndex(plan.code) >= planIndex(product.from);

/** The plan's starting per-check rate (its first overage band). */
export const startRate = plan => plan.overageTiers[0].rate;

/** False for a plan/interval pair that is contract-only (Enterprise billed monthly). */
export function sellsOnline(plan, interval) {
  return !(plan.annualCommitment && interval === 'month');
}

/** Headline price per month (annual: the yearly price / 12, rounded to the dollar) and the yearly total. */
export function priceFor(plan, interval) {
  return { perMonth: interval === 'year' ? Math.round(plan.price.year / 12) : plan.price.month, yearTotal: plan.price.year };
}

/** Human label for one band: "First 1,000", "Next 4,000", "Past 25,000". */
export function bandLabel(tiers, i) {
  const from = i === 0 ? 0 : tiers[i - 1].upTo;
  const t = tiers[i];
  if (t.upTo == null) return `Past ${count(from)}`;
  return i === 0 ? `First ${count(t.upTo)}` : `Next ${count(t.upTo - from)}`;
}

/** Overage for `over` checks past the included amount, band by band (graduated). */
export function overageCost(plan, over) {
  const lines = [];
  let left = Math.max(0, over), from = 0, total = 0;
  for (const [i, t] of plan.overageTiers.entries()) {
    if (left <= 0) break;
    const size = t.upTo == null ? left : Math.min(left, t.upTo - from);
    if (size > 0) {
      lines.push({ label: bandLabel(plan.overageTiers, i), checks: size, rate: t.rate, cost: size * t.rate });
      total += size * t.rate;
      left -= size;
    }
    from = t.upTo ?? from;
  }
  return { lines, total };
}

/** The display strings for one plan card: limits first, then what's in the box. */
export function planCard(plan, interval) {
  const { perMonth, yearTotal } = priceFor(plan, interval);
  let billed;
  if (interval === 'year') billed = `Billed annually · ${money(yearTotal)} / year · 2 months free`;
  else if (plan.annualCommitment) billed = 'Annual commitment · monthly billing by contract';
  else billed = 'Billed monthly · cancel any time';
  const i = planIndex(plan.code);
  const prev = i > 0 ? pricing.plans[i - 1] : null;
  // "Everything in <previous plan>", then only what this plan adds.
  const included = prev
    ? [{ x: `Everything in ${prev.name}`, strong: true }, ...products.filter(p => p.from === plan.code).map(p => ({ x: p.name, sub: p.desc, strong: true }))]
    : products.filter(p => hasProduct(plan, p)).map(p => ({ x: p.name, sub: p.desc, strong: true }));
  return {
    code: plan.code, name: plan.name, who: plan.who,
    tag: plan.annualCommitment ? 'Annual commitment' : plan.highlight ? 'Most shops start here' : '',
    priceStr: money(perMonth), billed,
    checks: `${count(plan.checksIncluded)} device checks included per month`,
    overage: `then from ${money(startRate(plan), 2)} per check, falling to ${money(PER_CHECK_FLOOR, 2)} at volume`,
    items: [
      { x: limit(plan.devicesPerMonth, 'devices processed per month') },
      { x: plan.stations === 0 ? `${count(plan.users)} staff users`
          : `${plan.stations == null ? 'Unlimited' : count(plan.stations)} stations · ${plan.users == null ? 'unlimited' : count(plan.users)} staff users` },
      ...included,
      { x: plan.support }
    ]
  };
}

/** Rows for the "Compare plans" table: [label, value per plan]. */
export function compareRows() {
  const P = pricing.plans;
  const bands = P[0].overageTiers.map((_, i) => [`Per check, ${bandLabel(P[0].overageTiers, i).toLowerCase()} over`, ...P.map(p => money(p.overageTiers[i].rate, 2))]);
  return [
    ['Price, billed monthly', ...P.map(p => (p.annualCommitment ? 'By contract' : money(p.price.month) + ' / mo'))],
    ['Price, billed annually', ...P.map(p => money(p.price.year) + ' / yr')],
    ['Device checks included / month', ...P.map(p => count(p.checksIncluded))],
    ...bands,
    ['Devices processed / month', ...P.map(p => (p.devicesPerMonth == null ? 'Unlimited' : count(p.devicesPerMonth)))],
    ['Stations', ...P.map(p => (p.stations == null ? 'Unlimited' : p.stations === 0 ? '—' : count(p.stations)))],
    ['Staff users', ...P.map(p => (p.users == null ? 'Unlimited' : count(p.users)))],
    ...products.map(pr => [pr.name, ...P.map(p => (hasProduct(p, pr) ? 'Included' : '—'))]),
    ['Support', ...P.map(p => p.compareSupport)]
  ];
}

/** What a month costs on `plan` at `checks` device checks, overage billed in bands. */
export function estimate(plan, checks, interval) {
  const base = interval === 'year' ? plan.price.year / 12 : plan.price.month;
  const overageChecks = Math.max(0, checks - plan.checksIncluded);
  const { lines, total: overage } = overageCost(plan, overageChecks);
  const total = base + overage;
  return { base, overageChecks, overage, lines, total, perCheck: checks > 0 ? total / checks : 0 };
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
