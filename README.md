# STEM-azing — stem-azing.com

Plain HTML/CSS/JS site, hosted for free on GitHub Pages (custom domain in `CNAME`).
No build step: what is in this folder is what goes live.

> **Pushing to `main` publishes the site.** Preview locally first.

## Preview and checks

```bash
python3 -m http.server 8091      # then open http://127.0.0.1:8091/
npm test                         # site checks (Node 22, no dependencies)
```

`npm test` checks links, prices (EN and DE), the § 19 VAT note, legal pages, the
NeuroPenetrance numbers, that German pages stay hidden, the sitemap, and that no page
loads Google Fonts or Wix images.

## Structure

| File | Page |
|---|---|
| `index.html` | Home |
| `services.html` | Services & prices, € / $ switch, links to the request forms |
| `request/*.html`, `de/request/*.html` | Invoice request forms (generated, see below) |
| `about.html` | About |
| `writing.html` | Writing samples, publications, all blog posts |
| `neuropenetrance.html` | NeuroPenetrance |
| `booking.html` | Free 20-minute call (Calendly loads on click) |
| `consulting-portfolio.html` | Research advisory, data science, sample deliverables |
| `impressum.html`, `datenschutz.html` | Legal pages (German versions in `de/` are binding) |
| `posts/*.html` | 16 blog posts (English only) |
| `de/*.html` | German versions of the main pages |
| `biography.html`, `portfolio.html`, `blog.html` | Redirects for old links |

Shared parts: `css/site.css` (all styling), `nav.js` (menu and footer on every page),
`js/site.js` (€ / $ switch, sample filters, Calendly loader), `js/request.js` (request forms), photos in `img/`.

## Editing prices

Prices live in `data-eur` / `data-usd` attributes in **both** `services.html` and
`de/services.html` (and the short starting prices on `index.html` / `de/index.html`).
Change both languages, then run `npm test` — it fails if either disagrees with the
expected prices in `tools/prices.test.mjs`, so update that file too when a price changes.

STEM-azing is a Kleinunternehmerin business: every price area shows
"No VAT is charged under § 19 UStG." / „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“

## Invoice requests

Each "Request an invoice" button on `services.html` / `de/services.html` links to that
service's form: `request/<slug>.html` and `de/request/<slug>.html` (slugs `lectures`,
`tutoring`, `writing`, `communication`, `consulting`, `data-analysis`), carrying the
€ / $ choice as `?currency=`. Four steps: project (sub-services, live starting estimate),
about you, invoice details, extras. Answers go to Formspree (`https://formspree.io/f/myeegvqk`),
which emails them to you; you send the invoice yourself.

The 12 form pages are **generated**. Edit `tools/request-data.mjs` (sub-services, questions,
prices), then run `npm run build:requests` and commit the output; `npm test` fails if the
pages are out of date. Stepper, estimate and sending live in `js/request.js`.
Rush fee: a deadline less than 7 days away adds 25% to the estimate (`RUSH_RATE`, `RUSH_DAYS`
in `js/request.js`); the services pages and every form say so.
When a price changes, change it in `services.html`, `de/services.html` **and**
`tools/request-data.mjs`.

## Search engines

- Titles and descriptions use the phrases people search for (`tools/seo.test.mjs` keeps them
  ≤ 70 / ≤ 160 characters and unique).
- Structured data (schema.org JSON-LD: STEM-azing, Dr. Nella C. Delva, the six services with
  starting prices) sits in the home and services pages, EN + DE. It is generated from
  `tools/build-schema.mjs` and `tools/request-data.mjs`: run `npm run build:schema` after a
  price change. The portrait is referenced only from the home pages.
- Every EN/DE pair also has `hreflang="x-default"` pointing to the English page.

## German version

German pages live under `/de/` (same file names). `var DE_LIVE = true;` in `nav.js` shows the
EN | DE switch and German menus. Each EN/DE pair carries `hreflang` alternates, and the
German pages are in `sitemap.xml`. Blog posts are English only (no switch on post pages).
When you add or rename a main page, add its German partner too — `npm test` checks the pairs.
The German text was written by Claude; a native-speaker review is still recommended.
