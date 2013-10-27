var parseParams = require('../lib/utils').parseParams;

var path = require('path'),
    assert = require('assert');

var group = path.basename(__filename, '.js') + '/';

[
  { source: 'text/plain; encoding=utf8',
    expected: ['text/plain', ['encoding', 'utf8']],
    what: 'Unquoted'
  },
  { source: 'text/plain; encoding="utf8"',
    expected: ['text/plain', ['encoding', 'utf8']],
    what: 'Quoted'
  },
  { source: 'text/plain; greeting="hello \\"world\\""',
    expected: ['text/plain', ['greeting', 'hello "world"']],
    what: 'Quotes within quoted'
  },
  { source: 'text/plain; encoding="utf8";\t   foo=bar;test',
    expected: ['text/plain', ['encoding', 'utf8'], ['foo', 'bar'], 'test'],
    what: 'Multiple params with various spacing'
  },
].forEach(function(v) {
  var result = parseParams(v.source),
      msg = '[' + group + v.what + ']: parsed parameters mismatch';
  assert.deepEqual(result, v.expected, msg);
});
