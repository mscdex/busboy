const Busboy = require('../../../lib/main')
const { buffer, boundary } = require('../data')

function process () {
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=' + boundary
    }
  })

  let processedData = ''

  return new Promise((resolve, reject) => {
    busboy.on('file', (field, file, filename, encoding, mimetype) => {
      // console.log('read file')
      file.on('data', (data) => {
        processedData += data.toString()
        // console.log(`File [${filename}] got ${data.length} bytes`);
      })
      file.on('end', (fieldname) => {
        // console.log(`File [${fieldname}] Finished`);
      })
    })

    busboy.on('error', function (err) {
      reject(err)
    })
    busboy.on('finish', function () {
      resolve(processedData)
    })
    busboy.write(buffer, () => { })

    busboy.end()
  })
}

module.exports = {
  process
}
