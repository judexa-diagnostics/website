// Plans, prices and pricing copy. Every number on the site about plans comes from
// the `pricing` object below, so a price change is one edit here. Names, monthly
// prices, included checks, staff and location limits and the feature ladder are the
// ones billing and entitlements sell (migrations 095 / 050; requirements S2-021..S2-023). Plain data and pure functions: no React and no DOM, so
// `npm test` imports this file directly.
//
// The website takes no payment and has no sign-up form of its own. Every plan button
// goes to the InPhox hub's sign-up with the plan's code (`signupUrl`); the hub checks
// the code, takes the card and shows "You picked <Plan>".

/** Every device check past a plan's included amount costs this, on every plan. */
export const OVERAGE_PER_CHECK = 0.5;

/** The InPhox hub, where sign-up lives. VITE_HUB_URL (config.js) overrides it for previews. */
export const DEFAULT_HUB_URL = 'https://home.inphox.net';

/** The page a plan button opens when the hub does not answer. */
export const BUSY_HREF = '#/signup-busy';

/** Where "Talk to sales" goes. */
export const SALES_HREF = '#/contact';

/** The hub's sign-up address for a plan code. Only the codes this file sells are ever built. */
export function signupUrl(code, hub = DEFAULT_HUB_URL) {
  const plan = pricing.plans.find(p => p.code === code && p.hubCode);
  const base = String(hub || DEFAULT_HUB_URL).replace(/\/+$/, '');
  return plan ? `${base}/signup?plan=${encodeURIComponent(plan.code)}` : null;
}

/**
 * Feature ladder: each plan has everything of the plan before it. `adds` is what a plan
 * adds over the previous one, in the words a shop owner uses. `flags` are the plan
 * flags each line stands for: the template's central_sync --website checks them against
 * the plan truth, so a feature can not be shown on the wrong plan.
 */
const ADDS = {
  free: [
    { label: 'Device scanning and lookups', flags: ['scanner', 'basic_lookup'] },
    { label: 'Stock list, receipts and CSV export', flags: ['stock_list', 'receipts', 'csv_export', 'export'] },
    { label: 'Card invoicing and crypto payments', flags: ['payments'] }
  ],
  basics: [
    { label: 'Employees', flags: ['employees'] },
    { label: 'Customer records', flags: ['customers'] },
    { label: 'Shipping integration', flags: ['shipping'] },
    { label: 'Price-list import', flags: ['pricelist_import'] },
    { label: 'Editable locations and shelves', flags: ['locations_edit'] },
    { label: 'Event log', flags: ['event_log'] },
    { label: 'Device lock checks', flags: ['lock_checks'] }
  ],
  growth: [
    { label: 'CRM: leads and pipeline', flags: ['crm'] },
    { label: 'Driver’s licence scan', flags: ['id_scan'] },
    { label: 'CAPSS compliance file', flags: ['capss'] },
    { label: 'Deep and OEM checks', flags: ['deep_checks'] },
    { label: 'The assistant', flags: ['ai'] },
    { label: 'Phone Intake', flags: ['intake'] },
    { label: 'Double Puff station app', flags: ['double_puff'] },
    { label: 'Secure erasure', flags: ['secure_erasure'] },
    { label: 'Automated diagnostics', flags: ['automated_diagnostics'] },
    { label: 'Accounting and export', flags: ['accounting', 'accounting_export'] },
    { label: 'Label printing', flags: ['label_printing'] }
  ],
  max: [
    { label: 'Repairs included', flags: ['repairs', 'repairs_pro'] },
    { label: 'Listing', flags: ['listing'] },
    { label: 'Reverse logistics', flags: ['reverse_logistics'] },
    { label: 'Workflow automations', flags: ['workflow_automations'] },
    { label: 'Custom roles', flags: ['rbac'] },
    { label: 'API access', flags: ['api_access'] },
    { label: 'Warehouse management', flags: ['warehouse'] },
    { label: 'Compliance automation', flags: ['capss_automation'] }
  ]
};

export const pricing = {
  plans: [
    {
      code: 'free', name: 'Free', hubCode: true, who: 'Try InPhox on real devices',
      price: 0, checksIncluded: 25, locations: 1, staff: 0,
      cardNote: 'A credit or debit card is required: a $1 hold that is released. Nothing is charged. Prepaid cards are not accepted.',
      adds: ADDS.free
    },
    {
      code: 'basics', name: 'Basics', hubCode: true, who: 'One shop with a small team',
      price: 30, checksIncluded: 125, locations: 1, staff: 3,
      adds: ADDS.basics, repairsAddon: 40
    },
    {
      code: 'growth', name: 'Growth', hubCode: true, who: 'A busy shop or a few locations', highlight: true,
      price: 150, checksIncluded: 1000, locations: 5, staff: 30,
      adds: ADDS.growth, repairsAddon: 100
    },
    {
      code: 'max', name: 'Max', hubCode: true, who: 'Many locations, your own workflows',
      price: 500, checksIncluded: 5000, locations: null, staff: null,
      customOverage: true,
      adds: ADDS.max
    },
    {
      // Not self-serve: a contract. Its button goes to the sales contact, not to the hub.
      code: 'enterprise', name: 'Enterprise', hubCode: false, who: 'Multi-site operators and wholesalers',
      price: null, checksIncluded: null, locations: null, staff: null,
      customOverage: true, talkToSales: true,
      adds: [{ label: 'Checks and price set in your contract', flags: [] }]
    }
  ],
  customOverageLine: 'Custom overage pricing available. Talk to us.',
  // Prepaid check packs: the price table stays out until Chris sets Free and per-plan prices.
  // Set `show: true` and add `rows` to switch it on; the page needs no redesign.
  packs: { show: true, line: 'Prepaid check packs are coming. Prices to follow.', rows: [] },
  busy: { title: 'Sign-up is busy, try again in a minute.', retry: 'Back to plans' },
  faq: [
    {
      q: 'What happens when I go over my included checks?',
      a: `Checks keep working. Each one past your plan’s included amount costs $${OVERAGE_PER_CHECK.toFixed(2)}, charged to your card at the end of the month, up to the spending limit you set; at the limit, new checks pause until you raise it.`
    },
    {
      q: 'What counts as a device check?',
      a: 'One lookup of a device’s IMEI, blacklist, carrier and manufacturer data. Each lookup counts once, and a check that fails before the lookup runs is not counted.'
    },
    {
      q: 'Is Free really free?',
      a: 'Yes. You get 25 device checks a month and nothing is charged. We ask for a credit or debit card so that checks past 25 can be billed at the end of the month, and we place a $1 hold that is released straight away. Prepaid cards are not accepted, and one card opens one Free account.'
    },
    {
      q: 'Where do I pay?',
      a: 'Not on this website. Pick a plan and you continue to InPhox sign-up, where you add your card.'
    }
  ]
};

export const findPlan = code => pricing.plans.find(p => p.code === code) || null;
const planIndex = code => pricing.plans.findIndex(p => p.code === code);

export const money = (n, digits = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const count = n => n.toLocaleString('en-US');

/** The one overage sentence shown next to every price. */
export function overageLine(plan) {
  const rate = money(OVERAGE_PER_CHECK, 2);
  if (plan.talkToSales) return pricing.customOverageLine;
  const base = `Past ${count(plan.checksIncluded)} checks: ${rate} each, charged to your card at month end.`;
  return plan.customOverage ? `${base} ${pricing.customOverageLine}` : base;
}

/** Everything one plan card prints. `adds` lists only what this plan adds over the one before. */
export function planCard(plan) {
  const i = planIndex(plan.code);
  const prev = i > 0 ? pricing.plans[i - 1] : null;
  const items = [];
  if (prev && !plan.talkToSales) items.push({ x: `Everything in ${prev.name}, plus`, strong: true });
  if (plan.talkToSales) items.push({ x: 'Everything in Max, plus', strong: true });
  for (const a of plan.adds) items.push({ x: a.label });
  const card = {
    code: plan.code, name: plan.name, who: plan.who,
    tag: plan.highlight ? 'Most shops start here' : '',
    priceStr: plan.price == null ? 'Talk to sales' : money(plan.price),
    per: plan.price == null ? '' : '/ month',
    checks: plan.checksIncluded == null ? 'Checks included are set in your contract' : `${count(plan.checksIncluded)} device checks included a month`,
    overage: overageLine(plan),
    limits: plan.talkToSales ? ['Unlimited staff and locations'] : [
      plan.staff === 0 ? 'Owner only, no staff accounts' : `${plan.staff == null ? 'Unlimited' : 'Up to ' + count(plan.staff)} staff`,
      plan.locations == null ? 'Unlimited locations' : plan.locations === 1 ? '1 location' : `Up to ${count(plan.locations)} locations`
    ],
    cardNote: plan.cardNote || '',
    cta: plan.talkToSales ? 'Talk to sales' : plan.price === 0 ? 'Start free' : `Start with ${plan.name}`,
    items
  };
  return card;
}

/** Rows for the "Compare plans" table: [label, value per plan]. */
export function compareRows() {
  const P = pricing.plans;
  const rate = money(OVERAGE_PER_CHECK, 2);
  const rows = [
    ['Price a month', ...P.map(p => (p.price == null ? 'Talk to sales' : money(p.price)))],
    ['Device checks included a month', ...P.map(p => (p.checksIncluded == null ? 'By contract' : count(p.checksIncluded)))],
    ['Each check past that', ...P.map(p => (p.talkToSales ? 'Custom, talk to us' : p.customOverage ? `${rate}, custom available` : rate))],
    ['Staff', ...P.map(p => (p.staff === 0 ? 'Owner only' : p.staff == null ? 'Unlimited' : count(p.staff)))],
    ['Locations', ...P.map(p => (p.locations == null ? 'Unlimited' : count(p.locations)))],
    ['Repairs', ...P.map(p => (p.repairsAddon ? `Add-on, ${money(p.repairsAddon)} a month` : p.customOverage ? 'Included' : '—'))]
  ];
  P.forEach((plan, i) => {
    if (plan.talkToSales) return;
    for (const a of plan.adds) {
      if (a.label === 'Repairs included') continue;
      rows.push([a.label, ...P.map((p, j) => (j >= i ? 'Included' : '—'))]);
    }
  });
  return rows;
}

/** The text shown with JavaScript off: the plans, their prices and the overage sentence. */
export function plainPlans() {
  return pricing.plans.map(p => {
    const c = planCard(p);
    return { name: c.name, price: c.priceStr + (c.per ? ' ' + c.per : ''), checks: c.checks, overage: c.overage, note: c.cardNote };
  });
}
