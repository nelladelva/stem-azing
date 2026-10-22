import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, text } from './site.mjs';

test('internal files are not published by GitHub Pages', () => {
  assert.ok(!existsSync(join(ROOT, '.nojekyll')), '.nojekyll would disable the exclude list');
  const cfg = existsSync(join(ROOT, '_config.yml')) ? read('_config.yml') : '';
  for (const p of ['docs', 'tools', 'package.json', 'README.md']) assert.match(cfg, new RegExp(`^\\s*-\\s*${p.replace('.', '\\.')}\\s*$`, 'm'), `${p} not excluded`);
});

test('focus outline is visible on navy backgrounds', () => {
  assert.match(read('css/site.css'), /\.band--navy :focus-visible,\s*#site-footer :focus-visible\s*\{[^}]*outline-color:\s*var\(--peach\)/);
});

test('jump links clear the sticky header', () => {
  assert.match(read('css/site.css'), /html\s*\{[^}]*scroll-padding-top:\s*\d+px/);
});

test('invoice dialog keeps keyboard focus and returns it', () => {
  const js = read('js/site.js');
  assert.match(js, /lastFocus = document\.activeElement/, 'remembers the opener');
  assert.match(js, /lastFocus\.focus\(\)/, 'restores focus on close');
  assert.match(js, /e\.key === "Tab"/, 'keeps Tab inside the dialog');
});

test('privacy policies name the right legal bases', () => {
  for (const [f, list] of [
    ['de/datenschutz.html', ['Data Privacy Framework', 'Art. 45 DSGVO', '§ 25 Abs. 1 TDDDG', 'Art. 6 Abs. 1 lit. f DSGVO', 'Speicherdauer']],
    ['datenschutz.html', ['Data Privacy Framework', 'Art. 45 GDPR', '§ 25(1) TDDDG', 'Art. 6(1)(f) GDPR', 'retention']],
  ]) {
    const t = text(read(f));
    for (const s of list) assert.ok(t.includes(s), `${f}: missing ${s}`);
  }
});

test('unreviewed German main pages are noindex while hidden', () => {
  assert.match(read('nav.js'), /var DE_LIVE = false;/);
  for (const f of ['index', 'services', 'about', 'writing', 'neuropenetrance', 'booking', 'consulting-portfolio'])
    assert.ok(read(`de/${f}.html`).includes('<meta name="robots" content="noindex">'), `de/${f}.html`);
});
