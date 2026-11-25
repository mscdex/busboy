'use strict';

const assert = require('assert');
const { Readable } = require('stream');

const busboy = require('..');
const { mustCall } = require('./common.js');

const input = '--foo\r\n: oops\r\n\r\ncontent\r\n--foo--';
const bb = busboy({
  headers: { 'content-type': 'multipart/form-data; boundary=foo' },
});

bb.on('error', mustCall((err) => {
  assert.strictEqual(err.message, 'Malformed part header');
}));
bb.on('close', mustCall(() => {
  assert.strictEqual(bb.destroyed, true);
}));

Readable.from(Buffer.from(input)).pipe(bb);
