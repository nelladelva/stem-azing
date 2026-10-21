import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, text, wordCount, parsePrices } from './site.mjs';

export const HEADLINE = {
  'Scientific consulting': ['95', '105'],
  'Guest lectures & workshops': ['350', '385'],
  'Research & data analysis': ['90', '99'],
  'Scientific writing & editing': ['150', '165'],
  'Science communication': ['180', '198'],
  'Tutoring & mentorship': ['100', '120'],
};
const PROJECT = { 'Scientific consulting': ['750', '820'], 'Research & data analysis': ['900', '985'], 'Tutoring & mentorship': ['950', '1000'] };

export function checkServices(file, vatNote) {
  const h = read(file);
  const p = parsePrices(h);
  assert.deepEqual(Object.keys(p).sort(), Object.keys(HEADLINE).sort());
  for (const [name, [eur, usd]] of Object.entries(HEADLINE)) assert.deepEqual([p[name].eur, p[name].usd], [eur, usd], name);
  for (const [name, pair] of Object.entries(PROJECT)) assert.ok(p[name].all.some(x => x[0] === pair[0] && x[1] === pair[1]), `${name} project ${pair}`);
  const ed = p['Scientific writing & editing'].all;
  assert.ok(ed.some(x => x[0] === '220' && x[1] === '240'), 'scientific edit 220/240');
  assert.ok(ed.some(x => x[0] === '800' && x[1] === '880'), 'grants 800/880');
  assert.ok(text(h).includes(vatNote), 'VAT note');
  assert.equal((h.match(/class="[^"]*\bpay-btn\b/g) || []).length, 6, 'six request buttons');
  for (const [name, c] of Object.entries(p)) {
    const proof = c.html.match(/<ul class="proof">([\s\S]*?)<\/ul>/);
    assert.equal(proof ? (proof[1].match(/<li\b/g) || []).length : 0, 2, `${name}: two proof points`);
  }
  return h;
}

test('services prices, structure and wording', () => {
  const h = checkServices('services.html', 'No VAT is charged under § 19 UStG.');
  const t = text(h);
  for (const s of ['Six ways to work together', 'Ghostwriting also offered', 'See a sample deliverable', 'For educators', 'For writing', 'For research teams'])
    assert.ok(t.includes(s), s);
  assert.ok(h.includes('href="/consulting-portfolio.html"'));
  for (const id of ['educators', 'writing', 'research']) assert.ok(h.includes(`id="${id}"`), id);
  assert.ok(!/<script>(?![\s\S]*src)/.test(h.replace(/<script\b[^>]*src=[^>]*><\/script>/g, '')), 'no inline script');
  assert.ok(wordCount(h) <= 450, `words: ${wordCount(h)}`);
});
