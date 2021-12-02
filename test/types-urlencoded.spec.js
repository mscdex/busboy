const { inspect } = require('util')
const { assert } = require('chai')
const Busboy = require('..')

const EMPTY_FN = function () {
}

const tests = [
  {
    source: ['foo'],
    expected: [['foo', '', false, false]],
    what: 'Unassigned value'
  },
  {
    source: ['foo=bar'],
    expected: [['foo', 'bar', false, false]],
    what: 'Assigned value'
  },
  {
    source: ['foo&bar=baz'],
    expected: [['foo', '', false, false],
      ['bar', 'baz', false, false]],
    what: 'Unassigned and assigned value'
  },
  {
    source: ['foo=bar&baz'],
    expected: [['foo', 'bar', false, false],
      ['baz', '', false, false]],
    what: 'Assigned and unassigned value'
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
      ['baz', 'bla', false, false]],
    what: 'Two assigned values'
  },
  {
    source: ['foo&bar'],
    expected: [['foo', '', false, false],
      ['bar', '', false, false]],
    what: 'Two unassigned values'
  },
  {
    source: ['foo&bar&'],
    expected: [['foo', '', false, false],
      ['bar', '', false, false]],
    what: 'Two unassigned values and ampersand'
  },
  {
    source: ['foo=bar+baz%2Bquux'],
    expected: [['foo', 'bar baz+quux', false, false]],
    what: 'Assigned value with (plus) space'
  },
  {
    source: ['foo=bar%20baz%21'],
    expected: [['foo', 'bar baz!', false, false]],
    what: 'Assigned value with encoded bytes'
  },
  {
    source: ['foo%20bar=baz%20bla%21'],
    expected: [['foo bar', 'baz bla!', false, false]],
    what: 'Assigned value with encoded bytes #2'
  },
  {
    source: ['foo=bar%20baz%21&num=1000'],
    expected: [['foo', 'bar baz!', false, false],
      ['num', '1000', false, false]],
    what: 'Two assigned values, one with encoded bytes'
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [],
    what: 'Limits: zero fields',
    limits: { fields: 0 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false]],
    what: 'Limits: one field',
    limits: { fields: 1 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
      ['baz', 'bla', false, false]],
    what: 'Limits: field part lengths match limits',
    limits: { fieldNameSize: 3, fieldSize: 3 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', 'bar', true, false],
      ['ba', 'bla', true, false]],
    what: 'Limits: truncated field name',
    limits: { fieldNameSize: 2 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'ba', false, true],
      ['baz', 'bl', false, true]],
    what: 'Limits: truncated field value',
    limits: { fieldSize: 2 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', 'ba', true, true],
      ['ba', 'bl', true, true]],
    what: 'Limits: truncated field name and value',
    limits: { fieldNameSize: 2, fieldSize: 2 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', '', true, true],
      ['ba', '', true, true]],
    what: 'Limits: truncated field name and zero value limit',
    limits: { fieldNameSize: 2, fieldSize: 0 }
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['', '', true, true],
      ['', '', true, true]],
    what: 'Limits: truncated zero field name and zero value limit',
    limits: { fieldNameSize: 0, fieldSize: 0 }
  },
  {
    source: ['&'],
    expected: [],
    what: 'Ampersand'
  },
  {
    source: ['&&&&&'],
    expected: [],
    what: 'Many ampersands'
  },
  {
    source: ['='],
    expected: [['', '', false, false]],
    what: 'Assigned value, empty name and value'
  },
  {
    source: [''],
    expected: [],
    what: 'Nothing'
  }
]

describe('types urlencoded', () => {
  tests.forEach((v) => {
    it(v.what, (done) => {
      const busboy = new Busboy({
        limits: v.limits,
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      })
      let finishes = 0
      const results = []

      busboy.on('field', function (key, val, keyTrunc, valTrunc) {
        results.push([key, val, keyTrunc, valTrunc])
      })
      busboy.on('file', function () {
        throw new Error('Unexpected file')
      })
      busboy.on('finish', function () {
        assert(finishes++ === 0, 'finish emitted multiple times')
        assert.deepEqual(results.length,
          v.expected.length,
          'Parsed result count mismatch. Saw ' +
                    results.length +
                    '. Expected: ' + v.expected.length)

        let i = 0
        results.forEach(function (result) {
          assert.deepEqual(result,
            v.expected[i],
            'Result mismatch:\nParsed: ' + inspect(result) +
                        '\nExpected: ' + inspect(v.expected[i])
          )
          ++i
        })
        done()
      })

      v.source.forEach(function (s) {
        busboy.write(Buffer.from(s, 'utf8'), EMPTY_FN)
      })
      busboy.end()
    })
  })
})
