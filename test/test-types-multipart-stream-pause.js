var Busboy = require('..');

var path = require('path');
var inspect = require('util').inspect;
var assert = require('assert');

function formDataSection(key, value) {
  return Buffer.from('\r\n--' + BOUNDARY
                     + '\r\nContent-Disposition: form-data; name="'
                     + key + '"\r\n\r\n' + value);
}
function formDataFile(key, filename, contentType) {
  return Buffer.concat([
    Buffer.from('\r\n--' + BOUNDARY + '\r\n'),
    Buffer.from('Content-Disposition: form-data; name="'
                + key + '"; filename="' + filename + '"\r\n'),
    Buffer.from('Content-Type: ' + contentType + '\r\n\r\n'),
    Buffer.allocUnsafe(100000)
  ]);
}

var BOUNDARY = 'u2KxIV5yF1y+xUspOQCCZopaVgeV6Jxihv35XQJmuTx8X3sh';
var reqChunks = [
  Buffer.concat([
    formDataFile('file', 'file.bin', 'application/octet-stream'),
    formDataSection('foo', 'foo value')
  ]),
  formDataSection('bar', 'bar value'),
  Buffer.from('\r\n--' + BOUNDARY + '--\r\n')
];
var busboy = new Busboy({
  headers: {
    'content-type': 'multipart/form-data; boundary=' + BOUNDARY
  }
});
var finishes = 0;
var results = [];
var expected = [
  ['file', 'file', 'file.bin', '7bit', 'application/octet-stream'],
  ['field', 'foo', 'foo value', false, false, '7bit', 'text/plain'],
  ['field', 'bar', 'bar value', false, false, '7bit', 'text/plain'],
];

busboy.on('field', function(key, val, keyTrunc, valTrunc, encoding, contype) {
  results.push(['field', key, val, keyTrunc, valTrunc, encoding, contype]);
});
busboy.on('file', function(fieldname, stream, filename, encoding, mimeType) {
  results.push(['file', fieldname, filename, encoding, mimeType]);
  // Simulate a pipe where the destination is pausing (perhaps due to waiting
  // for file system write to finish)
  setTimeout(function() {
    stream.resume();
  }, 10);
});
busboy.on('finish', function() {
  assert(finishes++ === 0, 'finish emitted multiple times');
  assert.deepEqual(results.length,
                   expected.length,
                   'Parsed result count mismatch. Saw '
                     + results.length
                     + '. Expected: ' + expected.length);

  results.forEach(function(result, i) {
    assert.deepEqual(result,
                     expected[i],
                     'Result mismatch:\nParsed: ' + inspect(result)
                       + '\nExpected: ' + inspect(expected[i]));
  });
}).on('error', function(err) {
  assert(false, 'Unexpected error: ' + err.stack);
});

reqChunks.forEach(function(buf) {
  busboy.write(buf);
});
busboy.end();

process.on('exit', function() {
  assert(finishes === 1, 'busboy did not finish');
});
