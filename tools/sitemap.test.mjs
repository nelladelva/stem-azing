import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from './site.mjs';

test('sitemap lists live pages only', () => {
  const locs = [...read('sitemap.xml').matchAll(/<loc>https:\/\/stem-azing\.com\/([^<]*)<\/loc>/g)].map(m => (m[1] === '' || m[1].endsWith('/')) ? m[1] + 'index.html' : m[1]);
  for (const l of locs) {
    assert.ok(existsSync(join(ROOT, l)), `${l} missing`);
    assert.ok(!read(l).includes('http-equiv="refresh"'), `${l} is a redirect`);
  }
  for (const p of ['index.html', 'services.html', 'about.html', 'writing.html', 'neuropenetrance.html', 'booking.html',
    'consulting-portfolio.html', 'impressum.html', 'datenschutz.html']) assert.ok(locs.includes(p), `${p} not listed`);
  for (const f of readdirSync(join(ROOT, 'posts'))) assert.ok(locs.includes(`posts/${f}`), `posts/${f} not listed`);
  for (const bad of ['cv.html', 'biography.html', 'portfolio.html', 'blog.html']) assert.ok(!locs.includes(bad), `${bad} listed`);
});
