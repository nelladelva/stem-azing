import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, text, htmlFiles } from './site.mjs';
import { checkServices } from './prices.test.mjs';

const EN_MAIN = ['index.html', 'services.html', 'about.html', 'writing.html', 'neuropenetrance.html', 'booking.html',
  'consulting-portfolio.html', 'impressum.html', 'datenschutz.html'];
const LEGAL_DE = ['/de/impressum.html', '/de/datenschutz.html'];

export const DE_NAMES = {
  'Gastvorträge & Workshops': 'Guest lectures & workshops',
  'Nachhilfe & Mentoring': 'Tutoring & mentorship',
  'Wissenschaftliches Schreiben & Lektorat': 'Scientific writing & editing',
  'Wissenschaftskommunikation': 'Science communication',
  'Wissenschaftliche Beratung': 'Scientific consulting',
  'Forschungs- & Datenanalyse': 'Research & data analysis',
};

test('every main page has a German partner', () => {
  for (const f of EN_MAIN) {
    assert.ok(existsSync(join(ROOT, 'de', f)), `de/${f} missing`);
    assert.ok(read(`de/${f}`).includes('<html lang="de">'), `de/${f} lang`);
  }
});

test('German services: same prices, German VAT note, German invoice', () => {
  const h = checkServices('de/services.html', 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', DE_NAMES);
  const btns = h.match(/<button[^>]*class="[^"]*pay-btn[^"]*"[^>]*>/g);
  assert.ok(btns.every(b => b.includes('data-lang="de"')), 'pay buttons carry data-lang="de"');
});

test('German pages use formal address', () => {
  for (const f of EN_MAIN) {
    const t = text(read(`de/${f}`));
    const m = t.match(/\b(du|dich|dir|dein\w*)\b/i);
    assert.equal(m, null, `de/${f}: informal "${m && m[0]}"`);
  }
});

test('German pages link to English posts with hreflang="en"', () => {
  for (const f of EN_MAIN) {
    for (const a of read(`de/${f}`).matchAll(/<a\b[^>]*href="\/posts\/[^"]+"[^>]*>/g))
      assert.ok(a[0].includes('hreflang="en"'), `de/${f}: ${a[0]}`);
  }
});

test('German stays hidden while DE_LIVE is false', () => {
  assert.match(read('nav.js'), /var DE_LIVE = false;/);
  for (const f of htmlFiles().filter(f => !f.startsWith('de/'))) {
    const h = read(f);
    for (const m of h.matchAll(/href="(\/de\/[^"]*)"/g))
      assert.ok(['impressum.html', 'datenschutz.html'].includes(f) && LEGAL_DE.includes(m[1]), `${f} links ${m[1]}`);
    if (!['impressum.html', 'datenschutz.html'].includes(f)) assert.ok(!h.includes('hreflang="de"'), `${f}: hreflang de`);
  }
  assert.ok(!readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').includes('/de/'), 'sitemap lists /de/');
});
