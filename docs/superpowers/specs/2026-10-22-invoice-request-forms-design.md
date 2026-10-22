# Invoice request forms — design

Date: 2026-10-22 · Site: stem-azing.com (repo `~/code/nelladelva/projects/stem-azing`)

## Why

Today every "Request an invoice" / "Rechnung anfordern" button on `services.html` and
`de/services.html` opens a dialog (`#payModal`) that opens a pre-filled email. Nella then
has to write back to learn what the client actually needs. She wants each button to lead
to a form for **that service** that collects, up front, what she needs to understand the
request and to write the invoice: **budget, timeline, which sub-services**, the client's
personal and company details, and billing details.

Success: a client can go from the services page to a sent request without leaving the
site, and Nella can write the invoice from the email she receives without a follow-up.

## Goals

- One form page per service (6 services × EN + DE = 12 pages), reached from that
  service's "Request an invoice" button, with the service pre-set.
- Step-by-step flow (layout **B**, chosen by Nella): four steps under a progress bar.
- Submissions go to Nella through **Formspree** (she already has an account).
- A live starting-price estimate while the client fills step 1.
- A note on every form: **"All communication will be in English."** German forms are
  written in German and say so in German (e.g. „Die gesamte Kommunikation erfolgt auf
  Englisch.“).

## Non-goals

- No payment on the site; Nella still sends invoices herself.
- No accounts, no saved drafts across visits, no backend of our own.
- No change to the € / $ prices themselves or to the Calendly booking page.

## Anti-goals

- The estimate must never read as a binding quote ("starting estimate, final price
  confirmed on the invoice").
- Must not break the site's existing rules checked by `npm test`: no Google Fonts / Wix
  assets, § 19 UStG note in every price area, EN/DE page pairs with `hreflang`, working
  links, sitemap.
- Must not lose what the client typed when they go Back or hit a validation error.

## Constraints

- Plain HTML/CSS/JS on GitHub Pages, no build step. Pushing `main` publishes; preview
  locally (`python3 -m http.server 8091`) and run `npm test` before any push.
- Shared styling in `css/site.css` (Direction A "Warm editorial": cream, deep blue,
  terracotta, peach; Georgia headings). Shared behaviour in `js/site.js`.
- STEM-azing is a Kleinunternehmerin: every price/estimate area shows "No VAT is charged
  under § 19 UStG." / „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“
- GDPR: `datenschutz.html` and `de/datenschutz.html` must gain a section on Formspree
  (processor, USA, what is sent, legal basis 6(1)(b)/(f)); the form needs a required
  consent checkbox linking to the privacy page. The privacy policy is still pending a
  lawyer's read; flag the new section for that review.
- German text is written by Claude; add the new pages to the existing "native speaker
  review" to-do.

## Decided by Nella

**Flow (layout B).** Steps: 1 Your project → 2 About you → 3 Invoice details → 4 Extras
→ Send → thank-you screen. Back/Next keep all entries.

**Every service, step 1:** sub-service choices (several can be ticked, each list ends in
"Other: ___"), service-specific questions, budget range, deadline, and
**Online / In person** (all services).

**Step 2 · About you:** full name, email, phone (optional), company / university /
organisation, role.

**Step 3 · Invoice details** (questions Nella uses to write the invoice): billing name
(person or organisation), billing address, country, VAT ID (optional), PO / reference
number (optional), currency (€ / $, pre-set from the services page switch), invoice
recipient email if different.

**Step 4 · Extras:** "Tell me more" free text, attachments, how they heard about
STEM-azing, privacy consent.

**Sub-services and questions — keep all:**

| Service | Sub-services | Service-specific questions |
|---|---|---|
| Guest lectures & workshops | single guest lecture · multi-session workshop series · keynote talk · panel / moderation · lab or hands-on activity · teacher training / PD session · curriculum or course design · career talk (first-gen / international path in STEM) | audience level, group size, topic, date(s), number of sessions. **No language question.** |
| Tutoring & mentorship | single session · 10-session package · exam prep (AP, IB, Abitur, MCAT/GRE) · homework & course support · research project mentoring · science fair / competition prep · college or grad-school application guidance · PhD / career mentoring · scholarship & Fulbright guidance | student's level, subject, goals, preferred schedule, who is paying (parent / student / school), number of sessions |
| Scientific writing & editing | language & clarity edit · scientific edit · grant writing · grant review · original writing / ghostwriting · thesis or dissertation edit · cover letter to journals · reply to reviewers · literature review · abstract / poster · translation-and-edit (DE→EN) | document type, word count, target journal or funder, citation style |
| Science communication | blog article · press release · newsletter · social media posts · talk or podcast script · explainer for patients / public · infographic text · website science copy · ongoing monthly package | audience, platform, number of pieces, tone |
| Scientific consulting | hourly advice · data interpretation · experimental / study review · R&D strategy · literature & market landscape · scientific due diligence · advisory board / expert opinion | field (oncology, neuroscience, molecular biology, other), stage of work, expected hours |
| Research & data analysis | study design · statistical analysis · machine learning model · biomarker / omics analysis · data cleaning · figures & visualisation · reproducible R / Python pipeline · methods & results write-up · training your team | data type, approximate size, tools used, sensitive (patient) data yes/no, expected hours |

**Live estimate:** yes, with these pricing rules (approved by Nella 2026-10-23). Each
ticked priced item gets **its own quantity box**, so nothing is counted twice.

| Service | Priced items | "From" items | Quoted after review |
|---|---|---|---|
| Lectures | €350 / $385 per session: single guest lecture, keynote, panel / moderation, lab or hands-on activity, teacher training / PD, career talk | — | multi-session workshop series (matches "quoted separately" on the card), curriculum or course design, Other |
| Tutoring | €100 / $120 per session: every option except the package | 10-session package = flat €950 / $1,000, no session box | Other |
| Writing | per 1,000 words: language & clarity edit €150 / $165; scientific edit and thesis / dissertation edit €220 / $240 | grant writing, original writing / ghostwriting: from €800 / $880 | grant review, cover letter, reply to reviewers, literature review, abstract / poster, translation-and-edit, Other |
| Communication | €180 / $198 per piece: every option except the package | — | ongoing monthly package, Other |
| Consulting | one "Hourly or fixed project?" question for the whole request. Hourly: total hours × €95 / $105 | Fixed: from €750 / $820 | — |
| Data analysis | same question. Hourly: total hours × €90 / $99 | Fixed: from €900 / $985 | — |

For consulting and data analysis the ticked sub-services describe the work and do not
change the number; "fixed project" therefore moves out of the consulting sub-service list
into this question. Several items: sum the priced ones, list "from" items as "+ from €X",
and add "+ items quoted after review" when any apply.

**Formspree endpoint:** `https://formspree.io/f/myeegvqk` (one form for all 12 pages).

## Claude's calls (Nella to check)

- **URLs:** `/request/<slug>.html` and `/de/request/<slug>.html`, slugs `lectures`,
  `tutoring`, `writing`, `communication`, `consulting`, `data-analysis`. The services-page
  buttons become links (`<a href="/request/writing.html?currency=EUR">`), carrying the
  current € / $ choice. The `#payModal` dialog, `buildInvoiceMail` and its tests are
  removed; README "Invoice requests" section is rewritten.
- **Estimate display** (pricing rules above):
  - Below the total: "50% deposit books your spot", matching the three steps on the
    services page, plus the § 19 note and "starting estimate, final price on your
    invoice". The estimate is sent with the submission.
- **In person** means Berlin; the form notes "travel outside Berlin quoted separately".
- **Budget** is a range dropdown (e.g. under €500 · €500–1,500 · €1,500–5,000 ·
  over €5,000 · not sure), in the chosen currency.
- **Required fields:** at least one sub-service, deadline, online/in person, name, email,
  billing name, billing address, country, consent. Everything else optional.
- **Thank-you screen:** "Thank you — I'll reply within 2 working days with your invoice
  or an invitation to a free call." (Same in German.)
- **Formspree:** one form endpoint for all 12 pages, with hidden fields `service`,
  `language` and `_subject` ("Invoice request: <service>") so emails are easy to sort;
  submitted with `fetch` so the client stays on the site, with a plain `<form action>`
  fallback if JavaScript is off. Spam: Formspree's honeypot field `_gotcha`.
- **Attachments:** Formspree accepts file uploads only on paid plans, and the plan is not
  confirmed, so step 4 gets a "Link to your files (Google Drive, Dropbox…)" field. If
  Nella later confirms uploads, swapping in a file field is a small follow-up.
- `tools/legal.test.mjs` currently fails when "Formspree" appears in the privacy
  policies; update it to require the new Formspree section instead.
- Budget ranges in USD mirror the EUR ranges at the site's existing ~1.1 ratio; German
  forms send the same (English) field names so all emails look alike.
- `services.html` and `de/services.html` keep "Ask first" → booking page unchanged.
- New pages go in `sitemap.xml` and get `hreflang` pairs; `npm test` gains checks that
  every services button points at an existing form page in the same language, and that
  each form page has the English-communication note, the § 19 note and the consent box.

## Left to the builder

Exact markup and CSS of the stepper (reuse site buttons, cards and the chip style from the
mockup), whether the 12 pages are hand-written or generated from one shared script and a
per-service config, validation messages, mobile layout details, and test structure.

Mockup: `.superpowers/brainstorm/413-1792705683/content/form-layout.html` (option B).
