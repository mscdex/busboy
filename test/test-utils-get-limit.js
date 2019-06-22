var getLimit = require('../lib/utils').getLimit;

var assert = require('assert').strict;

assert.deepStrictEqual(getLimit(undefined, 'fieldSize', 1), 1);
assert.deepStrictEqual(getLimit(undefined, 'fileSize', Infinity), Infinity);

assert.deepStrictEqual(getLimit({}, 'fieldSize', 1), 1);
assert.deepStrictEqual(getLimit({}, 'fileSize', Infinity), Infinity);

assert.deepStrictEqual(getLimit({ fieldSize: 0 }, 'fieldSize', 1), 0);
assert.deepStrictEqual(getLimit({ fileSize: 2 }, 'fileSize', 1), 2);

assert.throws(function() {
  getLimit({ fieldSize: '1' }, 'fieldSize', 1);
}, { message: 'busboy: limit fieldSize is not a number' });
