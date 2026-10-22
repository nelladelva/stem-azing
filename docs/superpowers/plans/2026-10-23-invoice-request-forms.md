# Invoice Request Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Request an invoice" email dialog with one four-step Formspree form page per service (6 services × EN/DE), with a live starting-price estimate.

**Architecture:** Service content and prices live once, in `tools/request-data.mjs`. A dev-only generator (`tools/build-requests.mjs`, run with `npm run build:requests`) writes 12 static HTML pages to `request/` and `de/request/`, and the generated pages are committed (the site has no build step on deploy). Without JavaScript a page is one long form that posts straight to Formspree. `js/request.js` turns it into a stepper, computes the estimate, and submits with `fetch`.

**Tech Stack:** Plain HTML/CSS/ES5-style browser JS (match `js/site.js`), Node 22 built-in test runner (`npm test`), Formspree, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-22-invoice-request-forms-design.md`

## Global Constraints

- Work on branch `invoice-forms`. **Never push** — pushing `main` publishes the site; Nella previews and says yes first.
- Formspree endpoint: `https://formspree.io/f/myeegvqk` (one endpoint, all 12 pages).
- Every form shows: EN "All communication will be in English." / DE „Die gesamte Kommunikation erfolgt auf Englisch.“
- Every estimate area shows: EN "No VAT is charged under § 19 UStG." / DE „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“ and EN "Starting estimate; the final price is confirmed on your invoice." / DE „Unverbindliche Startschätzung; der endgültige Preis steht auf Ihrer Rechnung.“
- In-person note: EN "In person means Berlin; travel outside Berlin is quoted separately." / DE „Vor Ort bedeutet Berlin; Reisen außerhalb Berlins werden separat berechnet.“
- Thank-you: EN "Thank you — I'll reply within 2 working days with your invoice or an invitation to a free call." / DE „Vielen Dank – ich melde mich innerhalb von 2 Werktagen mit Ihrer Rechnung oder einer Einladung zu einem kostenlosen Gespräch.“
- German copy uses formal *Sie*. Field `name`s and checkbox/radio `value`s are English on both languages so every email looks alike.
- No Google Fonts, no Wix assets, no inline `<script>` blocks, every `<img>` has `alt`; pages use `/css/site.css`, `/nav.js`, `id="site-header"`/`id="site-footer"` slots, `<a class="skip">`.
- Service names, EN → DE: Guest lectures & workshops → Gastvorträge & Workshops; Tutoring & mentorship → Nachhilfe & Mentoring; Scientific writing & editing → Wissenschaftliches Schreiben & Lektorat; Science communication → Wissenschaftskommunikation; Scientific consulting → Wissenschaftliche Beratung; Research & data analysis → Forschungs- & Datenanalyse.
- Slugs: `lectures`, `tutoring`, `writing`, `communication`, `consulting`, `data-analysis`.

## Review Focus

1. Client goes Back, or fails validation, or a submit fails (offline / Formspree error) → nothing they typed is lost and they see a plain error message, not a blank page. (Task 4 manual check + error-path test in Task 2.)
2. Quantity box empty, zero, negative or non-numeric while its item is ticked → that item adds nothing and the estimate never shows `NaN`, `€0` totals or a negative price. (Task 2 tests.)
3. Client switches € / $ in step 3 after filling step 1 → estimate and budget labels switch; the submitted `currency` and `estimate` fields match what they saw. (Task 2 test on formatting + Task 4 manual check.)
4. Unknown or missing `?currency=` in the URL (e.g. `?currency=GBP`) → falls back to EUR. (Task 2 test.)
5. JavaScript off → every step visible as one form, required fields still enforced by the browser, form posts to Formspree. (Task 3 test: no `hidden` attribute on step fieldsets in static HTML.)

---

### Task 1: Service data and prices

**Files:**
- Create: `tools/request-data.mjs`
- Create: `tools/request-data.test.mjs`
- Modify: `.gitignore` (nothing to add; confirm `.superpowers/` is there)
- Commit also: the spec file `docs/superpowers/specs/2026-10-22-invoice-request-forms-design.md` and this plan

**Interfaces:**
- Produces:
  - `PRICES`: `{ lecture, tutoring, tutoringPack, langEdit, sciEdit, writingFrom, piece, consultHour, consultFrom, dataHour, dataFrom }`, each `{ eur: number, usd: number }`, values: 350/385, 100/120, 950/1000, 150/165, 220/240, 800/880, 180/198, 95/105, 750/820, 90/99, 900/985.
  - `SERVICES`: array of 6, in services-page order, each:
    ```
    { slug, name: { en, de },
      billing: null | { hour: <PRICES key>, from: <PRICES key> },   // consulting: consultHour/consultFrom; data-analysis: dataHour/dataFrom
      subs: [ { id, en, de, per, price? } ],      // per: 'session'|'piece'|'1000words'|'flat'|'from'|'quote'|'info'; price = PRICES key when per needs one
      questions: [ { name, type: 'text'|'number'|'date'|'select'|'radio'|'textarea', en, de, required?: boolean, options?: [{ value, en, de }] } ] }
    ```
  - `OTHER`: per service the generator appends `{ id: 'other', en: 'Other', de: 'Sonstiges', per }` with `per: 'quote'` (or `'info'` when `billing` is set) and a free-text box `other_text`.
  - `BUDGETS`: `[{ value: 'under-500', eur: 'Under €500', usd: 'Under $550', de_eur: 'Unter 500 €', de_usd: 'Unter 550 $' }, '500-1500' (€500–1,500 / $550–1,650), '1500-5000' (€1,500–5,000 / $1,650–5,500), 'over-5000' (Over €5,000 / $5,500), 'not-sure' (Not sure / Noch unklar)]`.

Sub-services and their `per`/`price` (EN labels verbatim from the spec; write German labels in formal register):

| slug | sub-services → per (price) |
|---|---|
| lectures | single guest lecture, keynote talk, panel / moderation, lab or hands-on activity, teacher training / PD session, career talk (first-gen / international path in STEM) → `session` (lecture); multi-session workshop series, curriculum or course design → `quote` |
| tutoring | single session, exam prep (AP, IB, Abitur, MCAT/GRE), homework & course support, research project mentoring, science fair / competition prep, college or grad-school application guidance, PhD / career mentoring, scholarship & Fulbright guidance → `session` (tutoring); 10-session package → `flat` (tutoringPack) |
| writing | language & clarity edit → `1000words` (langEdit); scientific edit, thesis or dissertation edit → `1000words` (sciEdit); grant writing, original writing / ghostwriting → `from` (writingFrom); grant review, cover letter to journals, reply to reviewers, literature review, abstract / poster, translation-and-edit (DE→EN) → `quote` |
| communication | blog article, press release, newsletter, social media posts, talk or podcast script, explainer for patients / public, infographic text, website science copy → `piece` (piece); ongoing monthly package → `quote` |
| consulting | hourly advice, data interpretation, experimental / study review, R&D strategy, literature & market landscape, scientific due diligence, advisory board / expert opinion → `info` |
| data-analysis | study design, statistical analysis, machine learning model, biomarker / omics analysis, data cleaning, figures & visualisation, reproducible R / Python pipeline, methods & results write-up, training your team → `info` |

Service-specific `questions` (names in snake_case): lectures — `audience_level` (select: high school, university, general public, professionals, other), `group_size` (number), `topic` (text), `dates` (text). Tutoring — `student_level` (select: middle school, high school, university, graduate, professional), `subject` (text), `goals` (textarea), `schedule` (text), `payer` (radio: parent, student, school, other). Writing — `document_type` (select: manuscript, grant, thesis, book or chapter, other), `target` (text, "Target journal or funder"), `citation_style` (text). Communication — `audience` (text), `platform` (text), `tone` (text). Consulting — `field` (select: oncology, neuroscience, molecular biology, other), `stage` (text, "Stage of your work"). Data analysis — `data_type` (text), `data_size` (text, "Approximate size"), `tools_used` (text), `sensitive_data` (radio: yes, no, not sure; "Does it include patient or other sensitive data?"). No language question anywhere. Quantities are not questions: they come from `per` (Task 3).

- [ ] **Step 1: Create branch** — `git checkout -b invoice-forms`; Expected: `Switched to a new branch 'invoice-forms'`.

- [ ] **Step 2: Write the failing test** `tools/request-data.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICES, SERVICES } from './request-data.mjs';
import { HEADLINE } from './prices.test.mjs';

test('request prices match the services page', () => {
  const byName = Object.fromEntries(SERVICES.map(s => [s.name.en, s]));
  const first = { lectures: 'lecture', tutoring: 'tutoring', writing: 'langEdit', communication: 'piece', consulting: 'consultHour', 'data-analysis': 'dataHour' };
  for (const [name, [eur, usd]] of Object.entries(HEADLINE)) {
    const p = PRICES[first[byName[name].slug]];
    assert.deepEqual([String(p.eur), String(p.usd)], [eur, usd], name);
  }
  assert.deepEqual(PRICES.tutoringPack, { eur: 950, usd: 1000 });
  assert.deepEqual(PRICES.sciEdit, { eur: 220, usd: 240 });
  assert.deepEqual(PRICES.writingFrom, { eur: 800, usd: 880 });
  assert.deepEqual(PRICES.consultFrom, { eur: 750, usd: 820 });
  assert.deepEqual(PRICES.dataFrom, { eur: 900, usd: 985 });
});

test('six services, every sub-service bilingual and priced consistently', () => {
  assert.deepEqual(SERVICES.map(s => s.slug), ['lectures', 'tutoring', 'writing', 'communication', 'consulting', 'data-analysis']);
  const needsPrice = ['session', 'piece', '1000words', 'flat', 'from'];
  for (const s of SERVICES) for (const sub of s.subs) {
    assert.ok(sub.en && sub.de, `${s.slug}/${sub.id} labels`);
    if (needsPrice.includes(sub.per)) assert.ok(PRICES[sub.price], `${s.slug}/${sub.id} price`);
    if (s.billing) assert.equal(sub.per, 'info', `${s.slug}/${sub.id}: billing question sets the price`);
  }
  const subs = slug => SERVICES.find(s => s.slug === slug).subs.map(x => x.en);
  assert.equal(subs('lectures').length, 8);
  assert.equal(subs('tutoring').length, 9);
  assert.equal(subs('writing').length, 11);
  assert.equal(subs('communication').length, 9);
  assert.equal(subs('consulting').length, 7);
  assert.equal(subs('data-analysis').length, 9);
  assert.ok(!subs('consulting').some(x => /fixed project/i.test(x)));
  assert.equal(SERVICES.find(s => s.slug === 'lectures').subs.find(x => /multi-session/i.test(x.en)).per, 'quote');
});

test('no language question on any form', () => {
  for (const s of SERVICES) assert.ok(!s.questions.some(q => /language/i.test(q.name + q.en)), s.slug);
});
```

- [ ] **Step 3: Run it** — `node --test tools/request-data.test.mjs`; Expected: FAIL, cannot find module `./request-data.mjs`.

- [ ] **Step 4: Write `tools/request-data.mjs`** exporting `PRICES`, `SERVICES`, `BUDGETS` as specified above. Header comment in the style of `tools/site.mjs`: "Single source for the request forms; run `npm run build:requests` after editing. Prices must match services.html (checked by request-data.test.mjs)."

- [ ] **Step 5: Run** — `npm test`; Expected: all pass.

- [ ] **Step 6: Commit** — `git add tools/request-data.mjs tools/request-data.test.mjs docs/superpowers && git commit -m "Request forms: service data, prices, spec and plan"`.

---

### Task 2: Estimate engine

**Files:**
- Create: `js/request.js` (pure part only in this task)
- Create: `tools/request.test.mjs`

**Interfaces:**
- Consumes: `formatMoney(symbol, value, lang)` from `js/site.js` (browser: global; Node: `require('./site.js')`).
- Produces (exported via `module.exports` like `js/site.js`):
  - `estimate(lines, currency) -> { total: number, deposit: number, from: number[], quoted: boolean }` where `lines = [{ per, eur, usd, qty }]`, `currency` `'EUR'|'USD'`. Rules: `session`/`piece`/`hour` → rate × qty; `1000words` → `Math.round(rate × qty / 1000)`; `flat` → rate; `from` → push rate to `from`; `quote` → `quoted = true`; `info` → nothing. A `qty` that is not a finite number > 0 adds nothing. `deposit = Math.round(total / 2)`.
  - `estimateText(result, currency, lang) -> string[]` with exact copy below.
  - `pickCurrency(search) -> 'EUR'|'USD'` from a `location.search` string; anything but `USD` → `EUR`.

- [ ] **Step 1: Write the failing tests** `tools/request.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { estimate, estimateText, pickCurrency } = createRequire(import.meta.url)('../js/request.js');

test('scientific edit of 6,000 words', () => {
  const r = estimate([{ per: '1000words', eur: 220, usd: 240, qty: 6000 }], 'EUR');
  assert.deepEqual(r, { total: 1320, deposit: 660, from: [], quoted: false });
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Starting estimate: €1,320', '50% deposit books your spot: €660']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Startschätzung: 1.320 €', '50 % Anzahlung sichert Ihren Termin: 660 €']);
});

test('sessions, a from-item and a quoted item together', () => {
  const r = estimate([
    { per: 'session', eur: 350, usd: 385, qty: 2 },
    { per: 'from', eur: 800, usd: 880, qty: null },
    { per: 'quote', qty: null },
  ], 'USD');
  assert.deepEqual(r, { total: 770, deposit: 385, from: [880], quoted: true });
  assert.deepEqual(estimateText(r, 'USD', 'en'), ['Starting estimate: $770', '+ from $880', '+ items quoted after review', '50% deposit books your spot: $385']);
});

test('package is flat, hourly multiplies, info adds nothing', () => {
  assert.equal(estimate([{ per: 'flat', eur: 950, usd: 1000, qty: null }], 'USD').total, 1000);
  assert.equal(estimate([{ per: 'hour', eur: 95, usd: 105, qty: 10 }, { per: 'info', qty: null }], 'EUR').total, 950);
});

test('bad quantities add nothing and never produce NaN', () => {
  for (const qty of [null, 0, -3, NaN, '', 'abc']) {
    const r = estimate([{ per: 'session', eur: 100, usd: 120, qty }], 'EUR');
    assert.deepEqual(r, { total: 0, deposit: 0, from: [], quoted: false }, String(qty));
  }
});

test('nothing priced yet', () => {
  const r = estimate([], 'EUR');
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Choose what you need to see a starting estimate.']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Wählen Sie aus, was Sie brauchen, um eine Startschätzung zu sehen.']);
});

test('only from / quoted items: no total line', () => {
  const r = estimate([{ per: 'from', eur: 750, usd: 820, qty: null }, { per: 'quote', qty: null }], 'EUR');
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['From €750', '+ items quoted after review']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Ab 750 €', '+ weitere Posten nach Prüfung']);
});

test('currency from the URL', () => {
  assert.equal(pickCurrency('?currency=USD'), 'USD');
  for (const s of ['', '?currency=GBP', '?currency=usd&x=1', '?foo=bar']) assert.equal(pickCurrency(s), s.includes('usd') ? 'USD' : 'EUR');
});
```

Copy rules the tests pin: with a total → `Starting estimate: X` / `Startschätzung: X` first; each `from` → `+ from X` / `+ ab X`; `quoted` → `+ items quoted after review` / `+ weitere Posten nach Prüfung`; with a total → deposit line last. Without a total, the first `from` becomes `From X` / `Ab X` and later ones `+ from X`; with neither → the "Choose…" line. `pickCurrency` is case-insensitive.

- [ ] **Step 2: Run** — `node --test tools/request.test.mjs`; Expected: FAIL, cannot find module.
- [ ] **Step 3: Implement** `estimate`, `estimateText`, `pickCurrency` at the top of `js/request.js` (header comment in the style of `js/site.js`), then `if (typeof module !== "undefined") module.exports = {…}`. Coerce `qty` with `Number()`.
- [ ] **Step 4: Run** — `npm test`; Expected: all pass.
- [ ] **Step 5: Commit** — `git add js/request.js tools/request.test.mjs && git commit -m "Request forms: starting-price estimate"`.

---

### Task 3: Generator and the 12 form pages

**Files:**
- Create: `tools/build-requests.mjs`, `tools/requests.test.mjs`
- Create (generated): `request/{lectures,tutoring,writing,communication,consulting,data-analysis}.html`, `de/request/<same>.html`
- Modify: `package.json` (add `"build:requests": "node tools/build-requests.mjs"`), `sitemap.xml` (add all 12 URLs), `css/site.css` (stepper, fields, chips-as-checkboxes, estimate box, error and thank-you states)

**Interfaces:**
- Consumes: `SERVICES`, `PRICES`, `BUDGETS` (Task 1).
- Produces: `renderPage(service, lang) -> string` and `PAGES -> [{ file, html }]` exported from `tools/build-requests.mjs`; running the file writes them. DOM contract that Task 4 relies on:
  - `<form id="request-form" action="https://formspree.io/f/myeegvqk" method="POST" data-lang="en|de" novalidate>` — `novalidate` is added by `request.js`, **not** in the static HTML (Review Focus 5).
  - Four `<fieldset class="step" data-step="1..4">` with `<legend>`; a progress `<ol class="stepper">` with four `<li>`; Back/Next buttons `[data-step-prev]`, `[data-step-next]`; final `<button type="submit">`.
  - Each sub-service: `<input type="checkbox" name="sub_services" value="<EN label>" data-per data-eur data-usd>`; for `session`/`piece`/`1000words` a following `<input type="number" min="1" name="qty_<id>" data-qty-for="<id>">` labelled Sessions / Pieces / Words (DE Sitzungen / Beiträge / Wörter). "Other" checkbox reveals `other_text`.
  - Consulting and data analysis: radio `billing` with values `hourly` (`data-per="hour"` + rate, plus `<input type="number" name="hours" min="1">`) and `fixed` (`data-per="from"` + from price). Required.
  - Hidden: `service` (EN name), `language`, `_subject` (`Invoice request: <EN name>`), `currency`, `estimate` (filled by JS), and honeypot `<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp">` (`.hp` visually hidden).
  - `<div class="estimate" aria-live="polite">` in step 1 containing `[data-estimate-lines]`, followed by the Global Constraints estimate notes.
  - `<div class="form-status" role="alert" hidden>` for errors and `<section class="thanks" hidden>` with the thank-you copy.
- Field order: Step 1 sub-services, (billing), service questions, `budget` (select from `BUDGETS`, options carry `data-eur`/`data-usd` labels), `deadline` (date, required), `format` (radio required: `online` / `in-person`, + in-person note). Step 2 `name`* , `email`* (type email), `phone`, `organisation` ("Company, university or organisation"), `role`. Step 3 `billing_name`*, `billing_address`* (textarea), `country`*, `vat_id`, `po_number`, `currency` (select EUR/USD), `invoice_email` ("Send the invoice to (if different)"). Step 4 `details` (textarea "Tell me more"), `files_link` (url, "Link to your files (Google Drive, Dropbox…)"), `heard_about`, `consent`* (checkbox linking `/datenschutz.html` or `/de/datenschutz.html`). `*` = `required`.
- Page head: same as `services.html` (title "Request an invoice: <name> — STEM-azing" / "Rechnung anfordern: <name> — STEM-azing", description, hreflang alternates for `https://stem-azing.com/request/<slug>.html` and `/de/request/<slug>.html`, `/css/site.css`, `/nav.js`, `/js/site.js`, `/js/request.js`, all `defer`), `<body data-page="services.html">`, skip link, header/footer slots, a link back to `/services.html` (or `/de/services.html`). The English-communication note sits under the `<h1>`.

- [ ] **Step 1: Write the failing tests** `tools/requests.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, text } from './site.mjs';
import { PAGES } from './build-requests.mjs';
import { SERVICES } from './request-data.mjs';

const SLUGS = SERVICES.map(s => s.slug);
const files = lang => SLUGS.map(s => (lang === 'de' ? 'de/' : '') + `request/${s}.html`);

test('generated pages are committed and up to date', () => {
  assert.equal(PAGES.length, 12);
  for (const p of PAGES) assert.equal(read(p.file), p.html, `${p.file}: run npm run build:requests`);
});

test('every form posts to Formspree and carries the required notes', () => {
  for (const [lang, notes] of [['en', ['All communication will be in English.', 'No VAT is charged under § 19 UStG.', 'In person means Berlin; travel outside Berlin is quoted separately.']],
                               ['de', ['Die gesamte Kommunikation erfolgt auf Englisch.', 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 'Vor Ort bedeutet Berlin; Reisen außerhalb Berlins werden separat berechnet.']]]) {
    for (const f of files(lang)) {
      const h = read(f), t = text(h);
      assert.ok(h.includes('action="https://formspree.io/f/myeegvqk"') && h.includes('method="POST"'), f);
      for (const n of notes) assert.ok(t.includes(n), `${f}: ${n}`);
      assert.ok(h.includes(`<html lang="${lang}">`), `${f}: lang`);
      assert.equal((h.match(/<fieldset class="step"/g) || []).length, 4, `${f}: four steps`);
      assert.ok(!/<fieldset class="step"[^>]*\bhidden\b/.test(h), `${f}: steps visible without JS`);
      assert.ok(!/<form[^>]*novalidate/.test(h), `${f}: browser validation without JS`);
      for (const n of ['deadline', 'format', 'name', 'email', 'billing_name', 'billing_address', 'country', 'consent'])
        assert.match(h, new RegExp(`name="${n}"[^>]*\\brequired\\b|\\brequired\\b[^>]*name="${n}"`), `${f}: ${n} required`);
      for (const n of ['service', 'language', '_subject', 'currency', 'estimate', '_gotcha', 'files_link', 'vat_id', 'po_number', 'invoice_email', 'organisation'])
        assert.ok(h.includes(`name="${n}"`), `${f}: ${n}`);
      assert.ok(h.includes(lang === 'de' ? 'href="/de/datenschutz.html"' : 'href="/datenschutz.html"'), `${f}: privacy link`);
      assert.ok(h.includes('id="site-header"') && h.includes('id="site-footer"'), `${f}: shared layout`);
    }
  }
});

test('English values on German forms', () => {
  const h = read('de/request/writing.html');
  assert.ok(h.includes('value="Scientific edit"'));
  assert.ok(h.includes('name="_subject" value="Invoice request: Scientific writing &amp; editing"'));
});

test('consulting and data analysis ask hourly or fixed', () => {
  for (const f of ['request/consulting.html', 'request/data-analysis.html']) {
    const h = read(f);
    assert.ok(h.includes('name="billing" value="hourly"') && h.includes('name="billing" value="fixed"') && h.includes('name="hours"'), f);
  }
});

test('hreflang pairs and sitemap', () => {
  const sm = read('sitemap.xml');
  for (const s of SLUGS) for (const page of [`request/${s}.html`, `de/request/${s}.html`]) {
    const h = read(page);
    assert.ok(h.includes(`<link rel="alternate" hreflang="en" href="https://stem-azing.com/request/${s}.html">`), page);
    assert.ok(h.includes(`<link rel="alternate" hreflang="de" href="https://stem-azing.com/de/request/${s}.html">`), page);
    assert.ok(sm.includes(`<loc>https://stem-azing.com/${page}</loc>`), `sitemap: ${page}`);
  }
});
```

- [ ] **Step 2: Run** — `node --test tools/requests.test.mjs`; Expected: FAIL, cannot find `./build-requests.mjs`.
- [ ] **Step 3: Implement `tools/build-requests.mjs`** (`renderPage`, `PAGES`, write files when run directly via `import.meta.url === pathToFileURL(process.argv[1]).href`). Escape `&`, `<`, `"` in all text and attributes.
- [ ] **Step 4: Generate** — `npm run build:requests`; Expected: 12 files written.
- [ ] **Step 5: Add the 12 URLs to `sitemap.xml`; add CSS** reusing `.card`, `.btn`, `.chip` look (checked checkbox chip = `.chip.is-active` colours), `.stepper` with terracotta current step as in mockup B (`.superpowers/brainstorm/413-1792705683/content/form-layout.html`), single column under 640px.
- [ ] **Step 6: Run** — `npm test`; Expected: all pass (including `links`, `hygiene`, `legal` footer check, `sitemap`).
- [ ] **Step 7: Commit** — `git add request de/request tools/build-requests.mjs tools/requests.test.mjs package.json sitemap.xml css/site.css && git commit -m "Request forms: generated EN and DE form pages"`.

---

### Task 4: Stepper, live estimate and submit in the browser

**Files:**
- Modify: `js/request.js` (add the browser IIFE below the pure functions, same pattern as `js/site.js`)

**Interfaces:**
- Consumes: DOM contract (Task 3), `estimate`/`estimateText`/`pickCurrency` (Task 2), `window.stemCurrency` is **not** used (separate page).

Behaviour:
- On load: set `form.noValidate = true`; currency = `pickCurrency(location.search)`, written to the `currency` select; show step 1 only (`hidden` on other fieldsets), mark `.stepper li` `aria-current="step"`.
- Next: validate only the current fieldset's fields with `checkValidity()`/`reportValidity()`; step 1 also requires at least one `sub_services` checkbox (message EN "Please choose at least one option." / DE „Bitte wählen Sie mindestens eine Option.“). Back never validates. Moving steps moves focus to the new `<legend>` and scrolls it into view.
- Quantity box appears (`hidden` toggled) only while its checkbox is ticked; `hours` only while `billing=hourly`; `other_text` only while "Other" is ticked. Unticking keeps the typed value but it is excluded from the estimate.
- Any `input`/`change` in the form → rebuild `lines` from ticked checkboxes (+ their qty) and the chosen `billing` radio, run `estimate`, render `estimateText` lines into `[data-estimate-lines]`, write the joined lines (`" · "`) into hidden `estimate`. Changing the `currency` select re-renders and swaps `budget` option labels to `data-eur`/`data-usd`.
- Submit: validate all steps (jump to the first invalid one); `fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })`; on `ok` hide the form, show `.thanks`, focus it; otherwise or on network error show `.form-status` with EN "Sorry, your request could not be sent. Please try again, or email stemazing.advancement@gmail.com." / DE „Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an stemazing.advancement@gmail.com.“, keep all entries, re-enable the submit button. Disable the submit button while sending.

- [ ] **Step 1: Implement the IIFE.**
- [ ] **Step 2: Run** — `npm test`; Expected: all pass (no Node DOM tests here; the pure functions stay tested).
- [ ] **Step 3: Manual check in the browser** — `python3 -m http.server 8091`, open `http://127.0.0.1:8091/request/writing.html?currency=USD` and `/de/request/consulting.html`. Check, with screenshots: Next blocks until a sub-service, deadline and format are set; tick Scientific edit + 6000 words → "Starting estimate: $1,440"; switch currency to EUR in step 3 → €1,320 and budget labels in €; Back to step 1 keeps everything; mobile width 375px has no sideways scroll; with JS disabled all four steps show. **Do not send a real submission** — block `formspree.io` in DevTools (Network request blocking) and confirm the error message appears and entries remain.
- [ ] **Step 4: Commit** — `git commit -am "Request forms: stepper, live estimate, Formspree submit"`.

---

### Task 5: Services pages link to the forms; email dialog removed

**Files:**
- Modify: `services.html`, `de/services.html` (each `<button … class="… pay-btn" data-service>` becomes `<a class="btn btn--primary btn--sm pay-btn" href="/request/<slug>.html">` / `href="/de/request/<slug>.html"`, same label; delete the `#payModal` block)
- Modify: `js/site.js` (delete `INVOICE_EMAIL`, `INVOICE_TEXT`, `buildInvoiceMail`, the dialog section and its keydown handler; keep `formatMoney` exported; header comment: replace the `.pay-btn` line with "`a.pay-btn` links get `?currency=` when the € / $ switch changes"; in `setCurrency` set each `a.pay-btn` href to its path + `?currency=` + cur)
- Modify: `tools/invoice.test.mjs` (keep the two `formatMoney` tests, drop the mail tests), `tools/release.test.mjs` (drop "invoice dialog keeps keyboard focus"), `tools/i18n.test.mjs` (German pay links point to `/de/request/`), `tools/prices.test.mjs` (`six request buttons` regex stays on `pay-btn`; add: each `pay-btn` href resolves to `request/<slug>.html` for its card), `README.md` ("Invoice requests" section: forms in `request/` and `de/request/`, generated from `tools/request-data.mjs` with `npm run build:requests`, sent through Formspree `myeegvqk`; prices must be changed in `services.html`, `de/services.html` **and** `tools/request-data.mjs`; structure table adds the request pages)

- [ ] **Step 1: Update the tests first** — in `tools/prices.test.mjs` `checkServices`, add after the button count:

```js
  const slugOf = { 'Guest lectures & workshops': 'lectures', 'Tutoring & mentorship': 'tutoring', 'Scientific writing & editing': 'writing',
    'Science communication': 'communication', 'Scientific consulting': 'consulting', 'Research & data analysis': 'data-analysis' };
  const pre = file.startsWith('de/') ? '/de' : '';
  for (const [name, c] of Object.entries(p)) assert.ok(c.html.includes(`href="${pre}/request/${slugOf[name]}.html"`), `${name}: links to its form`);
  assert.ok(!h.includes('id="payModal"'), 'old email dialog removed');
```

and in `tools/i18n.test.mjs` replace the `btns` lines with `assert.equal((h.match(/class="[^"]*pay-btn[^"]*" href="\/de\/request\//g) || []).length, 6);`. Drop the dialog test and the mail tests named above.
- [ ] **Step 2: Run** — `npm test`; Expected: FAIL on the new link and `payModal` assertions.
- [ ] **Step 3: Edit the two services pages, `js/site.js`, `README.md`.**
- [ ] **Step 4: Run** — `npm test`; Expected: all pass (`services.html` word count still ≤ 450).
- [ ] **Step 5: Manual check** — on `http://127.0.0.1:8091/services.html` switch to USD, click "Request an invoice" on Tutoring → lands on `/request/tutoring.html?currency=USD` showing $. Same on `/de/services.html`.
- [ ] **Step 6: Commit** — `git commit -am "Services: invoice buttons open the request forms"`.

---

### Task 6: Privacy policies name Formspree

**Files:**
- Modify: `datenschutz.html`, `de/datenschutz.html`, `tools/legal.test.mjs`

Section 3 is rewritten to cover the request forms. Add a new section "4. Request forms (Formspree)" / „4. Anfrageformulare (Formspree)“ and renumber the following sections. Content: the forms on the services pages send what you enter (name, email, organisation, billing and project details, file links) to Formspree, Inc. (USA), which forwards it to our Gmail mailbox and acts as our processor (Art. 28 GDPR); legal basis Art. 6(1)(b) GDPR, and 6(1)(f) for other enquiries; no data is sent before you press Send; retention as in section 3. **Transfer basis:** check Formspree's current privacy policy / DPA (WebFetch `https://formspree.io/legal/privacy-policy` and its DPA page). State exactly what it says (EU-US Data Privacy Framework → Art. 45; standard contractual clauses → Art. 46(2)(c)). If you cannot confirm it, write the SCC wording and report it to Nella as unverified. Keep the draft notes, and note in the report that this section needs the lawyer's read.

- [ ] **Step 1: Update `tools/legal.test.mjs`** — in `privacy policies`, add `'Formspree'` to the `has(...)` list and change the last assertion to `assert.ok(!/reCAPTCHA/.test(t), \`${f}: no reCAPTCHA\`);`.
- [ ] **Step 2: Run** — `npm test`; Expected: FAIL, "missing Formspree".
- [ ] **Step 3: Write both sections** (German in formal register; German version is binding).
- [ ] **Step 4: Run** — `npm test`; Expected: all pass (`release.test.mjs` legal bases still present).
- [ ] **Step 5: Commit** — `git commit -am "Privacy: Formspree section for the request forms"`.

---

### Finish (no push)

- [ ] `npm test` — all pass; paste the summary line.
- [ ] Preview for Nella at `http://127.0.0.1:8091/services.html`. List what she should check: the German labels, the privacy section's transfer basis, and that in **Formspree settings** reCAPTCHA is off for AJAX and the notification email goes to `stemazing.advancement@gmail.com`. Ask her for permission before one real test submission.
- [ ] Update `~/Documents/Obsidian/10 Neuropenetrance/Website/2026-10-22 — STEM-azing Redesign Progress.md` "Still to do": native-speaker review of `/de/request/`, lawyer reads the Formspree section.
- [ ] Merge to `main` and push **only** after Nella's explicit yes.
