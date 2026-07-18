'use strict';

const assert = require('assert');

const { mustCall } = require('./common.js');

const busboy = require('..');

// Verifies that the parsed Content-Disposition parameters of each part are
// surfaced as `info.dispositionParams` on both the `file` and `field` events.
// This exposes every disposition parameter (the standard `name`/`filename` as
// well as any custom parameter such as `group`) without changing any existing
// field of the info object.

const boundary = '----DispositionParamsTest';
const body = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="foo"; group="avatars"',
  '',
  'bar',
  `--${boundary}`,
  'Content-Disposition: form-data; '
    + 'name="myfile"; filename="a.txt"; group="docs"',
  'Content-Type: text/plain',
  '',
  'file contents',
  `--${boundary}`,
  'Content-Disposition: form-data; name="plain"',
  '',
  'nothing',
  `--${boundary}--`,
].join('\r\n');

const bb = busboy({
  headers: {
    'content-type': `multipart/form-data; boundary=${boundary}`,
  }
});

const fields = [];
const files = [];

bb.on('field', mustCall((name, val, info) => {
  fields.push({ name, val, info });
}, 2));

bb.on('file', mustCall((name, stream, info) => {
  const chunks = [];
  files.push({ name, info });
  stream.on('data', (d) => chunks.push(d))
        .on('close', () => {
          files[files.length - 1].data = Buffer.concat(chunks);
        });
}, 1));

bb.on('error', (err) => { assert.ifError(err); });

bb.on('close', mustCall(() => {
  // --- field with a custom parameter -------------------------------------
  const foo = fields.find((f) => f.name === 'foo');
  assert.ok(foo, 'the `foo` field was parsed');
  assert.ok(foo.info.dispositionParams,
            'field info exposes dispositionParams');
  assert.strictEqual(foo.info.dispositionParams.name, 'foo');
  assert.strictEqual(foo.info.dispositionParams.group, 'avatars');
  // Existing info fields are unchanged (strict superset)
  assert.strictEqual(foo.info.encoding, '7bit');
  assert.strictEqual(foo.info.mimeType, 'text/plain');
  assert.strictEqual(foo.info.nameTruncated, false);
  assert.strictEqual(foo.info.valueTruncated, false);

  // --- field without any extra parameter ---------------------------------
  const plain = fields.find((f) => f.name === 'plain');
  assert.ok(plain, 'the `plain` field was parsed');
  assert.ok(plain.info.dispositionParams,
            'a part with only a name still exposes dispositionParams');
  assert.strictEqual(plain.info.dispositionParams.name, 'plain');
  assert.strictEqual(plain.info.dispositionParams.group, undefined);

  // --- file with a custom parameter --------------------------------------
  assert.strictEqual(files.length, 1);
  const file = files[0];
  assert.strictEqual(file.name, 'myfile');
  assert.ok(file.info.dispositionParams,
            'file info exposes dispositionParams');
  assert.strictEqual(file.info.dispositionParams.name, 'myfile');
  assert.strictEqual(file.info.dispositionParams.filename, 'a.txt');
  assert.strictEqual(file.info.dispositionParams.group, 'docs');
  // Existing info fields are unchanged (strict superset)
  assert.strictEqual(file.info.filename, 'a.txt');
  assert.strictEqual(file.info.encoding, '7bit');
  assert.strictEqual(file.info.mimeType, 'text/plain');
  assert.strictEqual(file.data.toString(), 'file contents');
}, 1));

bb.end(Buffer.from(body, 'utf8'));
