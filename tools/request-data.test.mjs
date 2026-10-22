import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICES, SERVICES } from './request-data.mjs';
import { HEADLINE } from './prices.test.mjs';

test('request prices match the services page', () => {
  const byName = Object.fromEntries(SERVICES.map(s => [s.name.en, s]));
  const first = { lectures: 'lecture', tutoring: 'tutoring', writing: 'langEdit', communication: 'piece', consulting: 'consultHour', 'data-analysis': 'dataHour' };
  for (const [name, [eur, usd]] of Object.entries(HEADLINE)) {
    const p = PRICES[first[byName[name].slug]];
    assert.deepEqual([String(p.eur), String(p.usd)], [eur, usd], name);
  }
  assert.deepEqual(PRICES.tutoringPack, { eur: 950, usd: 1000 });
  assert.deepEqual(PRICES.sciEdit, { eur: 220, usd: 240 });
  assert.deepEqual(PRICES.writingFrom, { eur: 800, usd: 880 });
  assert.deepEqual(PRICES.consultFrom, { eur: 750, usd: 820 });
  assert.deepEqual(PRICES.dataFrom, { eur: 900, usd: 985 });
});

test('six services, every sub-service bilingual and priced consistently', () => {
  assert.deepEqual(SERVICES.map(s => s.slug), ['lectures', 'tutoring', 'writing', 'communication', 'consulting', 'data-analysis']);
  const needsPrice = ['session', 'piece', '1000words', 'flat', 'from'];
  for (const s of SERVICES) for (const sub of s.subs) {
    assert.ok(sub.en && sub.de, `${s.slug}/${sub.id} labels`);
    if (needsPrice.includes(sub.per)) assert.ok(PRICES[sub.price], `${s.slug}/${sub.id} price`);
    if (s.billing) assert.equal(sub.per, 'info', `${s.slug}/${sub.id}: billing question sets the price`);
  }
  const subs = slug => SERVICES.find(s => s.slug === slug).subs.map(x => x.en);
  assert.equal(subs('lectures').length, 8);
  assert.equal(subs('tutoring').length, 9);
  assert.equal(subs('writing').length, 11);
  assert.equal(subs('communication').length, 9);
  assert.equal(subs('consulting').length, 7);
  assert.equal(subs('data-analysis').length, 9);
  assert.ok(!subs('consulting').some(x => /fixed project/i.test(x)));
  assert.equal(SERVICES.find(s => s.slug === 'lectures').subs.find(x => /multi-session/i.test(x.en)).per, 'quote');
});

test('no language question on any form', () => {
  for (const s of SERVICES) assert.ok(!s.questions.some(q => /language/i.test(q.name + q.en)), s.slug);
});
