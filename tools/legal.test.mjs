import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, text, htmlFiles } from './site.mjs';

const has = (t, list, f) => { for (const s of list) assert.ok(t.includes(s), `${f}: missing ${s}`); };
const DETAILS = ['Nella Christie Delva', 'STEM-azing', 'Holzmarktstraße 73', '10179 Berlin', 'stemazing.advancement@gmail.com'];

test('German Impressum', () => {
  const h = read('de/impressum.html'), t = text(h);
  has(t, ['Angaben gemäß § 5 DDG', ...DETAILS, 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'], 'de/impressum');
  assert.ok(h.includes('href="/de/booking.html"'), 'second contact: German booking page');
  assert.ok(!t.includes('USt-IdNr'));
  assert.ok(h.includes('lang="de"'));
});

test('English Impressum', () => {
  const h = read('impressum.html'), t = text(h);
  has(t, [...DETAILS, 'The German version is the legally binding one.'], 'impressum');
  assert.ok(h.includes('href="/booking.html"'));
});

test('privacy policies', () => {
  for (const [f, words] of [['datenschutz.html', ['no analytics', 'no tracking']], ['de/datenschutz.html', ['Verantwortliche', 'keine Analyse', 'Tracking']]]) {
    const h = read(f), t = text(h);
    has(t, ['GitHub', 'Calendly', 'Formspree', 'stemazing.advancement@gmail.com', 'Holzmarktstraße 73', ...words], f);
    assert.ok(h.includes('class="draft-note"'), `${f}: draft note`);
    assert.ok(!/reCAPTCHA/.test(t), `${f}: no reCAPTCHA`);
  }
});

test('privacy policies say Formspree keeps its own copy', () => {
  assert.ok(text(read('datenschutz.html')).includes('Formspree also keeps a copy of each request in our Formspree account until we delete it there.'));
  assert.ok(text(read('de/datenschutz.html')).includes('Formspree speichert zudem eine Kopie jeder Anfrage in unserem Formspree-Konto, bis wir sie dort löschen.'));
});

test('every non-redirect page has the shared footer', () => {
  const missing = htmlFiles().filter(f => { const h = read(f); return !h.includes('http-equiv="refresh"') && !h.includes('id="site-footer"'); });
  assert.deepEqual(missing, []);
});
