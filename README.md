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
| `services.html` | Services & prices, € / $ switch, invoice request |
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
`js/site.js` (€ / $ switch, invoice dialog, sample filters, Calendly loader), photos in `img/`.

## Editing prices

Prices live in `data-eur` / `data-usd` attributes in **both** `services.html` and
`de/services.html` (and the short starting prices on `index.html` / `de/index.html`).
Change both languages, then run `npm test` — it fails if either disagrees with the
expected prices in `tools/prices.test.mjs`, so update that file too when a price changes.

STEM-azing is a Kleinunternehmerin business: every price area shows
"No VAT is charged under § 19 UStG." / „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“

## Invoice requests

"Request an invoice" opens a dialog and then a pre-filled email to
`stemazing.advancement@gmail.com` (set in `INVOICE_EMAIL` in `js/site.js`) with the
service, starting rate, currency and the § 19 note. You send the invoice yourself.

## German version (hidden)

The German pages in `de/` are not linked from the site until a native speaker has
reviewed them. To launch:

1. Set `var DE_LIVE = true;` in `nav.js` (shows the EN | DE switch and German menus).
2. Add `hreflang` alternates between each EN/DE pair and the `/de/` pages to `sitemap.xml`.
3. Update the "German stays hidden" test in `tools/i18n.test.mjs` to the live variant.

The German legal pages (`de/impressum.html`, `de/datenschutz.html`) are live already.
