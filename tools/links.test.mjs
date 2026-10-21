import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, htmlFiles, read, refs, resolveRef } from './site.mjs';

test('every internal link and asset resolves', () => {
  const misses = [];
  for (const f of htmlFiles()) {
    for (const r of refs(read(f))) {
      const target = resolveRef(f, r);
      if (target !== null && !existsSync(join(ROOT, target))) misses.push(`${f} -> ${r}`);
    }
  }
  assert.deepEqual(misses, []);
});
