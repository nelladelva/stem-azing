import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { formatMoney } = createRequire(import.meta.url)('../js/site.js');

test('money format follows the page language', () => {
  assert.equal(formatMoney('€', '150', 'en'), '€150');
  assert.equal(formatMoney('€', '150', 'de'), '150 €');
  assert.equal(formatMoney('$', '165', 'de'), '165 $');
});

test('money format adds thousands separators', () => {
  assert.equal(formatMoney('$', '1000', 'en'), '$1,000');
  assert.equal(formatMoney('$', '1000', 'de'), '1.000 $');
  assert.equal(formatMoney('€', '950', 'de'), '950 €');
});
