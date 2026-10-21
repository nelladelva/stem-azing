import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from './site.mjs';

export const REDIRECTS = { 'biography.html': '/about.html', 'portfolio.html': '/consulting-portfolio.html', 'blog.html': '/writing.html' };

test('old pages redirect and keep the #hash', () => {
  for (const [from, to] of Object.entries(REDIRECTS)) {
    const h = read(from);
    assert.ok(h.includes(`<meta http-equiv="refresh" content="0; url=${to}">`), `${from} refresh`);
    assert.ok(h.includes(`<link rel="canonical" href="https://stem-azing.com${to}">`), `${from} canonical`);
    assert.ok(h.includes('<meta name="robots" content="noindex">'), `${from} noindex`);
    assert.ok(h.includes(`<a href="${to}">`), `${from} visible link`);
    assert.ok(h.includes(`location.replace('${to}' + location.hash)`), `${from} keeps hash`);
  }
});
