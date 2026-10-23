import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, read, text, wordCount, htmlFiles } from './site.mjs';

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

// Facts Nella confirmed on 23 Oct 2026: 10+ years of research (not "R&D"), AUC 0.61, EXIST in preparation, FSU from 2018.
const DOIS = ['10.1177/1535370221991830', '10.1007/s42764-021-00038-x', '10.1021/acsptsci.1c00035', '10.2967/jnumed.118.217240'];

test('biography', () => {
  for (const [f, pre, facts] of [
    ['biography.html', '', ['10+ years of research', 'Three ways I work', 'Mentoring & tutoring', 'Research & science writing',
      'Data analysis & interpretation', 'Timeline', 'Education', 'Publications', 'Fellowships & awards', 'Languages',
      'Polygence', '15+', '100+ graduate students', '100+ citations', 'Fulbright', 'McKnight', 'Max Delbrück Center',
      'Moffitt', 'Hillsborough Community College', '2018 – 2025', 'EXIST application in preparation', '0.61', '779']],
    ['de/biography.html', '/de', ['über 10 Jahren Forschung', 'Drei Arten, wie ich arbeite', 'Mentoring & Nachhilfe',
      'Forschung & Wissenschaftsjournalismus', 'Datenanalyse & Interpretation', 'Werdegang', 'Ausbildung', 'Publikationen',
      'Stipendien & Auszeichnungen', 'Sprachen', 'Polygence', '2018 – 2025', 'EXIST-Antrag in Vorbereitung', '0,61', '779',
      'Die gesamte Kommunikation erfolgt auf Englisch.']],
  ]) {
    const h = read(f), t = text(h);
    for (const s of facts) assert.ok(t.includes(s), `${f}: missing ${s}`);
    for (const bad of ['0.772', '0,772', 'R&D', '15+ years', '15+ Jahre', '2020 – 2025']) assert.ok(!t.includes(bad), `${f}: says ${bad}`);
    assert.ok(!/EXIST[^.]{0,40}(awarded|won|successful|erfolgreich|bewilligt)/i.test(t), `${f}: EXIST claimed as won`);
    for (const d of DOIS) assert.ok(h.includes(`href="https://doi.org/${d}"`), `${f}: DOI ${d}`);
    for (const slug of ['tutoring', 'writing', 'data-analysis']) assert.ok(h.includes(`href="${pre}/request/${slug}.html"`), `${f}: form ${slug}`);
    assert.ok(!/[€$]\s?\d/.test(t), `${f}: shows a price`);
  }
  assert.ok(read('about.html').includes('href="/biography.html"'), 'About links to the biography');
  assert.ok(read('de/about.html').includes('href="/de/biography.html"'), 'German About links to the German biography');
});

test('consulting portfolio', () => {
  const h = read('consulting-portfolio.html'), t = text(h);
  for (const id of ['case-study-1', 'case-study-2']) assert.ok(h.includes(`id="${id}"`), id);
  has(t, ['Le Wagon', 'Python', 'SQL', 'Starter', 'Standard', 'Advanced', 'Grant']);
  assert.ok(h.includes('href="/services.html#research"') && h.includes('href="/booking.html"'));
  assert.ok(h.includes('/css/site.css'));
  if (t.includes('NeuroPenetrance')) assert.ok(t.includes('779') && t.includes('0.61'), 'NeuroPenetrance facts');
});

test('writing', () => {
  const h = read('writing.html'), t = text(h);
  has(t, ['Rigorous enough for peer review. Clear enough for everyone else.', 'may potentially have possibly had', 'Written for different readers',
    'Peer-reviewed and published', 'Need writing like this?', 'Editing from €150 per 1,000 words; scientific edits €220.',
    'Ghostwriting also offered', 'No VAT is charged under § 19 UStG.']);
  for (const f of ['all', 'scientist', 'medical', 'general', 'career']) assert.ok(h.includes(`data-filter="${f}"`), f);
  const bdnf = h.match(/<article[^>]*data-tags[^>]*>(?:(?!<\/article>)[\s\S])*bdnf-therapeutic[\s\S]*?<\/article>/);
  assert.ok(bdnf && /co-authored/i.test(bdnf[0]), 'BDNF labelled co-authored');
  const posts = readdirSync(join(ROOT, 'posts')).filter(f => f.endsWith('.html'));
  for (const p of posts) assert.ok(h.includes(`href="/posts/${p}"`), p);
  assert.ok(!h.includes('/post/'), 'no old Wix post links');
  assert.ok(!t.includes('Two ways to work with a scientist who writes'));
});

test('home links to the writing page', () => {
  assert.ok(read('index.html').includes('href="/writing.html"'));
});

test('neuropenetrance', () => {
  const h = read('neuropenetrance.html'), t = text(h);
  has(t, ['six-gene', '779', '0.61', '8 of 8', 'in development', 'research use', 'Try the PenetranSci demo']);
  assert.ok(h.includes('href="https://neuropenetrance.com'), 'link to neuropenetrance.com');
  assert.ok(/<a [^>]*href="https:\/\/neuropenetrance\.streamlit\.app\/?"[^>]*target="_blank"[^>]*>\s*Try the PenetranSci demo/.test(h), 'demo button');
  assert.ok(!/<iframe/i.test(h), 'no iframe');
});

test('booking', () => {
  const h = read('booking.html'), t = text(h);
  assert.ok(![...h.matchAll(/<script\b[^>]*>/g)].some(m => /calendly/i.test(m[0])), 'no Calendly script in static HTML');
  assert.ok(h.includes('data-url="https://calendly.com/nella-delva/new-meeting-2"'));
  assert.ok(h.includes('href="https://calendly.com/nella-delva/new-meeting-2"'));
  has(t, ['20 minutes, free', 'stemazing.advancement@gmail.com']);
});

test('posts use the shared layout, text unchanged', () => {
  const files = readdirSync(join(ROOT, 'posts')).filter(f => f.endsWith('.html'));
  assert.equal(files.length, 16);
  const article = h => text((h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/) || [])[1] || '');
  for (const f of files) {
    const h = read(`posts/${f}`);
    assert.ok(h.includes('id="site-header"') && h.includes('id="site-footer"'), `${f}: header/footer slots`);
    assert.ok(!h.includes('class="site-nav"'), `${f}: old nav removed`);
    assert.ok(h.includes('href="/css/site.css"') && h.includes('src="/nav.js"'), `${f}: shared css/nav`);
    assert.ok(/<article\b[^>]*class="[^"]*\bprose\b/.test(h), `${f}: prose`);
    const before = execSync(`git show main:posts/${f}`, { cwd: ROOT, encoding: 'utf8' });
    assert.equal(article(h), article(before), `${f}: article text changed`);
  }
});

test('portrait appears only on the home page', () => {
  const allowed = ['de/index.html', 'index.html'];
  const withPhoto = htmlFiles().filter(f => read(f).includes('headshot.jpg')).sort();
  assert.deepEqual(withPhoto, allowed);
});

test('consistent facts: PhD field, years in research, German patient wording', () => {
  for (const f of ['index.html', 'about.html', 'de/index.html', 'de/about.html', 'services.html', 'de/services.html'])
    assert.ok(!/15\+/.test(text(read(f))), `${f}: says 15+ years`);
  assert.ok(text(read('about.html')).includes('a PhD in biomedical sciences (neuroscience) at FSU'));
  assert.ok(text(read('de/about.html')).includes('Promotion in Biomedizinischen Wissenschaften (Neurowissenschaften) an der FSU'));
  const np = text(read('de/neuropenetrance.html'));
  assert.ok(!np.includes('etwa jede fünfte Person'), 'de NeuroPenetrance: "Person" instead of patient');
  assert.ok(np.includes('etwa jede fünfte Patientin bzw. jeder fünfte Patient'));
});
