# STEM-azing.com Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild stem-azing.com in Direction A ("Warm editorial") with fewer, shorter pages, new editing prices, legal pages and a German version of the main pages that stays hidden until reviewed.

**Architecture:** Plain static HTML on GitHub Pages, no build step. One new stylesheet (`css/site.css`) and one shared script (`js/site.js`) replace the two old stylesheets and `js/main.js`; `nav.js` keeps injecting header and footer on every page (including posts and `/de/`), using root-absolute URLs. Zero-dependency Node tests in `tools/` read the HTML files and pin the spec's facts (links, prices, legal text, language pairs, banned hosts).

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (ES2017, no modules in the browser), Node 22 `node --test` for checks.

**Spec:** `docs/superpowers/specs/2026-10-22-stem-azing-redesign-design.md` (mockups in `docs/superpowers/specs/mockups/`).

## Global Constraints

- Work on branch `redesign-2026`. **Never push.** Pushing `main` publishes live; Nella says "push" herself at the end.
- No new dependencies, no `package.json` dependencies, no CDN, no Google Fonts, no `static.wixstatic.com`. Only third party allowed: Calendly, loaded after a click.
- Colours: cream `#FBF7F1`, white `#FFFFFF`, deep blue `#1F3B4D`, terracotta `#B5523B`, peach `#F2C9A8`, sage `#5B7B6A`, hairline `#EADFD0`. Serif headings `Georgia, "Times New Roman", serif`; body `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Portrait: arch `border-radius: 200px 200px 18px 18px`, width 66% of its column, centred.
- Contact email everywhere: `stemazing.advancement@gmail.com`. Calendly: `https://calendly.com/nella-delva/new-meeting-2`.
- Prices (EUR / USD), exact: consulting 95/105 per hr, from 750/820; lectures 350/385; data analysis 90/99 per hr, from 900/985; language & clarity edit 150/165 per 1,000 words; scientific edit 220/240 per 1,000 words; grants & original writing from 800/880; science communication 180/198; tutoring 100/120 per session, 950/1000 for 10.
- VAT note EN: `No VAT is charged under § 19 UStG.` DE: `Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.` on every page that shows a price.
- Impressum: Nella Christie Delva, STEM-azing, Holzmarktstraße 73, 10179 Berlin, Deutschland, `stemazing.advancement@gmail.com`, booking page as second contact; no USt-IdNr.
- NeuroPenetrance facts, unchanged: six-gene whole-blood RNA signature; built on 1 study, tested unchanged on 7 others; 779 people; AUC 0.61; above chance in 8 of 8; neuron engine "in development"; "research use".
- Phone width ≥ 360 px with no horizontal scroll; menu usable by keyboard; every `<img>` has `alt`; WCAG AA contrast.
- Copy wording fixed by the spec (headlines, lede, band text) is used verbatim; see the spec section each task cites.
- German: formal "Sie", `<html lang="de">`, `/de/<same file name>`; hidden while `DE_LIVE = false` in `nav.js`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Old bookmarks** (`biography.html`, `portfolio.html`, `blog.html`, `portfolio.html#case-study-1`) must land on the right new page, not a 404. Pinned in Task 5 / Task 7 (`redirects.test.mjs`).
2. **A visitor switches to $ and then requests an invoice**: the email must show the $ amount and the § 19 note. Pinned in Task 4 (`invoice.test.mjs` exercises `buildInvoiceMail`).
3. **A post page or a `/de/` page loads the header with wrong relative links** (e.g. `/posts/services.html`). Pinned in Task 2 (`nav.test.mjs`, root-absolute URLs) and Task 9.
4. **German hidden but reachable:** while `DE_LIVE` is false, no page may link to `/de/` and the sitemap must not list it. Pinned in Task 11.
5. **A stray old email (`hello@stem-azing.com`) or "deposit invoice" wording survives in a page nobody looked at.** Pinned in Task 1 (`hygiene.test.mjs`, run on every task).

---

## File Structure

| Path | Responsibility |
|---|---|
| `css/site.css` | Direction A tokens + all components (create; replaces `styles.css`, `css/style.css`) |
| `js/site.js` | currency switch, invoice dialog, filter chips, Calendly click-to-load (create; replaces `js/main.js` and inline scripts) |
| `nav.js` | header/footer injection, menu labels EN/DE, language switch, `DE_LIVE` (rewrite) |
| `img/` | self-hosted photos formerly on Wix (create) |
| `index.html`, `services.html`, `neuropenetrance.html`, `booking.html`, `consulting-portfolio.html` | rewritten in place |
| `about.html`, `writing.html`, `impressum.html`, `datenschutz.html` | new |
| `biography.html`, `portfolio.html`, `blog.html` | become redirect stubs |
| `posts/*.html` (16) | restyled, same text |
| `de/*.html` | German main + legal pages |
| `tools/site.mjs` | test helpers; `tools/*.test.mjs` the checks |
| `package.json` | `{"private":true,"type":"module","scripts":{"test":"node --test tools/"}}` |

---

### Task 1: Test harness and site hygiene checks

**Files:**
- Create: `package.json`, `tools/site.mjs`, `tools/links.test.mjs`, `tools/hygiene.test.mjs`

**Interfaces:**
- Produces (`tools/site.mjs`):
  - `sourceFiles(exts: string[]) => string[]` (same exclusions as `htmlFiles`, plus `tools/`)
  - `ROOT: string` (repo root)
  - `htmlFiles(opts?: {includeMockups?: boolean}) => string[]` (repo-relative, excludes `docs/`, `.superpowers/`, `node_modules/`)
  - `read(rel: string) => string`
  - `refs(html: string) => string[]` (all `href`/`src` values)
  - `resolveRef(fromRel: string, ref: string) => string | null` (repo-relative target file, `null` for external/mailto/tel/`#`-only; strips `?`/`#`; `/x` is root-absolute; a path ending `/` maps to `index.html`)
  - `text(html: string) => string` (visible text: strips `<script>`, `<style>`, tags, collapses whitespace)
  - `wordCount(html: string, selector?: 'main') => number` (words in `<main>…</main>` if present)

- [ ] **Step 1: Write the failing tests**

`links.test.mjs`: `test('every internal link and asset resolves')` — for each `htmlFiles()`, every non-null `resolveRef` exists on disk (collect all misses, assert the list equals `[]`).
`hygiene.test.mjs`, one `test` each, scanning every `.html`, `.css` and `.js` file outside `docs/`, `.superpowers/`, `tools/`, all asserting an empty list of offending files:
- `no wixstatic`: no file contains `static.wixstatic.com`
- `no google fonts`: no file contains `fonts.googleapis.com` or `fonts.gstatic.com`
- `no deposit invoice`: no file matches `/deposit invoice/i`
- `only the official email`: every `mailto:` address equals `stemazing.advancement@gmail.com`
- `every img has alt`: every `<img` tag has an `alt=` attribute

- [ ] **Step 2: Run** `npm test`. Expected: links PASS; `no wixstatic`, `no google fonts`, `only the official email` (blog.html `hello@stem-azing.com`) FAIL. These stay red until Tasks 2/7/9; that is the to-do list.

- [ ] **Step 3: Commit** `test: site check harness (links, hygiene)`.

### Task 2: Design system, shared script and header/footer

**Files:**
- Create: `css/site.css`, `js/site.js`, `img/` (+ downloaded photos), `tools/nav.test.mjs`
- Modify: `nav.js` (rewrite)

**Interfaces:**
- Produces (`nav.js`, also `module.exports` when `typeof module !== 'undefined'`):
  - `DE_LIVE = false`
  - `langOf(pathname: string) => 'en' | 'de'` (`/de/…` → `'de'`)
  - `navLinks(lang) => {href: string, label: string}[]` — EN: Home `/`, Services `/services.html`, About `/about.html`, NeuroPenetrance `/neuropenetrance.html`, Writing `/writing.html`; DE: Start `/de/`, Leistungen `/de/services.html`, Über mich `/de/about.html`, NeuroPenetrance `/de/neuropenetrance.html`, Texte `/de/writing.html`
  - `ctaLabel(lang)` → `Book a free call` / `Kostenloses Gespräch buchen`; CTA href `/booking.html` or `/de/booking.html`
  - `alternateUrl(pathname, toLang) => string | null` — `/services.html`↔`/de/services.html`, `/`↔`/de/`; `/posts/…` → `null`; returns `null` whenever `DE_LIVE` is false
  - `footerLinks(lang)` includes Impressum `/impressum.html` (DE `/de/impressum.html`) and Privacy / Datenschutz `/datenschutz.html` (`/de/datenschutz.html`), plus LinkedIn, X, Instagram as today
  - Browser side: on `DOMContentLoaded`, fills `#site-header` and `#site-footer`; marks the active link (`aria-current="page"`); phone menu toggle is a `<button aria-expanded>`.
- Produces (`css/site.css`) component classes used by all page tasks: `.kicker`, `.btn`, `.btn--primary` (deep blue), `.btn--accent` (terracotta), `.btn--outline`, `.section`, `.section--white`, `.band--navy`, `.band--peach`, `.card`, `.grid-2`, `.grid-3`, `.photo-arch`, `.badge-float`, `.price`, `.price-note`, `.proof` (✓ list), `.chips`/`.chip`/`.chip.is-active`, `.steps`, `.cta-band`, `.modal`, `.prose` (post reading width ≈ 68ch), `.vat-note`.
- Produces (`js/site.js`), wired by data attributes so pages need no inline script:
  - currency: buttons `[data-currency="EUR|USD"]`; elements `.amount[data-eur][data-usd]` keep their `.unit` child (as today); `.amount-project[data-eur][data-usd]`; default currency `EUR`
  - chips: today's `[data-filter-group]` / `.chip[data-filter]` / `[data-tags]` contract, unchanged
  - Task 4 and Task 8 add the invoice dialog and Calendly loader here.

- [ ] **Step 1: Write the failing test** `nav.test.mjs` (require `nav.js` via `createRequire`):
```js
assert.deepEqual(navLinks('en').map(l => l.label), ['Home','Services','About','NeuroPenetrance','Writing']);
assert.deepEqual(navLinks('de').map(l => l.href), ['/de/','/de/services.html','/de/about.html','/de/neuropenetrance.html','/de/writing.html']);
assert.ok(navLinks('en').every(l => l.href.startsWith('/')));
assert.equal(langOf('/de/services.html'), 'de'); assert.equal(langOf('/posts/x.html'), 'en');
assert.equal(alternateUrl('/services.html','de'), null);           // DE_LIVE false
assert.ok(footerLinks('de').some(l => l.href === '/de/impressum.html'));
```
- [ ] **Step 2: Run** `node --test tools/nav.test.mjs`. Expected: FAIL (`navLinks is not a function`).
- [ ] **Step 3: Implement** `nav.js` per the interface; `alternateUrl` logic is testable with `DE_LIVE` true via an exported `_setDeLive(bool)` used only by tests (add a test case for `/services.html`→`/de/services.html`, `/`→`/de/`, `/posts/a.html`→`null`).
- [ ] **Step 4: Write `css/site.css`** from the mockups (`docs/superpowers/specs/mockups/*.html`, class prefix `.ma` there) using the component names above and the Global Constraints tokens; mobile-first, single column under 760 px.
- [ ] **Step 5: Self-host images.** Download each distinct `https://static.wixstatic.com/...` URL still referenced by a page that survives (services, biography → about) into `img/` with descriptive names (`img/lecture.jpg`, …); keep `headshot.jpg` at root or move to `img/headshot.jpg` and update refs.
- [ ] **Step 6: Run** `npm test`. Expected: nav PASS; links PASS.
- [ ] **Step 7: Commit** `feat: Direction A design system, shared script, new header/footer`.

### Task 3: Home page (EN)

**Files:** Modify `index.html`; Create `tools/pages.test.mjs`

**Interfaces:** Consumes Task 2 classes and `nav.js`. Produces the page skeleton every later page copies: `<html lang="en">`, `<body data-page="…">`, `<header id="site-header">`, `<main>`, `<footer id="site-footer">`, `<link rel="stylesheet" href="/css/site.css">`, `<script src="/nav.js" defer>`, `<script src="/js/site.js" defer>`.

- [ ] **Step 1: Failing test** in `pages.test.mjs`, `test('home')`:
```js
const h = read('index.html'), t = text(h);
for (const s of ['Curiosity is currency for success','Science made clear, for every classroom, page and lab.',
  "I'm Dr. Nella C. Delva, a neuroscientist and writer in Berlin. I partner with educators, authors and research teams to communicate complex science with clarity, accuracy and impact.",
  'Choose what fits you','For educators','For writing','For research teams','Ghostwriting also offered',
  'Bench to page','Clear for anyone','Haiti → USA → Berlin','Not sure where to start?','No VAT is charged under § 19 UStG.'])
  assert.ok(t.includes(s), s);
assert.ok(h.includes('/css/site.css') && !h.includes('styles.css'));
assert.ok(wordCount(h) <= 300);
```
Also `test('home shows the 3 newest posts')`: the three `posts/…` links in the blog section are the first three entries of today's blog archive (`organoids-vs-animal-models.html`, `research-without-borders.html`, `full-circle-fulbright.html`), in that order.
- [ ] **Step 2: Run** `node --test tools/pages.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Rewrite `index.html`** per spec §4.2 and `mockups/home-a.html` (headline emphasis `<em>clear</em>`; Writing card shows "from €150/1k"; service links go to `/services.html#educators`, `#writing`, `#research`).
- [ ] **Step 4: Run** `npm test`. Expected: home PASS, earlier tests unchanged.
- [ ] **Step 5: Commit** `feat(home): Direction A home page`.

### Task 4: Services page, prices, invoice dialog

**Files:** Modify `services.html`, `js/site.js`; Create `tools/prices.test.mjs`, `tools/invoice.test.mjs`

**Interfaces:**
- Card markup contract: `<article class="card service" data-service="<Name>">` containing `.amount[data-eur][data-usd]` (headline price) and optional `.amount-project`; request button `button.pay-btn[data-service]`. Group sections have ids `educators`, `writing`, `research`.
- `js/site.js` exports for tests (`module.exports` guard): `buildInvoiceMail({service, symbol, amount, currency, lang}) => {subject: string, href: string}` — subject `Invoice request: <service>` (DE `Rechnungsanfrage: <service>`), body includes the starting rate and the VAT note of `lang`, href `mailto:stemazing.advancement@gmail.com?subject=…&body=…`.

- [ ] **Step 1: Failing tests.** `prices.test.mjs` parses `services.html` into `{service: {eur, usd}}` from each card's `.amount` and asserts:
```js
{'Scientific consulting':['95','105'],'Guest lectures & workshops':['350','385'],'Research & data analysis':['90','99'],
 'Scientific writing & editing':['150','165'],'Science communication':['180','198'],'Tutoring & mentorship':['100','120']}
```
plus: the editing card text contains `220` and `800` (and data-usd `240`, `880`), project prices `750/820`, `900/985`, `950/1000`; page text includes `Six ways to work together`, `Ghostwriting also offered`, `See a sample deliverable` (href `/consulting-portfolio.html`), `No VAT is charged under § 19 UStG.`; exactly 6 `.pay-btn`; each card has exactly two `.proof li`; `wordCount ≤ 450`.
`invoice.test.mjs`: `buildInvoiceMail({service:'Scientific consulting',symbol:'$',amount:'105/hr',currency:'USD',lang:'en'})` → subject `Invoice request: Scientific consulting`; decoded body includes `$105/hr` and `No VAT is charged under § 19 UStG.`; href starts `mailto:stemazing.advancement@gmail.com?`. Same call with `lang:'de'` → subject starts `Rechnungsanfrage:` and body includes the DE VAT note.
- [ ] **Step 2: Run** `node --test tools/prices.test.mjs tools/invoice.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Rewrite `services.html`** per spec §4.3/§4.4 and `mockups/services-a.html` option 2 (no card photos; three steps band; € / $ buttons; modal markup with ids `payModal`, `payModalService`, `payModalAmount`, `invoiceLink`). Proof points: keep two of today's three bullets per service (writing group as in the mockup).
- [ ] **Step 4: Move** the currency and modal logic from the old inline script into `js/site.js`; the dialog reads the current currency and calls `buildInvoiceMail`. Remove the inline `<script>` from the page.
- [ ] **Step 5: Run** `npm test`. Expected: PASS for prices, invoice and all earlier tests.
- [ ] **Step 6: Manual check** in a browser at `http://localhost:8091/services.html`: toggle $, click a request button, the dialog shows `$105/hr`; the email link opens with the $ amount.
- [ ] **Step 7: Commit** `feat(services): grouped cards with proof, two-level editing prices, § 19 note`.

### Task 5: About page and old-URL redirects

**Files:** Create `about.html`, `tools/redirects.test.mjs`; Modify `biography.html` → redirect stub; `portfolio.html` → redirect stub

**Interfaces:** Redirect stub contract (reused in Task 7): full HTML document with `<meta http-equiv="refresh" content="0; url=/target.html">`, `<link rel="canonical" href="https://stem-azing.com/target.html">`, `<meta name="robots" content="noindex">`, and a visible `<a href="/target.html">`; a tiny inline script keeps the `#hash` (`location.replace('/target.html' + location.hash)`).

- [ ] **Step 1: Failing tests.** `pages.test.mjs` `test('about')`: text includes `I make science clear, for whoever is in the room.`, `One idea, three audiences`, `Can inflammation in the body affect depression?`, `For a student`, `For a curious reader`, `For a research team`, `Haiti → Florida → Berlin`, `where curiosity began`, `McKnight`, `Have something that needs to be clear?`; does **not** include `where I grew up`; `wordCount ≤ 380`.
`redirects.test.mjs`: `{'biography.html':'/about.html','portfolio.html':'/consulting-portfolio.html'}` — each stub's meta refresh url and canonical match, and contains `location.hash`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Write `about.html`** from spec §4.5 and `mockups/about-a.html` (photo at the smaller size; quick facts: PhD FSU · Fulbright Fellow MDC Berlin · McKnight Fellow · Founder, NeuroPenetrance · 4 languages). Replace the two stubs.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(about): About page; biography/portfolio redirect`.

### Task 6: Consulting portfolio (absorbs Advising)

**Files:** Modify `consulting-portfolio.html`

- [ ] **Step 1: Failing test** `pages.test.mjs` `test('consulting portfolio')`: ids `case-study-1` and `case-study-2` exist; text includes `Le Wagon`, `Python`, `SQL`, `Starter`, `Standard`, `Advanced`, `Grant`; links to `/services.html#research` and `/booking.html`; uses `/css/site.css`; contains the six-gene/779/0.61 wording only if it mentions NeuroPenetrance at all (if present, `779` and `0.61` must both appear).
- [ ] **Step 2: Run.** Expected: FAIL (old stylesheet).
- [ ] **Step 3: Rewrite** in the new look: intro, the Advising data-science pillar (toolkit, Le Wagon, dashboards), consulting / grant / mentoring blurbs, the two case studies (keep their content, trimmed), the three tiers, closing call band. No numbers changed.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(portfolio): consulting portfolio restyled, absorbs Advising`.

### Task 7: Writing page and blog redirect

**Files:** Create `writing.html`; Modify `blog.html` → redirect stub (to `/writing.html`)

- [ ] **Step 1: Failing tests.** `pages.test.mjs` `test('writing')`: text includes `Rigorous enough for peer review. Clear enough for everyone else.`, `may potentially have possibly had` (the before/after edit), `Written for different readers`, `Peer-reviewed and published`, `Need writing like this?`, `Editing from €150 per 1,000 words; scientific edits €220.`, `Ghostwriting also offered`, `No VAT is charged under § 19 UStG.`; chips `all`, `scientist`, `medical`, `general`, `career` exist; the BDNF sample says `co-authored`; the archive links all 16 files in `posts/` and nothing to `/post/` (old Wix); no `Two ways to work with a scientist who writes`.
`redirects.test.mjs`: add `'blog.html':'/writing.html'`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write `writing.html`** per spec §4.6 and `mockups/writing-a.html`; the samples keep today's `data-tags`; the publications band links to Google Scholar (`https://scholar.google.com/citations?user=in0k0HcAAAAJ&hl=en`, already on the page). Replace `blog.html` with the stub.
- [ ] **Step 4: Run** `npm test`. Expected: PASS, and the `only the official email` hygiene test now passes (the `hello@` address lived in `blog.html`).
- [ ] **Step 5: Commit** `feat(writing): Writing page replaces blog page`.

### Task 8: NeuroPenetrance and Booking pages

**Files:** Modify `neuropenetrance.html`, `booking.html`, `js/site.js`

**Interfaces:** `js/site.js` Calendly loader: a `button[data-calendly-load]` inside `.calendly-slot[data-url]`; on click it inserts `.calendly-inline-widget` with that `data-url` and appends `https://assets.calendly.com/assets/external/widget.js`. A plain `<a href>` to the Calendly URL sits beside it.

- [ ] **Step 1: Failing tests** `pages.test.mjs`:
  - `neuropenetrance`: text includes `six-gene`, `779`, `0.61`, `8 of 8`, `in development`, `research use`; links to `https://neuropenetrance.com`; link text `Try the PenetranSci demo` with `target="_blank"` to `https://neuropenetrance.streamlit.app`; no `<iframe`.
  - `booking`: no `<script` with `calendly` in the static HTML; contains `data-url="https://calendly.com/nella-delva/new-meeting-2"` and a plain link to the same URL; text includes `20 minutes, free` and `stemazing.advancement@gmail.com`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Rewrite both pages** in the new look (NeuroPenetrance text from the 21 Oct version, lightly trimmed, facts unchanged); add the loader to `js/site.js`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Manual: click "Show calendar" on `http://localhost:8091/booking.html`, the calendar appears.
- [ ] **Step 5: Commit** `feat: NeuroPenetrance and Booking pages; Calendly loads on click`.

### Task 9: Blog posts restyle (16)

**Files:** Modify `posts/*.html`

- [ ] **Step 1: Failing test** `pages.test.mjs` `test('posts use the shared layout')`: for each `posts/*.html`: has `id="site-header"` and `id="site-footer"`, no hard-coded `<nav class="site-nav">`, links `/css/site.css`, loads `/nav.js`, body text wrapped in `.prose`; and the post's article text is unchanged (compare `text()` of the `<article>` element to a snapshot taken from `git show main:posts/<file>` inside the test).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Convert** each post with one small script (kept out of the repo, e.g. in the scratchpad): replace head font/style links and the hard-coded nav/footer, keep `<header class="article-hero">` and `<article>` content, add `.prose`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS; `no google fonts` stays red until Task 12 deletes `styles.css` (its `@import`).
- [ ] **Step 5: Commit** `feat(posts): new look for all 16 posts, text unchanged`.

### Task 10: Legal pages (EN + DE)

**Files:** Create `impressum.html`, `datenschutz.html`, `de/impressum.html`, `de/datenschutz.html`; Create `tools/legal.test.mjs`

- [ ] **Step 1: Failing tests** `legal.test.mjs`:
  - `de/impressum.html` text includes `Angaben gemäß § 5 DDG`, `Nella Christie Delva`, `STEM-azing`, `Holzmarktstraße 73`, `10179 Berlin`, `stemazing.advancement@gmail.com`, a link to `/de/booking.html`, `Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`; no `USt-IdNr`.
  - `impressum.html` has the same details plus `The German version is the legally binding one.`
  - both `datenschutz` pages mention `GitHub`, `Calendly`, and email contact; the DE page names the controller (`Verantwortliche`) with the same address; both state no analytics or tracking; both carry a visible draft-review note (`class="draft-note"`).
  - every page in `htmlFiles()` except redirect stubs has a footer (`id="site-footer"`) — the links come from `nav.js` `footerLinks`, already tested.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write the four pages** (structure modelled on `~/code/nelladelva/projects/neuropenetrance-site/src/pages/{de,en}/impressum.html` and `datenschutz.html`; adapt processors: GitHub Pages, Calendly on click, email; no Formspree, no reCAPTCHA).
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(legal): Impressum and privacy policy (DE binding, EN)`.

### Task 11: German main pages (hidden)

**Files:** Create `de/index.html`, `de/services.html`, `de/about.html`, `de/writing.html`, `de/neuropenetrance.html`, `de/booking.html`, `de/consulting-portfolio.html`; Create `tools/i18n.test.mjs`

- [ ] **Step 1: Failing tests** `i18n.test.mjs`:
  - `EN_MAIN = ['index.html','services.html','about.html','writing.html','neuropenetrance.html','booking.html','consulting-portfolio.html','impressum.html','datenschutz.html']` — each has `de/<same>` and each DE file has `lang="de"`.
  - `de/services.html` prices parse to the same map as Task 4 (reuse the parser from `prices.test.mjs`, export it) and contain `Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`; its `.pay-btn` buttons carry `data-lang="de"`.
  - DE pages use formal address: none of the regexes `/\b(du|dich|dir|dein\w*)\b/i` match `text()`.
  - DE pages link to posts as `/posts/…` (English) and those links are marked `hreflang="en"`.
  - **Hidden while not live:** with `DE_LIVE` false in `nav.js`, no non-`de/` page contains `href="/de/`, no page has `hreflang="de"`, and `sitemap.xml` contains no `/de/`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Write the German pages** (natural business German, "Sie", German number format "1.000 Wörter", € default). Same markup and data attributes as the EN page.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(de): German main pages (hidden until reviewed)`.
- Going live later (not part of this plan run): set `DE_LIVE = true`, add `hreflang` alternates to EN/DE pairs and `/de/` URLs to the sitemap, and flip the "hidden" test to the "live" variant. Only after Nella's native-speaker review.

### Task 12: Clean-up, sitemap, README

**Files:** Delete `styles.css`, `css/style.css`, `js/main.js`; Modify `sitemap.xml`, `README.md`; Create `tools/sitemap.test.mjs`

- [ ] **Step 1: Failing test** `sitemap.test.mjs`: every `<loc>` in `sitemap.xml` maps (via `https://stem-azing.com/` prefix) to an existing, non-redirect file; it lists `about.html`, `writing.html`, `consulting-portfolio.html`, `impressum.html`, `datenschutz.html` and all 16 posts; it does not list `cv.html`, `biography.html`, `portfolio.html`, `blog.html`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3:** Update `sitemap.xml`; delete the three old files (`npm test` link check proves nothing references them); rewrite `README.md` sections: structure, how to edit prices (`data-eur`/`data-usd` in `services.html` **and** `de/services.html`), § 19 note, `DE_LIVE` switch, `npm test`, "push = live".
- [ ] **Step 4: Run** `npm test`. Expected: **all tests PASS**, including every hygiene test.
- [ ] **Step 5: Manual pass** at 360 px and desktop width on every EN page (`python3 -m http.server 8091`): no horizontal scroll, menu opens by keyboard, € / $ works, dialog works, Calendly loads on click.
- [ ] **Step 6: Commit** `chore: remove old styles/scripts, update sitemap and README`.

---

## Hand-off to Nella (after the final review)

Show every EN page in the browser; list the copy she must proof-read (three audience texts, Haiti line, trimmed NeuroPenetrance and portfolio text, the German pages for the native speaker). Nothing is merged or pushed until she says "push".
