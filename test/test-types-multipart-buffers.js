'use strict';

const assert = require('assert');
const { inspect } = require('util');

const { mustCall } = require(`${__dirname}/common.js`);

const busboy = require('../lib');

const input = Buffer.from([
  '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
 'Content-Disposition: form-data; '
   + 'name="content"',
 'Content-Type: text/plain',
 '',
 'A'.repeat(1023),
 '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
].join('\r\n'));
const boundary = '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k';
const expected = [
  { type: 'field',
    name: 'content',
    val: Buffer.from('A'.repeat(1023)),
    info: {
      nameTruncated: false,
      valueTruncated: false,
      encoding: '7bit',
      mimeType: 'text/plain',
    },
  },
];
const bb = busboy({
  headers: {
    'content-type': `multipart/form-data; boundary=${boundary}`,
  },
  bufferOutput: true
});
const results = [];

bb.on('field', (name, val, info) => {
  results.push({ type: 'field', name, val, info });
});

bb.on('file', (name, stream, info) => {
  const data = [];
  let nb = 0;
  const file = {
    type: 'file',
    name,
    data: null,
    info,
    limited: false,
  };
  results.push(file);
  stream.on('data', (d) => {
    data.push(d);
    nb += d.length;
  }).on('limit', () => {
    file.limited = true;
  }).on('close', () => {
    file.data = Buffer.concat(data, nb);
    assert.strictEqual(stream.truncated, file.limited);
  }).once('error', (err) => {
    file.err = err.message;
  });
});

bb.on('error', (err) => {
  results.push({ error: err.message });
});

bb.on('partsLimit', () => {
  results.push('partsLimit');
});

bb.on('filesLimit', () => {
  results.push('filesLimit');
});

bb.on('fieldsLimit', () => {
  results.push('fieldsLimit');
});

bb.on('close', mustCall(() => {
  assert.deepStrictEqual(
    results,
    expected,
    'Results mismatch.\n'
      + `Parsed: ${inspect(results)}\n`
      + `Expected: ${inspect(expected)}`
  );
}));

bb.end(input);
