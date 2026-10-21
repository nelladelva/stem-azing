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

test('about', () => {
  const h = read('about.html'), t = text(h);
  has(t, ['I make science clear, for whoever is in the room.', 'One idea, three audiences', 'Can inflammation in the body affect depression?',
    'For a student', 'For a curious reader', 'For a research team', 'Haiti → Florida → Berlin', 'Where curiosity began', 'McKnight',
    'Have something that needs to be clear?']);
  assert.ok(!t.includes('where I grew up'));
  assert.ok(wordCount(h) <= 380, `words: ${wordCount(h)}`);
});

test('consulting portfolio', () => {
  const h = read('consulting-portfolio.html'), t = text(h);
  for (const id of ['case-study-1', 'case-study-2']) assert.ok(h.includes(`id="${id}"`), id);
  has(t, ['Le Wagon', 'Python', 'SQL', 'Starter', 'Standard', 'Advanced', 'Grant']);
  assert.ok(h.includes('href="/services.html#research"') && h.includes('href="/booking.html"'));
  assert.ok(h.includes('/css/site.css'));
  if (t.includes('NeuroPenetrance')) assert.ok(t.includes('779') && t.includes('0.61'), 'NeuroPenetrance facts');
});
