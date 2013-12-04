var UrlEncoded = require('../lib/types/urlencoded'),
    parseParams = require('../lib/utils').parseParams;

var path = require('path'),
    EventEmitter = require('events').EventEmitter,
    inspect = require('util').inspect,
    assert = require('assert');

var EMPTY_FN = function() {};

var t = 0,
    group = path.basename(__filename, '.js') + '/';

var parsedConType;
parsedConType = parseParams('application/x-www-form-urlencoded; charset=utf-8');

var tests = [
  { source: ['foo'],
    expected: [['foo', undefined, false, false]],
    what: 'Unassigned value'
  },
  { source: ['foo=bar'],
    expected: [['foo', 'bar', false, false]],
    what: 'Assigned value'
  },
  { source: ['foo&bar=baz'],
    expected: [['foo', undefined, false, false],
               ['bar', 'baz', false, false]],
    what: 'Unassigned and assigned value'
  },
  { source: ['foo=bar&baz'],
    expected: [['foo', 'bar', false, false],
               ['baz', undefined, false, false]],
    what: 'Assigned and unassigned value'
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
               ['baz', 'bla', false, false]],
    what: 'Two assigned values'
  },
  { source: ['foo&bar'],
    expected: [['foo', undefined, false, false],
               ['bar', undefined, false, false]],
    what: 'Two unassigned values'
  },
  { source: ['foo&bar&'],
    expected: [['foo', undefined, false, false],
               ['bar', undefined, false, false]],
    what: 'Two unassigned values and ampersand'
  },
  { source: ['foo=bar+baz%2Bquux'],
    expected: [['foo', 'bar baz+quux', false, false]],
    what: 'Assigned value with (plus) space'
  },
  { source: ['foo=bar%20baz%21'],
    expected: [['foo', 'bar baz!', false, false]],
    what: 'Assigned value with encoded bytes'
  },
  { source: ['foo%20bar=baz%20bla%21'],
    expected: [['foo bar', 'baz bla!', false, false]],
    what: 'Assigned value with encoded bytes #2'
  },
  { source: ['foo=bar%20baz%21&num=1000'],
    expected: [['foo', 'bar baz!', false, false],
               ['num', '1000', false, false]],
    what: 'Two assigned values, one with encoded bytes'
  },
  { source: ['foo=bar&baz=bla'],
    expected: [],
    what: 'Limits: zero fields',
    limits: { fields: 0 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false]],
    what: 'Limits: one field',
    limits: { fields: 1 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
               ['baz', 'bla', false, false]],
    what: 'Limits: field part lengths match limits',
    limits: { fieldNameSize: 3, fieldSize: 3 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['fo', 'bar', false, true],
               ['ba', 'bla', false, true]],
    what: 'Limits: truncated field name',
    limits: { fieldNameSize: 2 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['foo', 'ba', true, false],
               ['baz', 'bl', true, false]],
    what: 'Limits: truncated field value',
    limits: { fieldSize: 2 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['fo', 'ba', true, true],
               ['ba', 'bl', true, true]],
    what: 'Limits: truncated field name and value',
    limits: { fieldNameSize: 2, fieldSize: 2 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['fo', undefined, true, true],
               ['ba', undefined, true, true]],
    what: 'Limits: truncated field name and zero value limit',
    limits: { fieldNameSize: 2, fieldSize: 0 }
  },
  { source: ['foo=bar&baz=bla'],
    expected: [['', undefined, true, true],
               ['', undefined, true, true]],
    what: 'Limits: truncated zero field name and zero value limit',
    limits: { fieldNameSize: 0, fieldSize: 0 }
  },
  { source: ['&'],
    expected: [],
    what: 'Ampersand'
  },
  { source: ['&&&&&'],
    expected: [],
    what: 'Many ampersands'
  },
  { source: ['='],
    expected: [['', undefined, false, false]],
    what: 'Assigned value, empty name and value'
  },
  { source: [''],
    expected: [],
    what: 'Nothing'
  },
];

function next() {
  if (t === tests.length)
    return;

  var v = tests[t];

  var busboy = new EventEmitter(), ue, results = [];
  busboy.on('field', function(key, val, valTrunc, keyTrunc) {
    results.push([key, val, valTrunc, keyTrunc]);
  });
  busboy.on('end', function() {
    assert.deepEqual(results.length,
                     v.expected.length,
                     makeMsg(v.what, 'Parsed result count mismatch. Saw '
                                     + results.length
                                     + '. Expected: ' + v.expected.length));

    var i = 0;
    results.forEach(function(result) {
      assert.deepEqual(result,
                       v.expected[i],
                       makeMsg(v.what,
                               'Result mismatch:\nParsed: ' + inspect(result)
                               + '\nExpected: ' + inspect(v.expected[i]))
                      );
      ++i;
    });
    ++t;
    next();
  });

  var cfg = {
    limits: v.limits,
    headers: null,
    parsedConType: parsedConType
  };
  ue = new UrlEncoded(busboy, cfg);

  v.source.forEach(function(s) {
    ue.write(new Buffer(s, 'utf8'), EMPTY_FN);
  });
  ue.end();
}
next();

function makeMsg(what, msg) {
  return '[' + group + what + ']: ' + msg;
}

process.on('exit', function() {
  assert(t === tests.length, makeMsg('_exit', 'Only finished ' + t + '/' + tests.length + ' tests'));
});
