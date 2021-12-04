const { expect } = require('chai')
const Dicer = require('../deps/dicer/lib/Dicer')

describe('dicer-constructor', () => {
  it('should throw an Error when no options parameter is supplied to Dicer', () => {
    expect(() => new Dicer()).to.throw('Boundary required')
  })

  it('without new operator a new dicer instance will be initialized', () => {
    expect(Dicer({
      boundary: '----boundary'
    })).to.be.instanceOf(Dicer)
  })
})
