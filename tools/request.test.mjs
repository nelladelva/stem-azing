import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { estimate, estimateText, pickCurrency, isRush } = createRequire(import.meta.url)('../js/request.js');

const NONE = { total: 0, deposit: 0, from: [], quoted: false, rush: 0, rushed: false, pending: false };

test('scientific edit of 6,000 words', () => {
  const r = estimate([{ per: '1000words', eur: 220, usd: 240, qty: 6000 }], 'EUR');
  assert.deepEqual(r, { ...NONE, total: 1320, deposit: 660 });
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Starting estimate: €1,320', '50% deposit books your spot: €660']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Erste Preisschätzung: 1.320 €', '50 % Anzahlung sichert Ihren Termin: 660 €']);
});

test('sessions, a from-item and a quoted item together', () => {
  const r = estimate([
    { per: 'session', eur: 350, usd: 385, qty: 2 },
    { per: 'from', eur: 800, usd: 880, qty: null },
    { per: 'quote', qty: null },
  ], 'USD');
  assert.deepEqual(r, { ...NONE, total: 770, deposit: 385, from: [880], quoted: true });
  assert.deepEqual(estimateText(r, 'USD', 'en'), ['Starting estimate: $770', '+ from $880', '+ items quoted after review', '50% deposit books your spot: $385']);
});

test('package is flat, hourly multiplies, info adds nothing', () => {
  assert.equal(estimate([{ per: 'flat', eur: 950, usd: 1000, qty: null }], 'USD').total, 1000);
  assert.equal(estimate([{ per: 'hour', eur: 95, usd: 105, qty: 10 }, { per: 'info', qty: null }], 'EUR').total, 950);
});

test('bad quantities add nothing and never produce NaN', () => {
  for (const qty of [null, 0, -3, NaN, '', 'abc']) {
    const r = estimate([{ per: 'session', eur: 100, usd: 120, qty }], 'EUR');
    assert.deepEqual(r, { ...NONE, pending: true }, String(qty));
  }
});

test('ticked item without a quantity asks for one', () => {
  const r = estimate([{ per: 'piece', eur: 180, usd: 198, qty: '' }], 'EUR');
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Enter a quantity to see the price.']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Geben Sie eine Menge ein, um den Preis zu sehen.']);
});

test('nothing priced yet', () => {
  const r = estimate([], 'EUR');
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Choose what you need to see a starting estimate.']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Wählen Sie aus, was Sie brauchen, um eine erste Preisschätzung zu sehen.']);
});

test('only from / quoted items: no total line', () => {
  const r = estimate([{ per: 'from', eur: 750, usd: 820, qty: null }, { per: 'quote', qty: null }], 'EUR');
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['From €750', '+ items quoted after review']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Ab 750 €', '+ weitere Posten nach Prüfung']);
});

test('rush fee adds 25% to the total, the deposit and from-prices', () => {
  const r = estimate([{ per: '1000words', eur: 220, usd: 240, qty: 6000 }, { per: 'from', eur: 800, usd: 880, qty: null }], 'EUR', true);
  assert.deepEqual(r, { ...NONE, total: 1650, deposit: 825, from: [1000], rush: 330, rushed: true });
  assert.deepEqual(estimateText(r, 'EUR', 'en'), ['Starting estimate: €1,650', 'Rush fee (deadline within 7 days): +25% · €330', '+ from €1,000', '50% deposit books your spot: €825']);
  assert.deepEqual(estimateText(r, 'EUR', 'de'), ['Erste Preisschätzung: 1.650 €', 'Eilzuschlag (Frist unter 7 Tagen): +25 % · 330 €', '+ ab 1.000 €', '50 % Anzahlung sichert Ihren Termin: 825 €']);
});

test('rush with only a from-price still says so', () => {
  const r = estimate([{ per: 'from', eur: 750, usd: 820, qty: null }], 'USD', true);
  assert.deepEqual(estimateText(r, 'USD', 'en'), ['From $1,025', 'Rush fee (deadline within 7 days): +25%']);
});

test('rush means a deadline less than 7 days from today', () => {
  assert.equal(isRush('2026-10-23', '2026-10-23'), true);
  assert.equal(isRush('2026-10-29', '2026-10-23'), true);
  assert.equal(isRush('2026-10-30', '2026-10-23'), false);
  assert.equal(isRush('2026-11-02', '2026-10-30'), true, 'across a month end');
  assert.equal(isRush('2026-10-20', '2026-10-23'), false, 'past dates are not a rush (the calendar blocks them)');
  assert.equal(isRush('', '2026-10-23'), false);
});

test('currency from the URL', () => {
  assert.equal(pickCurrency('?currency=USD'), 'USD');
  for (const s of ['', '?currency=GBP', '?currency=usd&x=1', '?foo=bar']) assert.equal(pickCurrency(s), s.includes('usd') ? 'USD' : 'EUR');
});
