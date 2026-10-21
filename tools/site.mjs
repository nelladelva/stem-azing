// Helpers for the site checks: find files, read them, pull out links and text.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, posix, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SKIP = new Set(['.git', 'docs', '.superpowers', 'node_modules']);

function walk(dir, skip, out = []) {
  for (const name of readdirSync(join(ROOT, dir))) {
    if (skip.has(name)) continue;
    const rel = dir ? `${dir}/${name}` : name;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, skip, out);
    else out.push(rel);
  }
  return out;
}

export function htmlFiles() {
  return walk('', SKIP).filter(f => f.endsWith('.html')).sort();
}

export function sourceFiles(exts) {
  const skip = new Set([...SKIP, 'tools']);
  return walk('', skip).filter(f => exts.includes(extname(f))).sort();
}

export const read = rel => readFileSync(join(ROOT, rel), 'utf8');

export function refs(html) {
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => (/\bsrc=/.test(m.slice(0, m.indexOf('>'))) ? m.slice(0, m.indexOf('>') + 1) : ''));
  return [...clean.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/gi)].map(m => m[1]);
}

export function resolveRef(fromRel, ref) {
  if (!ref || ref.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('//')) return null;
  let path = ref.split('#')[0].split('?')[0];
  if (!path) return null;
  path = decodeURI(path);
  let target = path.startsWith('/') ? path.slice(1) : posix.join(posix.dirname(fromRel), path);
  target = posix.normalize(target);
  if (target === '.' || target === '' || target.endsWith('/')) target = posix.join(target === '.' ? '' : target, 'index.html');
  return target;
}

export function text(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(em|strong|b|i|a|span|mark|del|small|abbr|sup|sub)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rarr;/g, '→').replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–').replace(/&euro;/g, '€').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

export function wordCount(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const t = text(m ? m[1] : html);
  return t ? t.split(' ').length : 0;
}

// Service cards: <article class="card service" data-service="Name"> … .amount[data-eur][data-usd] …
// Returns { Name: { eur, usd, all: [[eur, usd], …], html } } — eur/usd from the first .amount.
export function parsePrices(html) {
  const out = {};
  for (const m of html.matchAll(/<article\b[^>]*class="[^"]*\bservice\b[^"]*"[^>]*data-service="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
    const name = m[1].replace(/&amp;/g, '&');
    const body = m[2];
    const pairs = [...body.matchAll(/data-eur="([^"]+)"\s+data-usd="([^"]+)"/g)].map(p => [p[1], p[2]]);
    const first = body.match(/class="amount"[^>]*data-eur="([^"]+)"\s+data-usd="([^"]+)"/);
    out[name] = { eur: first?.[1], usd: first?.[2], all: pairs, html: body };
  }
  return out;
}
