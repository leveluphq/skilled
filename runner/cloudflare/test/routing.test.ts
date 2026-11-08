import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { authorized, bindingFor, classFor, languageFromPath, LANGUAGES } from '../src/routing.ts';

const require = createRequire(import.meta.url);

test('runs every language the app has an image for', () => {
  const { IMAGES } = require('../../../scripts/runner-images.js');
  assert.deepEqual([...LANGUAGES].sort(), Object.keys(IMAGES).sort());
});

test('reads the language from POST /run/{language}', () => {
  assert.equal(languageFromPath('/run/java'), 'java');
  assert.equal(languageFromPath('/run/cpp'), 'cpp');
  assert.equal(languageFromPath('/run/cobol'), null);
  assert.equal(languageFromPath('/run/java/extra'), null);
  assert.equal(languageFromPath('/run'), null);
});

test('names bindings and classes the way the wrangler config does', () => {
  assert.equal(bindingFor('csharp'), 'CSHARP');
  assert.equal(classFor('javascript'), 'JavascriptRunner');
  assert.equal(classFor('cpp'), 'CppRunner');
});

test('needs the exact bearer secret', () => {
  assert.equal(authorized('Bearer s3cret', 's3cret'), true);
  assert.equal(authorized('Bearer s3cre', 's3cret'), false);
  assert.equal(authorized('Bearer s3crett', 's3cret'), false);
  assert.equal(authorized('s3cret', 's3cret'), false);
  assert.equal(authorized(null, 's3cret'), false);
  // An unconfigured secret refuses everything
  assert.equal(authorized('Bearer ', ''), false);
  assert.equal(authorized('Bearer anything', undefined), false);
});
