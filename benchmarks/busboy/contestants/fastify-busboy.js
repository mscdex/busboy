const Busboy = require('../../../lib/main');

const boundary = '-----------------------------168072824752491622650073'

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

function process() {
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=' + boundary
    }
  })
  const mb = 100,
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

  let processedData = ''

  return new Promise((resolve, reject) => {
      busboy.on('part', function (p) {
          callbacks.partBegin++;
          p.on('header', function (header) {
              /*for (var h in header)
              console.log('Part header: k: ' + inspect(h) + ', v: ' + inspect(header[h]));*/
          });
          p.on('data', function (data) {
              callbacks.partData++;
              processedData += data
              //console.log('Part data: ' + inspect(data.toString()));
          });
          p.on('end', function () {
              //console.log('End of part\n');
              callbacks.partEnd++;
          });
          p.on('error', (err) => {
              reject(err)
          })

      });
      busboy.on('end', function () {
          //console.log('End of parts');
          callbacks.end++;
          resolve(processedData)
      });
      busboy.on('error', (err) => {
          reject(err)
      })

      busboy.on('finish', function () {
          resolve(processedData)
      })

      busboy.write(buffer);
  })
}

module.exports = {
  process,
};
