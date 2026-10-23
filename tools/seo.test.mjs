import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from './site.mjs';
import { SERVICES } from './request-data.mjs';

const MAIN = ['index', 'services', 'about', 'writing', 'neuropenetrance', 'booking', 'consulting-portfolio', 'biography'];
const PAGES = [...MAIN.flatMap(f => [`${f}.html`, `de/${f}.html`]), ...SERVICES.flatMap(s => [`request/${s.slug}.html`, `de/request/${s.slug}.html`])];
const decode = s => s.replace(/&amp;/g, '&');
const title = h => decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
const desc = h => decode((h.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '');

test('titles fit in search results and are unique', () => {
  const seen = new Map();
  for (const f of PAGES) {
    const t = title(read(f));
    assert.ok(t.length >= 30 && t.length <= 70, `${f}: title ${t.length} chars: ${t}`);
    assert.ok(!seen.has(t), `${f}: same title as ${seen.get(t)}`);
    seen.set(t, f);
  }
});

test('descriptions fit in search results', () => {
  for (const f of PAGES) {
    const d = desc(read(f));
    assert.ok(d.length >= 70 && d.length <= 160, `${f}: description ${d.length} chars: ${d}`);
  }
});

test('titles use the words people search for', () => {
  assert.equal(title(read('index.html')), 'Scientific Editing, Writing & STEM Tutoring | Dr. Nella Delva');
  assert.equal(title(read('services.html')), 'Scientific Editing, Grant Writing & Tutoring Services, Prices');
  assert.equal(title(read('de/index.html')), 'Englisches Lektorat, Wissenschaftliches Schreiben & Nachhilfe');
  assert.equal(title(read('de/services.html')), 'Lektorat, Förderanträge, Nachhilfe & Beratung – Preise');
  assert.ok(desc(read('index.html')).includes('Online worldwide'));
  assert.ok(desc(read('de/index.html')).includes('englisches Lektorat'));
  assert.equal(title(read('request/writing.html')), 'Request a Quote: Scientific Editing & Proofreading | STEM-azing');
  assert.equal(title(read('de/request/writing.html')), 'Angebot anfordern: Englisches Lektorat & Korrektorat | STEM-azing');
});
