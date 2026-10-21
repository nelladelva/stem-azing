# STEM-azing.com redesign — design

**Date:** 2026-10-22 · **Owner:** Nella C. Delva, PhD · **Repo:** `nelladelva/stem-azing` (GitHub Pages, CNAME `stem-azing.com`)
**Status:** builder-checked; awaiting Nella's approval. Nothing is built until she approves this document.
**Mockups** (approved direction and pages): `docs/superpowers/specs/mockups/` — `directions.html` (Direction A chosen), `home-a.html`, `services-a.html` (option 2 "Short + proof" chosen), `about-a.html`, `writing-a.html`. They are visual-companion fragments (no `<html>` wrapper; images referenced as `/files/headshot.jpg` = repo `headshot.jpg`).

---

## 1. Intent — why this exists

Nella likes her content but the site looks dated and says too much. Visitors cannot quickly tell **what she offers** and **why they should work with her**. The redesign must:

- look **more professional and more inviting**;
- win two main audiences: **educators** and **people who need a scientific writer** (research teams are the third, smaller group);
- feel welcoming to people of **diverse backgrounds**;
- prove her core strength, in her words: *"I can make science clear, interpretable and understandable across many audiences."*

Success = a first-time visitor understands within one screen what she does, sees prices without hunting, and has an obvious next step (book a free 20-minute call or request an invoice).

## 2. Goals, non-goals, anti-goals

**Goals**
- New visual identity (Direction A, "Warm editorial") on every page, including the 16 blog posts.
- Much less text on the main pages (targets below), same substance.
- Services grouped by who the visitor is.
- New two-level editing prices.
- A German version of the main pages.
- Fewer, clearer pages and menu labels.

**Non-goals**
- No new services, no CMS, no build system or framework. It stays plain HTML/CSS/JS on GitHub Pages, free and editable by hand.
- Blog posts are **not** rewritten or translated; only restyled.
- No online payment. Invoice requests by email stay.

**Anti-goals (a failure even if it "works")**
- Looking like a generic template or a corporate SaaS page; losing her warmth and personal story.
- Overclaiming science. NeuroPenetrance numbers must stay exactly as honest as today (6-gene whole-blood RNA signature, built on 1 study, tested unchanged on 7 others, 779 people, AUC 0.61, above chance in 8 of 8; neuron engine "in development"; research use only).
- Machine-sounding German.
- Breaking existing links (old URLs must keep working).
- Breaking the € / $ switch or the invoice dialog.

## 3. Constraints

- **Hosting:** GitHub Pages from `main`. **Pushing to `main` publishes live**; every push needs Nella's explicit "push".
- **Work on a branch** (e.g. `redesign-2026`); preview locally (`python3 -m http.server 8091` from the repo root).
- No dependencies beyond what exists today (Calendly embed). Self-contained CSS/JS.
- Must work at phone width (≥ 360 px) with no horizontal scroll; keyboard-accessible menu; images with `alt` text; colour contrast WCAG AA.
- Contact/invoice email stays `stemazing.advancement@gmail.com`; Calendly stays `https://calendly.com/nella-delva/new-meeting-2`.

## 4. Decided by Nella

### 4.1 Look — Direction A, "Warm editorial"
- Colours: cream `#FBF7F1` (page), white `#FFFFFF` (sections), deep blue `#1F3B4D` (headings, primary buttons, dark bands), terracotta `#B5523B` (accents, kicker labels, main call-to-action "Book a free call"), peach `#F2C9A8` (highlights on dark, NeuroPenetrance strip, closing bands), sage `#5B7B6A` (✓ marks, secondary accent), card hairline `#EADFD0`.
- Type: serif headings (Georgia-style), clean sans-serif body (system UI). Small uppercase terracotta "kicker" labels above section headings.
- Shapes: pill-shaped buttons, soft rounded cards (≈16 px radius), generous spacing.
- Portrait in an **arch** frame (`border-radius: 200px 200px 18px 18px`), shown at **two-thirds of its column width**, centred (Nella asked for the photo 1/3 smaller).

### 4.2 Home (`index.html`) — mockup `home-a.html`
1. Kicker: her tagline **"Curiosity is currency for success"**.
2. Headline: **"Science made *clear*, for every classroom, page and lab."**
3. Lede (approved wording, exact): **"I'm Dr. Nella C. Delva, a neuroscientist and writer in Berlin. I partner with educators, authors and research teams to communicate complex science with clarity, accuracy and impact."**
4. Buttons: "See services & prices" → Services; "Book a free 20-min call" → Booking. Portrait with badge "Fulbright Fellow · PhD / 15+ years in research".
5. **"Choose what fits you"**: three cards (For educators / For writing / For research teams), each listing its services with a short starting price and a link to that group on Services. Writing card shows "Ghostwriting also offered" under Scientific writing & editing.
6. Navy **"why"** band: *Bench to page* — A working scientist, so the science is right. · *Clear for anyone* — Writing that experts trust and students follow. · *Haiti → USA → Berlin* — A first-generation path that shapes how I teach and mentor.
7. Peach **NeuroPenetrance** strip: two lines + "Explore the project →".
8. **From the blog**: the 3 newest posts (real titles, linked).
9. Closing band: "Not sure where to start?" / "Tell me what you're working on. 20 minutes, free." + "Book a free call".
- The long education timeline leaves Home (it lives on About in short form).

### 4.3 Services (`services.html`) — mockup `services-a.html`, option 2 "Short + proof"
- Heading **"Six ways to work together"**, line "Pick what fits. Not sure? Book a free 20-minute call and we figure it out together.", three jump buttons to the groups.
- **Three groups**, each with a kicker + short heading:
  - **For educators** — "Teaching that reaches every student": Guest lectures & workshops; Tutoring & mentorship.
  - **For writing** — "Words that experts trust and readers follow": Scientific writing & editing (with the line **"Ghostwriting also offered"** under its name); Science communication.
  - **For research teams** — "A scientist on your side": Scientific consulting; Research & data analysis. Plus a link **"See a sample deliverable"** → consulting portfolio page.
- **Each card:** name · one line on what it is · **two ✓ proof points** (picked from today's three bullets) · price + note · buttons **"Request an invoice"** and **"Ask first"** (→ Booking).
- Navy band at the end with the three steps: **1 · Free call** (20 minutes to agree on the scope) → **2 · 50% invoice** (paying it books your spot) → **3 · 50% on delivery**.
- Keep: € / $ switch, the invoice dialog (mailto to `INVOICE_EMAIL`, subject `Invoice request: <service>`, shows the service's starting rate).
- Card photos are dropped. Target ≈ 350 words (today ≈ 900).

### 4.4 Prices (new editing prices; all others unchanged)
| Service | EUR | USD |
|---|---|---|
| Scientific consulting | €95/hr, or from €750 per project | $105/hr, from $820 |
| Guest lectures & workshops | €350 / session (up to 90 min); multi-session quoted | $385 |
| Research & data analysis | €90/hr, or from €900 per project | $99/hr, from $985 |
| **Scientific writing & editing — Language & clarity edit** | **€150 / 1,000 words** | **$165** |
| **Scientific writing & editing — Scientific (substantive) edit** | **€220 / 1,000 words** | **$240** |
| **Grants & original writing (incl. ghostwriting)** | **from €800 per project** | **from $880** |
| Science communication | €180 / piece; packages available | $198 |
| Tutoring & mentorship | €100 / session, or €950 for 10 sessions | $120, $1,000 |

The editing card's headline price reads "from €150 / 1,000 words" with the note "scientific edit €220 · grants & writing from €800". Elsewhere (Home, Writing page) editing shows "from €150". The new prices go live **only with the redesign**, not before.

### 4.5 About (`about.html`, new) — mockup `about-a.html`
- Replaces **Biography** and **Advising**.
- Kicker "About Dr. Nella C. Delva"; headline **"I make science *clear*, for whoever is in the room."**; short lede; arched portrait at the smaller size.
- **"One idea, three audiences"**: the question *"Can inflammation in the body affect depression?"* explained for **a student**, **a curious reader**, **a research team** (draft wording in the mockup; Nella to proof-read).
- **"Haiti → Florida → Berlin"**: one line per place. Haiti line uses her existing wording "where curiosity began" (the mockup's "where I grew up…" was invented and must not ship).
- Navy quick-facts strip: PhD (FSU) · Fulbright Fellow (MDC Berlin) · Founder, NeuroPenetrance · 4 languages (English, French, Haitian Creole, German basic).
- Closing: "Have something that needs to be clear?" + "Book a free call" / "See services".
- Target ≈ 300 words (Biography + Advising today ≈ 960).

### 4.6 Writing (`writing.html`, replaces `blog.html`) — mockup `writing-a.html`
Built **mostly for clients judging her writing**, secondarily for readers.
1. Kicker "Writing & editing"; headline **"Rigorous enough for peer review. *Clear* enough for everyone else."**; buttons "See samples" / "Writing prices".
2. Her existing **before → after edit** card (same text as today) beside the headline.
3. **Samples by reader**, filter chips: All · Scientists · Health professionals · The public · Career & culture (map from today's `data-tags`: scientist / medical / general / career). The BDNF review is labelled "co-authored".
4. Navy band "Peer-reviewed and published" → link to publications (existing publications section content, condensed).
5. **For readers**: latest 3 posts + "All posts →" (the full archive stays on this page below, or as an expandable list — builder's choice).
6. Closing: "Need writing like this?" / "Editing from €150 per 1,000 words; scientific edits €220. Ghostwriting also offered." + "Request a quote".
- The duplicated "Two ways to work with a scientist who writes" services section is removed. Target ≈ 400 words of page copy plus post titles (today ≈ 1,700).

### 4.7 German version
- German translation of the **main pages**: Home, Services, About, Writing, NeuroPenetrance, Booking, Consulting portfolio, plus the new legal pages (§4.9). **Blog posts stay English only**; German pages link to them as they are (labelled "(auf Englisch)" or similar).
- Structure: German pages under `/de/` with the same file names (`/de/index.html`, `/de/services.html`, …). Language switch **EN | DE** in the header, linking to the same page in the other language. `<html lang>`, `hreflang` alternates, and the sitemap cover both.
- Style: natural business German, formal **"Sie"**, not word-for-word. On German pages € is the default currency (the € / $ switch stays). German number format (€ 150, 1.000 Wörter).
- **A native German speaker reviews the German before it goes live** (Nella arranges this). Until then the German pages are not pushed.

## 5. Also decided in conversation (Claude's proposals, not objected to)

- **Menu:** Home · Services · About · NeuroPenetrance · Writing, plus a terracotta **"Book a free call"** button; same items in a phone menu; EN | DE switch.
- **NeuroPenetrance page:** text from the 21 Oct rewrite stays (lightly trimmed); new look; clear button to `https://neuropenetrance.com`. Factual tone (partners/investors).
- **Booking page:** new look only; keeps the Calendly embed, the email address and "20 minutes, free".
- **Consulting portfolio** (`consulting-portfolio.html`): stays as its own page (case studies + Starter/Standard/Advanced tiers), restyled and trimmed, linked from "For research teams" as "See a sample deliverable". Not in the main menu.
- **Old URLs keep working:** `biography.html` and `portfolio.html` → `about.html`; `blog.html` → `writing.html` (GitHub Pages has no server redirects: use small redirect pages with `<meta http-equiv="refresh">` + `rel="canonical"` + a visible link).
- **All 16 blog posts** get the new look (same text), with a comfortable reading width.
- Every page ends with a free-call invitation.

## 6. Claude's calls (builder may refine; Nella can veto)

- **One stylesheet.** Today there are two (`styles.css` for main pages, `css/style.css` for blog and posts) with different palettes. Replace with one new stylesheet holding the Direction A tokens; delete the unused one at the end.
- **Shared header/footer** stay injected by `nav.js` (it already does this), extended for the language switch and German labels.
- **Images:** several pages load photos from `static.wixstatic.com` (old Wix host). Download the ones still used into the repo (`img/`) so the site does not depend on Wix.
- **Fonts:** don't load Google Fonts from Google's servers (a German privacy issue). Use the system serif and sans stacks shown in the mockups, or self-host the fonts in the repo.
- **Calendly** sets cookies. On the Booking page, load it **only after a click** ("Show calendar"), with a plain link to Calendly as a fallback.
- `sitemap.xml` is updated (it lists a `cv.html` that doesn't exist).
- `README.md` is updated for the new structure and prices.

## 7. Legal pages (needed for a Berlin business site)

stem-azing.com currently has **no Impressum and no privacy policy**. A commercial site run from Germany needs both: an Impressum (§ 5 DDG) and a Datenschutzerklärung, in German (English versions optional). Both are linked from every footer.
- Use the same details already public on neuropenetrance.com: Nella Christie Delva, Holzmarktstraße 73, 10179 Berlin, Deutschland; email `stemazing.advancement@gmail.com`. *(Confirmed by Nella, 22 Oct.)*
- The privacy policy must cover: GitHub Pages hosting (server logs), the Calendly embed (click-to-load), email contact and invoice requests, and no analytics or tracking.
- Marked "draft, please have it reviewed" until a lawyer has read it (same approach as neuropenetrance.com).

## 8. Left to the builder

- Exact file and CSS organisation, class names, how the filter chips and € / $ switch are coded (keep today's behaviour).
- Responsive breakpoints and the phone layout of each section.
- Exact trimming of long copy on NeuroPenetrance and Consulting portfolio, within the word targets and without changing facts. Show Nella the before/after text before pushing.
- Which two of the three current proof bullets each Services card keeps (the mockup shows the intended pick for the writing group).
- Simple automated checks (a small Node or Python script) for: no broken internal links, every EN page has a DE partner and vice versa (except posts), all prices match §4.4 in both languages, the NeuroPenetrance numbers in §2 are unchanged, no `wixstatic` or `fonts.googleapis` left, no "deposit invoice" wording.

## 9. Builder-check answers

**Claude's calls (settled after the builder check; Nella can veto):**
- **Release with German not yet reviewed:** the German layer is built behind one switch in `nav.js` (e.g. `DE_LIVE = false`). While off, the EN | DE switch is hidden, `hreflang` tags and the sitemap list English only, and `/de/` pages are not linked. The automated EN/DE pair check runs on the branch regardless.
- **Legal pages ship with the English release.** They are legal text, not marketing copy, so they follow the "draft, please have it reviewed" rule (§7) instead of the native-speaker rule (§4.7): Impressum and Datenschutzerklärung in German, plus English versions, linked from every footer from day one.
- **Second fast contact channel for the Impressum:** the Booking page (Calendly, 20-minute call) is listed next to the email. No phone number.
- **NeuroPenetrance demo embed:** the Streamlit frame is replaced by a button "Try the PenetranSci demo" linking to the app in a new tab. No third-party frame means nothing extra in the privacy policy.
- **Advising content:** the data-science pillar (Le Wagon, toolkit, dashboards), the consulting / grant / mentoring blurbs and the case-study summaries move to the **Consulting portfolio** page (trim target relaxed accordingly). The McKnight fellowship goes in About's quick facts. `portfolio.html` redirects to `consulting-portfolio.html`; `biography.html` redirects to `about.html`.
- **Old Wix addresses** (`/post/<slug>`) are out of scope. The dead "Scenes from Saturday Night" entry is removed from the archive unless Nella supplies the post.

**Nella's answers:**
- Impressum address: same as neuropenetrance.com (confirmed 22 Oct).
- Legal form and VAT: **Kleinunternehmerin (§ 19 UStG), no VAT charged** (22 Oct). Consequences:
  - Prices in §4.4 are final prices. Every price area (Services, Home cards, Writing closing band) carries the short note **"No VAT is charged under § 19 UStG."** / DE: **„Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“**
  - The invoice-request email text includes the same note.
  - Impressum: Nella Christie Delva, trading as STEM-azing; address and contact as §7; no USt-IdNr.; no register entry. The price-check script also checks the § 19 note is present on every price page in both languages.

## 10. Release

1. Build on branch `redesign-2026`, preview locally, show Nella every page (EN), then German after the native-speaker review.
2. Nella proof-reads: the three audience explanations, the Haiti line, the German.
3. Merge to `main` and push **only on Nella's explicit "push"**. English and German may go live together, or English first if the German review is not done yet.
