import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, text, htmlFiles } from './site.mjs';

// Removes every element marked data-nosnippet (with its nested children), as Google does for snippets.
export function withoutNosnippet(html) {
  let out = html, m;
  const open = /<([a-z][a-z0-9]*)\b[^>]*\bdata-nosnippet\b[^>]*>/i;
  while ((m = open.exec(out))) {
    const tag = m[1], re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = m.index + m[0].length;
    let depth = 1, end = out.length, t;
    while (depth && (t = re.exec(out))) { depth += t[1] ? -1 : 1; if (!depth) end = t.index + t[0].length; }
    out = out.slice(0, m.index) + out.slice(end);
  }
  return out;
}

const PRICE = /€\s?\d|\d[\d.,]*\s?€|\$\s?\d|\d[\d.,]*\s?\$/;

test('helper removes marked elements, nested ones included', () => {
  assert.equal(text(withoutNosnippet('<p>a</p><div data-nosnippet><div>€150</div></div><p>b</p>')), 'a b');
});

test('Google cannot quote any price: every price sits in a data-nosnippet element', () => {
  const bad = [];
  for (const f of htmlFiles().filter(f => !f.startsWith('posts/'))) {
    const h = read(f);
    if (h.includes('http-equiv="refresh"')) continue;
    const m = text(withoutNosnippet(h.replace(/<head>[\s\S]*?<\/head>/, ''))).match(new RegExp(`.{0,30}(${PRICE.source}).{0,20}`));
    if (m) bad.push(`${f}: …${m[0]}…`);
  }
  assert.deepEqual(bad, []);
});
