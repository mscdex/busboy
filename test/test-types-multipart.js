var Busboy = require('..');

var path = require('path'),
    inspect = require('util').inspect,
    assert = require('assert');

var EMPTY_FN = function() {};

var t = 0,
    group = path.basename(__filename, '.js') + '/';
var tests = [
  { source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="file_name_0"',
       '',
       'super alpha file',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="file_name_1"',
       '',
       'super beta file',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
       'Content-Type: application/octet-stream',
       '',
       'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="upload_file_1"; filename="1k_b.dat"',
       'Content-Type: application/octet-stream',
       '',
       'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false],
      ['field', 'file_name_1', 'super beta file', false, false],
      ['file', 'upload_file_0', 1023, false, '1k_a.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_1', 1023, false, '1k_b.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Fields and files'
  },
  { source: [
      ['------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
       'Content-Disposition: form-data; name="cont"',
       '',
       'some random content',
       '------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
       'Content-Disposition: form-data; name="pass"',
       '',
       'some random pass',
       '------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
       'Content-Disposition: form-data; name="bit"',
       '',
       '2',
       '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--'
      ].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [
      ['field', 'cont', 'some random content', false, false],
      ['field', 'pass', 'some random pass', false, false],
      ['field', 'bit', '2', false, false]
    ],
    what: 'Fields only'
  },
  { source: [
      ''
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [],
    what: 'No fields and no files'
  },
  { source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="file_name_0"',
       '',
       'super alpha file',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
       'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
       'Content-Type: application/octet-stream',
       '',
       'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      fileSize: 13,
      fieldSize: 5
    },
    expected: [
      ['field', 'file_name_0', 'super', false, true],
      ['file', 'upload_file_0', 13, true, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Fields and files (limits)'
  },
];

function next() {
  if (t === tests.length)
    return;

  var v = tests[t];

  var busboy = new Busboy({
        limits: v.limits,
        headers: {
          'content-type': 'multipart/form-data; boundary=' + v.boundary
        }
      }),
      finishes = 0,
      results = [];

  busboy.on('field', function(key, val, keyTrunc, valTrunc) {
    results.push(['field', key, val, keyTrunc, valTrunc]);
  });
  busboy.on('file', function(fieldname, stream, filename, encoding, mimeType) {
    var nb = 0;
    stream.on('data', function(d) {
      nb += d.length;
    }).on('end', function() {
      results.push(['file', fieldname, nb, stream.truncated, filename, encoding, mimeType]);
    });
  });
  busboy.on('finish', function() {
    assert(finishes++ === 0, makeMsg(v.what, 'finish emitted multiple times'));
    assert.deepEqual(results.length,
                     v.expected.length,
                     makeMsg(v.what, 'Parsed result count mismatch. Saw '
                                     + results.length
                                     + '. Expected: ' + v.expected.length));

    results.forEach(function(result, i) {
      assert.deepEqual(result,
                       v.expected[i],
                       makeMsg(v.what,
                               'Result mismatch:\nParsed: ' + inspect(result)
                               + '\nExpected: ' + inspect(v.expected[i]))
                      );
    });
    ++t;
    next();
  });

  v.source.forEach(function(s) {
    busboy.write(new Buffer(s, 'utf8'), EMPTY_FN);
  });
  busboy.end();
}
next();

function makeMsg(what, msg) {
  return '[' + group + what + ']: ' + msg;
}

process.on('exit', function() {
  assert(t === tests.length, makeMsg('_exit', 'Only finished ' + t + '/' + tests.length + ' tests'));
});