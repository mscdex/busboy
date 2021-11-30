const Dicer = require('../deps/dicer/lib/Dicer')
const { expect } = require('chai')

describe('dicer-malformed-header', () => {
  it('should gracefully handle headers with leading whitespace', done => {
    const d = new Dicer({ boundary: '----WebKitFormBoundaryoo6vortfDzBsDiro' })

    d.on('part', function (p) {
      p.on('header', function (header) {
        expect(header).has.property(' content-disposition')
        expect(header[' content-disposition']).to.be.eql(['form-data; name="bildbeschreibung"'])
      })
      p.on('data', function (data) {
      })
      p.on('end', function () {
      })
    })
    d.on('finish', function () {
      done()
    })

    d.write(Buffer.from('------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'))
  })
})
