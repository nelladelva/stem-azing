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
  for (const [lang, notes] of [['en', ['All communication will be in English.', 'No VAT is charged under § 19 UStG.', 'In person means Berlin; travel outside Berlin is quoted separately.', 'Deadlines under 7 days: +25% rush fee.']],
                               ['de', ['Die gesamte Kommunikation erfolgt auf Englisch.', 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 'Vor Ort bedeutet Berlin; Reisekosten außerhalb Berlins nach Absprache.', 'Fristen unter 7 Tagen: +25 % Eilzuschlag.']]]) {
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

test('quantity boxes accept any whole number (no step that rejects 6000 words)', () => {
  for (const f of [...files('en'), ...files('de')]) assert.ok(!/name="qty_[^"]*"[^>]*\bstep=/.test(read(f)), f);
});

test('budget sends the range the client saw, in English', () => {
  for (const f of ['request/writing.html', 'de/request/writing.html']) {
    const h = read(f);
    assert.ok(h.includes('<option value="€500–1,500" data-val-eur="€500–1,500" data-val-usd="$550–1,650"'), f);
    assert.ok(h.includes('value="Not sure"'), `${f}: English value for not sure`);
  }
  assert.ok(read('de/request/writing.html').includes('data-usd="550–1.650 $">500–1.500 €</option>'));
});

test('only the price lines are announced to screen readers', () => {
  for (const f of [...files('en'), ...files('de')]) {
    const h = read(f);
    assert.ok(h.includes('<div data-estimate-lines aria-live="polite">'), f);
    assert.ok(!h.includes('class="estimate" aria-live'), f);
  }
});

test('German wording from the review', () => {
  const t = text(read('de/request/tutoring.html'));
  for (const s of ['Bildungsstand', 'Schüler/in bzw. Studierende/r', 'Rechnung per E-Mail an (falls abweichend)', 'Unverbindliche erste Preisschätzung'])
    assert.ok(t.includes(s), s);
  assert.ok(!t.includes('Stufe der lernenden Person'));
});

test('services pages warn about the rush fee', () => {
  assert.ok(text(read('services.html')).includes('Deadlines under 7 days: +25% rush fee.'));
  assert.ok(text(read('de/services.html')).includes('Fristen unter 7 Tagen: +25 % Eilzuschlag.'));
});
