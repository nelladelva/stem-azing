// Writes the structured data (schema.org JSON-LD) that tells search engines who STEM-azing is,
// where it is and what it offers, into the home and services pages (EN + DE).
// Prices come from request-data.mjs. Run: npm run build:schema — schema.test.mjs checks it is current.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './site.mjs';
import { PRICES, SERVICES } from './request-data.mjs';

const SITE = 'https://stem-azing.com/';
export const SCHEMA_PAGES = ['index.html', 'services.html', 'de/index.html', 'de/services.html'];

// Starting price shown on each services card, and its unit.
const STARTING = {
  lectures: ['lecture', 'session'], tutoring: ['tutoring', 'session'], writing: ['langEdit', 'words'],
  communication: ['piece', 'piece'], consulting: ['consultHour', 'hour'], 'data-analysis': ['dataHour', 'hour'],
};
const UNIT = {
  en: { session: 'per session', words: 'per 1,000 words', piece: 'per piece', hour: 'per hour' },
  de: { session: 'pro Sitzung', words: 'pro 1.000 Wörter', piece: 'pro Beitrag', hour: 'pro Stunde' },
};
const DESCRIPTION = {
  en: 'Scientific editing and proofreading, grant writing, STEM tutoring, guest lectures, science communication, research consulting and data analysis by a PhD neuroscientist. Online worldwide, based in Berlin.',
  de: 'Englisches Lektorat und Korrektorat, Förderanträge, MINT-Nachhilfe, Gastvorträge, Wissenschaftskommunikation, Forschungsberatung und Datenanalyse von einer promovierten Neurowissenschaftlerin. Online weltweit, Sitz in Berlin.',
};

// The portrait is referenced only from the home pages (Nella's rule: photo on Home only).
function person(withImage) {
  const me = {
    '@type': 'Person', '@id': SITE + '#nella', name: 'Nella C. Delva', honorificPrefix: 'Dr.',
    jobTitle: 'Neuroscientist and science writer', url: SITE + 'about.html',
    sameAs: ['https://www.linkedin.com/in/nelladelva', 'https://x.com/NellaDelva', 'https://scholar.google.com/citations?user=in0k0HcAAAAJ'],
  };
  if (withImage) me.image = SITE + 'img/headshot.jpg';
  return me;
}

function business(lang, withOffers) {
  const pre = lang === 'de' ? 'de/' : '';
  const biz = {
    '@type': 'ProfessionalService', '@id': SITE + '#stem-azing', name: 'STEM-azing', url: SITE + pre,
    description: DESCRIPTION[lang], email: 'stemazing.advancement@gmail.com',
    founder: { '@id': SITE + '#nella' },
    address: { '@type': 'PostalAddress', streetAddress: 'Holzmarktstraße 73', postalCode: '10179', addressLocality: 'Berlin', addressCountry: 'DE' },
    areaServed: 'Worldwide', availableLanguage: 'English',
    sameAs: ['https://www.instagram.com/stem_azing/'],
  };
  if (withOffers) {
    biz.hasOfferCatalog = {
      '@type': 'OfferCatalog', name: lang === 'de' ? 'Leistungen' : 'Services',
      itemListElement: SERVICES.map(s => {
        const [key, unit] = STARTING[s.slug];
        const spec = cur => ({ '@type': 'UnitPriceSpecification', price: PRICES[key][cur], priceCurrency: cur.toUpperCase(), unitText: UNIT[lang][unit] });
        return {
          '@type': 'Offer', url: `${SITE}${pre}request/${s.slug}.html`,
          itemOffered: { '@type': 'Service', name: s.name[lang], serviceType: s.seo[lang] },
          priceSpecification: [spec('eur'), spec('usd')],
        };
      }),
    };
  }
  return biz;
}

export function schemaFor(page) {
  const lang = page.startsWith('de/') ? 'de' : 'en';
  const services = page.endsWith('services.html');
  return { '@context': 'https://schema.org', '@graph': [business(lang, services), person(!services)] };
}

// "<" is escaped so the JSON can never close the script tag early.
export const renderSchema = obj =>
  `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2).replace(/</g, '\\u003c')}\n</script>`;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const page of SCHEMA_PAGES) {
    const file = join(ROOT, page);
    const html = readFileSync(file, 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n/, '');
    writeFileSync(file, html.replace('</head>', renderSchema(schemaFor(page)) + '\n</head>'));
    console.log('wrote', page);
  }
}
