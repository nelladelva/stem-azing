import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, htmlFiles } from './site.mjs';
import { PRICES, SERVICES } from './request-data.mjs';
import { SCHEMA_PAGES, schemaFor, renderSchema } from './build-schema.mjs';

const blocks = h => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
const graph = f => JSON.parse(blocks(read(f))[0])['@graph'];
const node = (f, type) => graph(f).find(n => n['@type'] === type);

test('structured data is on home and services, valid and up to date', () => {
  assert.deepEqual(SCHEMA_PAGES.sort(), ['de/index.html', 'de/services.html', 'index.html', 'services.html']);
  for (const f of SCHEMA_PAGES) {
    const b = blocks(read(f));
    assert.equal(b.length, 1, `${f}: one JSON-LD block`);
    assert.equal(`<script type="application/ld+json">${b[0]}</script>`, renderSchema(schemaFor(f)), `${f}: run npm run build:schema`);
  }
});

test('the business: Berlin address, worldwide, English, linked to Nella', () => {
  for (const f of SCHEMA_PAGES) {
    const biz = node(f, 'ProfessionalService'), me = node(f, 'Person');
    assert.equal(biz.name, 'STEM-azing');
    assert.deepEqual(biz.address, { '@type': 'PostalAddress', streetAddress: 'Holzmarktstraße 73', postalCode: '10179', addressLocality: 'Berlin', addressCountry: 'DE' });
    assert.equal(biz.areaServed, 'Worldwide');
    assert.equal(biz.availableLanguage, 'English');
    assert.equal(biz.email, 'stemazing.advancement@gmail.com');
    assert.equal(biz.founder['@id'], me['@id']);
    assert.equal(me.name, 'Nella C. Delva');
    assert.ok(me.sameAs.includes('https://www.linkedin.com/in/nelladelva'));
    assert.ok(me.sameAs.some(u => u.startsWith('https://scholar.google.com/citations?user=in0k0HcAAAAJ')));
  }
});

test('services list the six starting prices in EUR and USD', () => {
  const first = { lectures: 'lecture', tutoring: 'tutoring', writing: 'langEdit', communication: 'piece', consulting: 'consultHour', 'data-analysis': 'dataHour' };
  for (const [f, lang] of [['services.html', 'en'], ['de/services.html', 'de']]) {
    const offers = node(f, 'ProfessionalService').hasOfferCatalog.itemListElement;
    assert.equal(offers.length, 6, f);
    SERVICES.forEach((s, i) => {
      const o = offers[i];
      assert.equal(o.itemOffered.name, s.name[lang]);
      assert.equal(o.url, `https://stem-azing.com/${lang === 'de' ? 'de/' : ''}request/${s.slug}.html`);
      const p = PRICES[first[s.slug]];
      assert.deepEqual(o.priceSpecification.map(x => [x.price, x.priceCurrency]), [[p.eur, 'EUR'], [p.usd, 'USD']], `${f}: ${s.slug}`);
    });
  }
});

test('every page with language alternates has x-default pointing to English', () => {
  let n = 0;
  for (const f of htmlFiles()) {
    const h = read(f), en = h.match(/<link rel="alternate" hreflang="en" href="([^"]+)">/);
    if (!en) continue;
    n++;
    assert.ok(h.includes(`<link rel="alternate" hreflang="x-default" href="${en[1]}">`), f);
  }
  assert.ok(n >= 30, `only ${n} pages with alternates`);
});
