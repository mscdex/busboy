var getLimit = require('../lib/utils').getLimit;

var assert = require('assert');

assert.strictEqual(getLimit(undefined, 'fieldSize', 1), 1);
assert.strictEqual(getLimit(undefined, 'fileSize', Infinity), Infinity);

assert.strictEqual(getLimit({}, 'fieldSize', 1), 1);
assert.strictEqual(getLimit({}, 'fileSize', Infinity), Infinity);
assert.strictEqual(getLimit({ fieldSize: null }, 'fieldSize', 1), 1);
assert.strictEqual(getLimit({ fileSize: null }, 'fileSize', Infinity), Infinity);

assert.strictEqual(getLimit({ fieldSize: 0 }, 'fieldSize', 1), 0);
assert.strictEqual(getLimit({ fileSize: 2 }, 'fileSize', 1), 2);

assert.throws(function() {
  getLimit({ fieldSize: '1' }, 'fieldSize', 1);
}, /^Error: Limit fieldSize is not a valid number$/);

assert.throws(function() {
  getLimit({ fieldSize: NaN }, 'fieldSize', 1);
}, /^Error: Limit fieldSize is not a valid number$/);
