# InPhox website

Marketing site for InPhox: a multi-page React 18 app built with Vite. Pages are switched by the URL hash (`#/pricing`, `#/start`, ...); there is no router library and no backend of its own.

## Running it

```sh
npm install        # first time only
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve the built bundle
npm test           # tests (Node's built-in runner, no extra dependencies)
```

## Where things live

- `src/SiteLogic.js`: page state, copy lists and the values every page renders.
- `src/pages/*.jsx`, `src/components/*.jsx`: the views.
- `src/pricing.js`: plans, prices, limits and pricing copy (the footnote, the payment line, the two pricing questions). Every plan number on the site comes from here, so a price change is one edit in this file; `npm test` checks the numbers, so update `tests/pricing.test.js` with it.
- `src/config.js`: the env vars below, with safe defaults.

## Configuration

Two optional env vars, read at build time. Copy `.env.example` to `.env.local` (git-ignored), or set them in the deploy environment, then rebuild.

| Variable | Unset | Set |
|---|---|---|
| `VITE_BILLING_BASE_URL` | Create account and the Contact form show their success screens without sending anything. | Create account POSTs `owner_name`, `company_name`, `email`, `plan`, `interval` to `<base>/billing/signup` (202 shows "Check your email"); the Contact form POSTs to `<base>/billing/lead`. The site never takes payment. |
| `VITE_APP_LOGIN_URL` | Sign in links go to `https://intake.inphox.net/auth/login`. | Sign in links go to this URL. |

What the billing service receives:

- No checkout from the website. Every plan button (plan cards, the estimate, the last step of the Start page) continues the sign-up flow with that plan picked; the plan is paid for inside the app as the last step of shop setup. Enterprise billed monthly (contract only) shows "Talk to us", linking to the Contact page.
- `POST /billing/lead`, sent with `fetch` as `application/x-www-form-urlencoded` with `name`, `email`, `company`, `segment` (the "What kind of business?" choice) and `volume` (devices processed per month). The Contact form's locations, current tools and message are not sent: the service stores only those five fields. The success card shows only on a 2xx response, so the service must allow the site's origin (`WEBSITE_ORIGIN` on the service). Anything else keeps the form and shows an inline "try again" line.
