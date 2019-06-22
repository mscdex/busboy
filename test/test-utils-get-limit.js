var getLimit = require('../lib/utils').getLimit;

var assert = require('assert');

assert.deepEqual(getLimit(undefined, 'fieldSize', 1), 1);
assert.deepEqual(getLimit(undefined, 'fileSize', Infinity), Infinity);

assert.deepEqual(getLimit({}, 'fieldSize', 1), 1);
assert.deepEqual(getLimit({}, 'fileSize', Infinity), Infinity);

assert.deepEqual(getLimit({ fieldSize: 0 }, 'fieldSize', 1), 0);
assert.deepEqual(getLimit({ fileSize: 2 }, 'fileSize', 1), 2);

assert.throws(function() {
  getLimit({ fieldSize: '1' }, 'fieldSize', 1);
}, /^Error: busboy: limit fieldSize is not a number$/);
