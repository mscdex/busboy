const { assert, expect } = require('chai')
const { Decoder } = require('../lib/utils')

describe('Decoder', () => {
  [
    {
      source: ['Hello world'],
      expected: 'Hello world',
      what: 'No encoded bytes'
    },
    {
      source: ['Hello%20world'],
      expected: 'Hello world',
      what: 'One full encoded byte'
    },
    {
      source: ['Hello%20world%21'],
      expected: 'Hello world!',
      what: 'Two full encoded bytes'
    },
    {
      source: ['Hello%', '20world'],
      expected: 'Hello world',
      what: 'One full encoded byte split #1'
    },
    {
      source: ['Hello%2', '0world'],
      expected: 'Hello world',
      what: 'One full encoded byte split #2'
    },
    {
      source: ['Hello%20', 'world'],
      expected: 'Hello world',
      what: 'One full encoded byte (concat)'
    },
    {
      source: ['Hello%2Qworld'],
      expected: 'Hello%2Qworld',
      what: 'Malformed encoded byte #1'
    },
    {
      source: ['Hello%world'],
      expected: 'Hello%world',
      what: 'Malformed encoded byte #2'
    },
    {
      source: ['Hello+world'],
      expected: 'Hello world',
      what: 'Plus to space'
    },
    {
      source: ['Hello+world%21'],
      expected: 'Hello world!',
      what: 'Plus and encoded byte'
    },
    {
      source: ['5%2B5%3D10'],
      expected: '5+5=10',
      what: 'Encoded plus'
    },
    {
      source: ['5+%2B+5+%3D+10'],
      expected: '5 + 5 = 10',
      what: 'Spaces and encoded plus'
    }
  ].forEach((v) => {
    it(v.what, () => {
      const dec = new Decoder()
      let result = ''
      v.source.forEach(function (s) {
        result += dec.write(s)
      })
      const msg = 'Decoded string mismatch.\n' +
                'Saw: ' + result + '\n' +
                'Expected: ' + v.expected
      assert.deepEqual(result, v.expected, msg)
    })
  })

  it('reset sets internal buffer to undefined', () => {
    const dec = new Decoder()
    dec.write('Hello+world%2')

    expect(dec.buffer).to.be.not.equal(undefined)
    dec.reset()
    expect(dec.buffer).to.be.equal(undefined)
  })
})
