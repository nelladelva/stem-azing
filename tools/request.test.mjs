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
