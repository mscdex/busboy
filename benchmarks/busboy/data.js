const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
const randomContent = Buffer.from(makeString(1024 * 500), 'utf8')
const buffer = createMultipartBuffer(boundary)

function makeString (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (var i = 0; i < length; i++) { // eslint-disable-line no-var
    result += characters.charAt(Math.floor(Math.random() *
            charactersLength))
  }
  return result
}

function createMultipartBuffer (boundary) {
  const payload = [
    '--' + boundary,
    'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
    'Content-Type: application/octet-stream',
    '',
    randomContent,
    '--' + boundary + '--'
  ].join('\r\n')
  return Buffer.from(payload, 'ascii')
}

module.exports = {
  boundary,
  buffer,
  randomContent
}
