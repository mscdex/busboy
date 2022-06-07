const { expect } = require('chai')
const { Dicer } = require('../lib/main')

describe('dicer-export', () => {
  it('without new operator a new dicer instance will be initialized', () => {
    expect(Dicer({
      boundary: '----boundary'
    })).to.be.instanceOf(Dicer)
  })

  it('with new operator a new dicer instance will be initialized', () => {
    expect(new Dicer({
      boundary: '----boundary'
    })).to.be.instanceOf(Dicer)
  })
})
