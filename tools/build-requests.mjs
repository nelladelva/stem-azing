// Writes the invoice request forms: request/<slug>.html and de/request/<slug>.html.
// Content and prices come from request-data.mjs. Run: npm run build:requests
// The output is committed (GitHub Pages has no build step); requests.test.mjs checks it is current.
// Without JavaScript a page is one long form posting to Formspree; js/request.js adds the stepper.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './site.mjs';
import { PRICES, SERVICES, BUDGETS } from './request-data.mjs';

const FORMSPREE = 'https://formspree.io/f/myeegvqk';
const SITE = 'https://stem-azing.com/';

const T = {
  en: {
    kicker: 'Request an invoice', title: 'Request a Quote', back: '← All services', services: '/services.html', privacy: '/datenschutz.html',
    description: n => `${n} by Dr. Nella C. Delva, PhD: pick services, budget and deadline, see a live price and request a quote. Online worldwide.`,
    lede: 'A few questions so I can understand your project and prepare your invoice. It takes about five minutes.',
    lang: 'All communication will be in English.',
    steps: ['Your project', 'About you', 'Invoice details', 'Extras'],
    need: 'What do you need?', needHint: 'Tick everything that applies.',
    qty: { session: 'Sessions', piece: 'Pieces', '1000words': 'Words' }, other: 'Other', otherText: 'Please describe',
    billing: 'Hourly or fixed project?', hourly: 'Hourly', fixed: 'Fixed project', hours: 'Expected hours',
    budget: 'Budget', choose: 'Please choose', deadline: 'Deadline', format: 'Online or in person?', online: 'Online', inPerson: 'In person',
    inPersonNote: 'In person means Berlin; travel outside Berlin is quoted separately.',
    estimate: 'Live estimate', estimateNone: 'Choose what you need to see a starting estimate.',
    estimateNote: 'Starting estimate; the final price is confirmed on your invoice.', rushNote: 'Deadlines under 7 days: +25% rush fee.', vat: 'No VAT is charged under § 19 UStG.',
    name: 'Full name', email: 'Email', phone: 'Phone (optional)', organisation: 'Company, university or organisation', role: 'Role',
    billingName: 'Billing name (person or organisation)', billingAddress: 'Billing address', country: 'Country',
    vatId: 'VAT ID (optional)', po: 'PO or reference number (optional)', currency: 'Currency', invoiceEmail: 'Send the invoice to (if different)',
    details: 'Tell me more', files: 'Link to your files (Google Drive, Dropbox…)', heard: 'How did you hear about STEM-azing?',
    consent: ['I agree that my details are processed to answer my request, as described in the ', 'privacy policy', '.'],
    backBtn: '← Back', next: 'Next →', send: 'Send request', required: 'Required',
    thanksTitle: 'Thank you', thanks: "Thank you — I'll reply within 2 working days with your invoice or an invitation to a free call.",
  },
  de: {
    kicker: 'Rechnung anfordern', title: 'Angebot anfordern', back: '← Alle Leistungen', services: '/de/services.html', privacy: '/de/datenschutz.html',
    description: n => `${n} von Dr. Nella C. Delva: Leistungen und Frist wählen, Preis sofort sehen, Angebot anfordern. Online & in Berlin.`,
    lede: 'Ein paar Fragen, damit ich Ihr Vorhaben verstehe und Ihre Rechnung vorbereiten kann. Das dauert etwa fünf Minuten.',
    lang: 'Die gesamte Kommunikation erfolgt auf Englisch.',
    steps: ['Ihr Vorhaben', 'Über Sie', 'Rechnungsdaten', 'Weiteres'],
    need: 'Was brauchen Sie?', needHint: 'Kreuzen Sie alles Zutreffende an.',
    qty: { session: 'Sitzungen', piece: 'Beiträge', '1000words': 'Wörter' }, other: 'Sonstiges', otherText: 'Bitte beschreiben',
    billing: 'Nach Stunden oder als Projekt?', hourly: 'Nach Stunden', fixed: 'Festes Projekt', hours: 'Erwartete Stunden',
    budget: 'Budget', choose: 'Bitte wählen', deadline: 'Frist', format: 'Online oder vor Ort?', online: 'Online', inPerson: 'Vor Ort',
    inPersonNote: 'Vor Ort bedeutet Berlin; Reisekosten außerhalb Berlins nach Absprache.',
    estimate: 'Live-Preisschätzung', estimateNone: 'Wählen Sie aus, was Sie brauchen, um eine erste Preisschätzung zu sehen.',
    estimateNote: 'Unverbindliche erste Preisschätzung; der endgültige Preis steht auf Ihrer Rechnung.', rushNote: 'Fristen unter 7 Tagen: +25 % Eilzuschlag.', vat: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
    name: 'Vollständiger Name', email: 'E-Mail', phone: 'Telefon (optional)', organisation: 'Unternehmen, Hochschule oder Organisation', role: 'Funktion',
    billingName: 'Rechnungsname (Person oder Organisation)', billingAddress: 'Rechnungsanschrift', country: 'Land',
    vatId: 'USt-IdNr. (optional)', po: 'Bestell- oder Referenznummer (optional)', currency: 'Währung', invoiceEmail: 'Rechnung per E-Mail an (falls abweichend)',
    details: 'Erzählen Sie mir mehr', files: 'Link zu Ihren Dateien (Google Drive, Dropbox …)', heard: 'Wie sind Sie auf STEM-azing aufmerksam geworden?',
    consent: ['Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden, wie in der ', 'Datenschutzerklärung', ' beschrieben.'],
    backBtn: '← Zurück', next: 'Weiter →', send: 'Anfrage senden', required: 'Pflichtfeld',
    thanksTitle: 'Vielen Dank', thanks: 'Vielen Dank – ich melde mich innerhalb von 2 Werktagen mit Ihrer Rechnung oder einer Einladung zu einem kostenlosen Gespräch.',
  },
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const price = key => `data-eur="${PRICES[key].eur}" data-usd="${PRICES[key].usd}"`;
const req = t => ` <abbr class="req" title="${t.required}">*</abbr>`;

function field(label, control, required, t) {
  return `<label class="field"><span>${esc(label)}${required ? req(t) : ''}</span>${control}</label>`;
}
const input = (type, name, extra = '') => `<input type="${type}" name="${name}"${extra}>`;

function radios(groupLabel, name, options, lang, required, t) {
  const id = `q-${name}`;
  const items = options.map(o => `<label class="opt"><input type="radio" name="${name}" value="${esc(o.value)}"${o.attrs || ''}${required ? ' required' : ''}> <span>${esc(o[lang])}</span></label>`).join('');
  return `<div class="field" role="group" aria-labelledby="${id}"><span id="${id}">${esc(groupLabel)}${required ? req(t) : ''}</span><div class="opts">${items}</div></div>`;
}

function question(q, lang, t) {
  const label = q[lang];
  if (q.type === 'radio') return radios(label, q.name, q.options, lang, q.required, t);
  if (q.type === 'select') {
    const opts = q.options.map(o => `<option value="${esc(o.value)}">${esc(o[lang])}</option>`).join('');
    return field(label, `<select name="${q.name}"><option value="">${t.choose}</option>${opts}</select>`, q.required, t);
  }
  if (q.type === 'textarea') return field(label, `<textarea name="${q.name}" rows="3"></textarea>`, q.required, t);
  return field(label, input(q.type, q.name, q.type === 'number' ? ' min="1"' : ''), q.required, t);
}

function subOption(sub, lang, t) {
  const id = `sub-${sub.id}`;
  const data = `data-per="${sub.per}"${sub.price ? ' ' + price(sub.price) : ''}`;
  let extra = '';
  if (t.qty[sub.per]) {
    extra = `<span class="sub-extra" data-for="${sub.id}"><label>${t.qty[sub.per]} <input type="number" min="1" name="qty_${sub.id}" data-qty-for="${sub.id}"></label></span>`;
  } else if (sub.id === 'other') {
    extra = `<span class="sub-extra" data-for="other"><label>${t.otherText} <input type="text" name="other_text"></label></span>`;
  }
  return `<div class="sub"><label class="opt"><input type="checkbox" id="${id}" name="sub_services" value="${esc(sub.en)}" data-sub="${sub.id}" ${data}> <span>${esc(sub[lang])}</span></label>${extra}</div>`;
}

export function renderPage(s, lang) {
  const t = T[lang];
  const name = s.name[lang];
  const pre = lang === 'de' ? 'de/' : '';
  const subs = [...s.subs, { id: 'other', en: 'Other', de: 'Sonstiges', per: s.billing ? 'info' : 'quote' }];
  const budgetLabel = (b, cur) => (lang === 'de' ? b[`de_${cur}`] : b[cur]);
  const budget = `<select name="budget"><option value="">${t.choose}</option>${BUDGETS.map(b =>
    `<option value="${esc(b.eur)}" data-val-eur="${esc(b.eur)}" data-val-usd="${esc(b.usd)}" data-eur="${esc(budgetLabel(b, 'eur'))}" data-usd="${esc(budgetLabel(b, 'usd'))}">${esc(budgetLabel(b, 'eur'))}</option>`).join('')}</select>`;
  const billing = s.billing ? radios(t.billing, 'billing', [
    { value: 'hourly', en: T.en.hourly, de: T.de.hourly, attrs: ` data-per="hour" ${price(s.billing.hour)}` },
    { value: 'fixed', en: T.en.fixed, de: T.de.fixed, attrs: ` data-per="from" ${price(s.billing.from)}` },
  ], lang, true, t) + `<span class="sub-extra" data-for="hourly">${field(t.hours, input('number', 'hours', ' min="1"'), false, t)}</span>` : '';
  const nav = (n, last) => `<div class="step-nav">${n > 1 ? `<button type="button" class="btn btn--outline" data-step-prev>${t.backBtn}</button>` : ''}${last
    ? `<button type="submit" class="btn btn--accent">${t.send}</button>` : `<button type="button" class="btn btn--primary" data-step-next>${t.next}</button>`}</div>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title}: ${esc(s.seo[lang])} | STEM-azing</title>
<meta name="description" content="${esc(t.description(s.seo[lang]))}">
<link rel="alternate" hreflang="en" href="${SITE}request/${s.slug}.html">
<link rel="alternate" hreflang="de" href="${SITE}de/request/${s.slug}.html">
<link rel="stylesheet" href="/css/site.css">
<script src="/nav.js" defer></script>
<script src="/js/site.js" defer></script>
<script src="/js/request.js" defer></script>
</head>
<body data-page="services.html">
<a class="skip" href="#main">${lang === 'de' ? 'Zum Inhalt' : 'Skip to content'}</a>
<header id="site-header"></header>

<main id="main">
  <section class="wrap request">
    <p><a class="link-arrow" href="${t.services}">${t.back}</a></p>
    <p class="kicker">${t.kicker}</p>
    <h1>${esc(name)}</h1>
    <p class="lede">${t.lede}</p>
    <p class="lang-note">${t.lang}</p>

    <form id="request-form" class="request-form" action="${FORMSPREE}" method="POST" data-lang="${lang}">
      <input type="hidden" name="service" value="${esc(s.name.en)}">
      <input type="hidden" name="language" value="${lang}">
      <input type="hidden" name="_subject" value="Invoice request: ${esc(s.name.en)}">
      <input type="hidden" name="estimate" value="">
      <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <ol class="stepper">${t.steps.map(x => `<li>${x}</li>`).join('')}</ol>

      <fieldset class="step" data-step="1">
        <legend tabindex="-1">1 · ${t.steps[0]}</legend>
        <div class="field" role="group" aria-labelledby="q-subs"><span id="q-subs">${t.need}${req(t)}</span><small>${t.needHint}</small>
          <div class="subs">${subs.map(x => subOption(x, lang, t)).join('')}</div>
        </div>
        ${billing}
        ${s.questions.map(q => question(q, lang, t)).join('\n        ')}
        ${field(t.budget, budget, false, t)}
        ${field(t.deadline, input('date', 'deadline', ' required'), true, t)}
        ${radios(t.format, 'format', [{ value: 'online', en: T.en.online, de: T.de.online }, { value: 'in-person', en: T.en.inPerson, de: T.de.inPerson }], lang, true, t)}
        <p class="field-note">${t.inPersonNote}</p>
        <div class="estimate">
          <p class="kicker">${t.estimate}</p>
          <div data-estimate-lines aria-live="polite"><p>${t.estimateNone}</p></div>
          <p class="vat-note">${t.estimateNote} ${t.rushNote} ${t.vat}</p>
        </div>
        ${nav(1)}
      </fieldset>

      <fieldset class="step" data-step="2">
        <legend tabindex="-1">2 · ${t.steps[1]}</legend>
        ${field(t.name, input('text', 'name', ' autocomplete="name" required'), true, t)}
        ${field(t.email, input('email', 'email', ' autocomplete="email" required'), true, t)}
        ${field(t.phone, input('tel', 'phone', ' autocomplete="tel"'), false, t)}
        ${field(t.organisation, input('text', 'organisation', ' autocomplete="organization"'), false, t)}
        ${field(t.role, input('text', 'role', ' autocomplete="organization-title"'), false, t)}
        ${nav(2)}
      </fieldset>

      <fieldset class="step" data-step="3">
        <legend tabindex="-1">3 · ${t.steps[2]}</legend>
        ${field(t.billingName, input('text', 'billing_name', ' required'), true, t)}
        ${field(t.billingAddress, '<textarea name="billing_address" rows="3" autocomplete="street-address" required></textarea>', true, t)}
        ${field(t.country, input('text', 'country', ' autocomplete="country-name" required'), true, t)}
        ${field(t.vatId, input('text', 'vat_id'), false, t)}
        ${field(t.po, input('text', 'po_number'), false, t)}
        ${field(t.currency, '<select name="currency"><option value="EUR">EUR €</option><option value="USD">USD $</option></select>', false, t)}
        ${field(t.invoiceEmail, input('email', 'invoice_email'), false, t)}
        ${nav(3)}
      </fieldset>

      <fieldset class="step" data-step="4">
        <legend tabindex="-1">4 · ${t.steps[3]}</legend>
        ${field(t.details, '<textarea name="details" rows="5"></textarea>', false, t)}
        ${field(t.files, input('url', 'files_link', ' placeholder="https://"'), false, t)}
        ${field(t.heard, input('text', 'heard_about'), false, t)}
        <label class="opt consent"><input type="checkbox" name="consent" value="yes" required> <span>${t.consent[0]}<a href="${t.privacy}">${t.consent[1]}</a>${t.consent[2]}</span></label>
        <div class="form-status" role="alert" hidden></div>
        ${nav(4, true)}
      </fieldset>
    </form>

    <section class="thanks" hidden tabindex="-1">
      <h2>${t.thanksTitle}</h2>
      <p>${t.thanks}</p>
      <p><a class="link-arrow" href="${t.services}">${t.back}</a></p>
    </section>
  </section>
</main>

<footer id="site-footer"></footer>
</body>
</html>
`;
}

export const PAGES = ['en', 'de'].flatMap(lang => SERVICES.map(s => ({
  file: `${lang === 'de' ? 'de/' : ''}request/${s.slug}.html`,
  html: renderPage(s, lang),
})));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const p of PAGES) {
    mkdirSync(dirname(join(ROOT, p.file)), { recursive: true });
    writeFileSync(join(ROOT, p.file), p.html);
    console.log('wrote', p.file);
  }
}
