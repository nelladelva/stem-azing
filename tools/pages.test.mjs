import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, text, wordCount } from './site.mjs';

const has = (t, list) => { for (const s of list) assert.ok(t.includes(s), `missing: ${s}`); };

test('home', () => {
  const h = read('index.html'), t = text(h);
  has(t, ['Curiosity is currency for success', 'Science made clear, for every classroom, page and lab.',
    "I'm Dr. Nella C. Delva, a neuroscientist and writer in Berlin. I partner with educators, authors and research teams to communicate complex science with clarity, accuracy and impact.",
    'Choose what fits you', 'For educators', 'For writing', 'For research teams', 'Ghostwriting also offered',
    'Bench to page', 'Clear for anyone', 'Haiti → USA → Berlin', 'Not sure where to start?', 'No VAT is charged under § 19 UStG.']);
  assert.ok(h.includes('/css/site.css') && !h.includes('styles.css'));
  assert.ok(wordCount(h) <= 300, `words: ${wordCount(h)}`);
});

test('home shows the 3 newest posts', () => {
  const h = read('index.html');
  const sec = h.slice(h.indexOf('id="blog"'));
  const posts = [...sec.matchAll(/href="\/posts\/([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual([...new Set(posts)].slice(0, 3), ['organoids-vs-animal-models.html', 'research-without-borders.html', 'full-circle-fulbright.html']);
});
