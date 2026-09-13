# RE:RUN Website

Static storefront for RE:RUN One, a modular performance sneaker: one chassis with a replaceable outsole, upper and insole, a digital passport and return credit on every worn module. Built for the e-commerce course assignment (Laudon, *E-commerce* ch. 4): brand board, site structure and full set of web pages.

## Pages

| Area | Files |
|---|---|
| Home | `public/index.html` (landing with product story, reviews, FAQ, journal teaser) |
| Shop | `public/shop.html`, `public/products/*.html` (RE:RUN One, Outsole, Upper, Insole, Care Kit) |
| The System | `public/services.html` (chassis + modules, Repair & Renew, Module Return Credit, Certified Resale) |
| Journal | `public/journal.html`, `public/journal/*.html` |
| Company | `public/about.html`, `public/contact.html`, `public/brand.html` (brand board, site map, customer journey, keywords, marketing hub) |
| Support | `public/faq.html`, `public/shipping-returns.html`, `public/policies.html`, `public/account.html` |
| Checkout | `public/cart.html` → `public/checkout.html` → `public/order-confirmed.html` |
| SEO | `public/sitemap.xml`, `public/robots.txt`, canonical/meta/JSON-LD on every page, GA4 placeholder `G-RR2026SHOE` |

Cart, checkout, account and forms run in the browser (localStorage). Promo codes: `RERUN10` (10%), `NEWRUNNER` (15%), `ThuongMaiDienTu` and `GiveMe10stars` (90%). There is no payment, email or account backend. Company details, prices, policies and reviews are fictional.

## Deploy on Vercel

1. Import `ChauyeubacToLam/Re-Run-Website` into Vercel.
2. Root Directory: repository root. Framework: **Other**. Build command: **npm run build**. Output directory: **public**.
3. Deploy. No environment variables or dependencies are required. `vercel.json` carries the MIME headers for the mirrored extensionless endpoints.

## Local preview

```sh
npm run build   # sanity checks
npm start       # http://127.0.0.1:3000
```

Serve `public` as the site root; do not open `index.html` from the filesystem.

## Layout

- `public/assets/rerun/` — RE:RUN images, `pages.css` (store pages), `shop.js` (cart, checkout, account, forms), `content.js`/`content.json` (runtime copy and colourway data for the landing page).
- `public/cdn/`, `public/_ext/` — theme styles, scripts, fonts and mirrored dependencies from the original template.
- `scripts/check.mjs` — build-time checks; `scripts/source-manifest.json` — SHA-256 inventory of `public/`.
