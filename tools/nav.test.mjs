import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const nav = require('../nav.js');
const { navLinks, langOf, alternateUrl, footerLinks, ctaLabel, _setDeLive } = nav;

test('menu labels and root-absolute links', () => {
  assert.deepEqual(navLinks('en').map(l => l.label), ['Home', 'Services', 'Biography', 'About', 'NeuroPenetrance', 'Writing']);
  assert.deepEqual(navLinks('de').map(l => l.href), ['/de/', '/de/services.html', '/de/biography.html', '/de/about.html', '/de/neuropenetrance.html', '/de/writing.html']);
  assert.deepEqual(navLinks('de').map(l => l.label), ['Start', 'Leistungen', 'Biografie', 'Über mich', 'NeuroPenetrance', 'Texte']);
  assert.ok(navLinks('en').every(l => l.href.startsWith('/')));
  assert.equal(ctaLabel('en'), 'Book a free call');
  assert.equal(ctaLabel('de'), 'Kostenloses Gespräch buchen');
});

test('language detection', () => {
  assert.equal(langOf('/de/services.html'), 'de');
  assert.equal(langOf('/de/'), 'de');
  assert.equal(langOf('/posts/x.html'), 'en');
  assert.equal(langOf('/'), 'en');
});

test('German is live: the language switch shows', () => {
  assert.equal(nav.DE_LIVE, true);
  assert.equal(alternateUrl('/services.html', 'de'), '/de/services.html');
});

test('language switch targets when live', () => {
  try {
    assert.equal(alternateUrl('/services.html', 'de'), '/de/services.html');
    assert.equal(alternateUrl('/', 'de'), '/de/');
    assert.equal(alternateUrl('/index.html', 'de'), '/de/');
    assert.equal(alternateUrl('/de/about.html', 'en'), '/about.html');
    assert.equal(alternateUrl('/de/', 'en'), '/');
    assert.equal(alternateUrl('/posts/a.html', 'de'), null);
  } finally { _setDeLive(true); }
});

test('footer has legal links', () => {
  assert.ok(footerLinks('de').some(l => l.href === '/de/impressum.html'));
  assert.ok(footerLinks('de').some(l => l.href === '/de/datenschutz.html'));
  assert.ok(footerLinks('en').some(l => l.href === '/impressum.html'));
  assert.ok(footerLinks('en').some(l => l.href === '/datenschutz.html'));
});

test('German pages get the German menu now German is live', () => {
  assert.equal(nav.menuLang('/de/impressum.html'), 'de');
  assert.equal(nav.menuLang('/services.html'), 'en');
  _setDeLive(false);
  try { assert.equal(nav.menuLang('/de/impressum.html'), 'en'); } finally { _setDeLive(true); }
});
