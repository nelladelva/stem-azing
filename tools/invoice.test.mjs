import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { buildInvoiceMail } = createRequire(import.meta.url)('../js/site.js');

const body = href => decodeURIComponent(href.split('body=')[1]);

test('invoice email in USD, English', () => {
  const m = buildInvoiceMail({ service: 'Scientific consulting', symbol: '$', amount: '105/hr', currency: 'USD', lang: 'en' });
  assert.equal(m.subject, 'Invoice request: Scientific consulting');
  assert.ok(m.href.startsWith('mailto:stemazing.advancement@gmail.com?'));
  assert.ok(body(m.href).includes('$105/hr'));
  assert.ok(body(m.href).includes('No VAT is charged under § 19 UStG.'));
});

test('invoice email in German', () => {
  const m = buildInvoiceMail({ service: 'Wissenschaftliche Beratung', symbol: '€', amount: '95/Std.', currency: 'EUR', lang: 'de' });
  assert.ok(m.subject.startsWith('Rechnungsanfrage:'));
  assert.ok(body(m.href).includes('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'));
  assert.ok(body(m.href).includes('€95/Std.'));
});
