import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceFiles, htmlFiles, read } from './site.mjs';

const ALL = sourceFiles(['.html', '.css', '.js']);
const offenders = (files, pred) => files.filter(f => pred(read(f)));

test('no wixstatic', () => {
  assert.deepEqual(offenders(ALL, s => s.includes('static.wixstatic.com')), []);
});

test('no google fonts', () => {
  assert.deepEqual(offenders(ALL, s => /fonts\.(googleapis|gstatic)\.com/.test(s)), []);
});

test('no deposit invoice', () => {
  assert.deepEqual(offenders(ALL, s => /deposit invoice/i.test(s)), []);
});

test('only the official email', () => {
  const bad = [];
  for (const f of ALL) {
    for (const m of read(f).matchAll(/mailto:([^"'?\s<>]+)/g)) {
      if (m[1] !== 'stemazing.advancement@gmail.com' && !m[1].startsWith('$')) bad.push(`${f}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('every img has alt', () => {
  const bad = [];
  for (const f of htmlFiles()) {
    for (const m of read(f).matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) bad.push(`${f}: ${m[0].slice(0, 80)}`);
  }
  assert.deepEqual(bad, []);
});
