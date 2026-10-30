import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('the retired "what brought you here" opener never ships', () => {
  for (const f of ['public/home.js', 'public/index.html', 'functions/_lib/prompts.js']) {
    assert.doesNotMatch(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), /normally ask what brought you here/i, f);
  }
});
