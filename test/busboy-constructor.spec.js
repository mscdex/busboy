const Busboy = require('../lib/main')
const { expect } = require('chai')

describe('busboy-constructor', () => {
  it('should throw an Error if no options are provided', () => {
    expect(() => new Busboy()).to.throw('Busboy expected an options-Object.')
  })
  it('should throw an Error if options does not contain headers', () => {
    expect(() => new Busboy({})).to.throw('Busboy expected an options-Object with headers-attribute.')
  })
  it('if busboy is called without new-operator, still creates a busboy instance', () => {
    const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    expect(busboyInstance).to.be.instanceOf(Busboy)
  })
  it('should throw an Error if content-type is not set', () => {
    expect(() => new Busboy({ headers: {} })).to.throw('Missing Content-Type-header.')
  })
  it('should throw an Error if content-type is unsupported', () => {
    expect(() => new Busboy({ headers: { 'content-type': 'unsupported' } })).to.throw('Unsupported Content-Type.')
  })
  it('should not throw an Error if content-type is multipart', () => {
    expect(() => new Busboy({ headers: { 'content-type': 'multipart/form-data' } })).to.not.throw('Unsupported Content-Type.')
  })
  it('should not throw an Error if content-type is urlencoded', () => {
    expect(() => new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })).to.not.throw('Unsupported Content-Type.')
  })
  it('if busboy is called without stream options autoDestroy is set to false', () => {
    const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    expect(busboyInstance._writableState.autoDestroy).to.be.equal(false)
  })
  it('if busboy is called with invalid value for stream option highWaterMark we should throw', () => {
    expect(() => Busboy({ highWaterMark: 'not_allowed_value_for_highWaterMark', headers: { 'content-type': 'application/x-www-form-urlencoded' } })).to.throw('not_allowed_value_for_highWaterMark')
  })
  it('if busboy is called with stream options and autoDestroy:true, autoDestroy should be set to true', () => {
    const busboyInstance = Busboy({ autoDestroy: true, headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    expect(busboyInstance._writableState.autoDestroy).to.be.equal(true)
  })
  it('busboy should be initialized with private attribute _done set as false', () => {
    const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    expect(busboyInstance._done).to.be.equal(false)
  })
  it('busboy should be initialized with private attribute _finished set as false', () => {
    const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    expect(busboyInstance._finished).to.be.equal(false)
  })
})
