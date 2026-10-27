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
- `src/pricing.js`: plans, prices, included checks, limits, the flat $0.50 overage and the pricing copy (FAQ, packs placeholder line). Every plan number on the site comes from here, so a price change is one edit in this file; `npm test` checks the numbers against what billing sells, so update `tests/pricing.test.js` with it. The same file writes the plans into `index.html`'s `<noscript>` at build time.
- `src/config.js`: the env vars below, with safe defaults.
- `src/tokens.css`: the apps' base template tokens (`--pmm-*`, `--pm-sem-*`, Satoshi), copied from the hub's `inphox-tokens.css` (light only), plus the one button style `.ix-btn` / `.ix-btn.is-primary`. New UI reads these names instead of writing colours; `npm test` fails on a raw hex in the home page, the header, menu, footer or plan cards.
- `src/home.js`, `src/home.css`: the home page's facts, steps and styles. Every sign-up button says `START_FREE` ("Start free", in `pricing.js`). Testimonials show only from `VERIFIED_QUOTES` in `home.js`, which is empty until real customers agree to be quoted.

## Configuration

Three optional env vars, read at build time. Copy `.env.example` to `.env.local` (git-ignored), or set them in the deploy environment, then rebuild.

| Variable | Unset | Set |
|---|---|---|
| `VITE_PLATFORM_URL` | `https://platform.inphox.net`: the Contact form POSTs to `<platform>/inphox/lead`. | `off`: the form shows its success screen without sending anything (local previews). The site never takes payment. |
| `VITE_SHOP_DOMAIN` | Shops are at `<shop>.inphox.net`. | Shops are at `<shop>.<this domain>`. Every Sign in link opens `#/signin` ("Sign in to your shop"), which asks for the shop's name and goes to `https://<shop>.<domain>/web/login`; the last shop is remembered in the browser. |

What the billing service receives:

- No checkout and no sign-up form on the website. Every plan button is a link to the hub, `https://home.inphox.net/signup?plan=<code>` (`free`, `basics`, `growth`, `max`); the hub checks the code, takes the card and shows "You picked <Plan>". Enterprise goes to the sales contact (`#/contact`). A plain click first checks that the hub answers and otherwise opens `#/signup-busy` ("Sign-up is busy, try again in a minute."). `VITE_HUB_URL` points the buttons at another hub (previews).
- `POST /billing/lead`, sent with `fetch` as `application/x-www-form-urlencoded` with `name`, `email`, `company`, `segment` (the "What kind of business?" choice) and `volume` (devices processed per month). The Contact form's locations, current tools and message are not sent: the service stores only those five fields. The success card shows only on a 2xx response, so the service must allow the site's origin (`WEBSITE_ORIGIN` on the service). Anything else keeps the form and shows an inline "try again" line.
