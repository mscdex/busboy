const Dicer = require('../../deps/dicer/lib/Dicer')

function createMultipartBuffer(boundary, size) {
  const head =
    '--' + boundary + '\r\n'
    + 'content-disposition: form-data; name="field1"\r\n'
    + '\r\n'
    , tail = '\r\n--' + boundary + '--\r\n'
    , buffer = Buffer.allocUnsafe(size);

  buffer.write(head, 0, 'ascii');
  buffer.write(tail, buffer.length - tail.length, 'ascii');
  return buffer;
}

for (var i = 0, il = 10; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073',
    d = new Dicer({ boundary: boundary }),
    mb = 100,
    buffer = createMultipartBuffer(boundary, mb * 1024 * 1024),
    callbacks =
    {
      partBegin: -1,
      partEnd: -1,
      headerField: -1,
      headerValue: -1,
      partData: -1,
      end: -1,
    };


  d.on('part', function (p) {
    callbacks.partBegin++;
    p.on('header', function (header) {
      /*for (var h in header)
      console.log('Part header: k: ' + inspect(h) + ', v: ' + inspect(header[h]));*/
    });
    p.on('data', function (data) {
      callbacks.partData++;
      //console.log('Part data: ' + inspect(data.toString()));
    });
    p.on('end', function () {
      //console.log('End of part\n');
      callbacks.partEnd++;
    });
  });
  d.on('end', function () {
    //console.log('End of parts');
    callbacks.end++;
  });

  const start = +new Date();
  d.write(buffer);
  const duration = +new Date - start;
  const mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');
}
