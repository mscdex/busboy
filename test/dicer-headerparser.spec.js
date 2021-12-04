const { assert } = require('chai')
const HeaderParser = require('../deps/dicer/lib/HeaderParser')

describe('dicer-headerparser', () => {
  const DCRLF = '\r\n\r\n'
  const MAXED_BUFFER = Buffer.allocUnsafe(128 * 1024)
  MAXED_BUFFER.fill(0x41); // 'A'

  [
    {
      source: DCRLF,
      expected: {},
      what: 'No header'
    },
    {
      source: ['Content-Type:\t  text/plain',
        'Content-Length:0'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': ['  text/plain'], 'content-length': ['0'] },
      what: 'Value spacing'
    },
    {
      source: ['Content-Type:\t  text/plain',
        'Content-Length:0'
      ].join('\r\n') + DCRLF,
      cfg: {
        maxHeaderPairs: 0
      },
      expected: { },
      what: 'should enforce maxHeaderPairs of 0'
    },
    {
      source: ['Content-Type:\t  text/plain',
        'Content-Length:0'
      ].join('\r\n') + DCRLF,
      cfg: {
        maxHeaderPairs: 1
      },
      expected: { 'content-type': ['  text/plain'] },
      what: 'should enforce maxHeaderPairs of 1'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: {},
      cfg: {
        maxHeaderSize: 0
      },
      what: 'should enforce maxHeaderSize of 0'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [' text/plai'] },
      cfg: {
        maxHeaderSize: 25
      },
      what: 'should enforce maxHeaderSize of 25'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [' text/plain'] },
      cfg: {
        maxHeaderSize: 31
      },
      what: 'should enforce maxHeaderSize of 31 and ignore the second header'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [' text/plain'], foo: [''] },
      cfg: {
        maxHeaderSize: 32
      },
      what: 'should enforce maxHeaderSize of 32 and only add key of second header'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [' text/plain'], foo: ['\r'] },
      cfg: {
        maxHeaderSize: 33
      },
      what: 'should enforce maxHeaderSize of 32 and get only first character of second pair'
    },
    {
      source: ['Content-Type:\t  text/plain',
        'Content-Length:0'
      ].join('\r\n') + DCRLF,
      cfg: {
        maxHeaderPairs: 2
      },
      expected: { 'content-type': ['  text/plain'], 'content-length': ['0'] },
      what: 'should enforce maxHeaderPairs of 2'
    },
    {
      source: ['Content-Type:\r\n text/plain',
        'Foo:\r\n bar\r\n baz'
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [' text/plain'], foo: [' bar baz'] },
      what: 'Folded values'
    },
    {
      source: [
        'Foo: bar',
        'Foo: baz'
      ].join('\r\n') + DCRLF,
      expected: { foo: ['bar', 'baz'] },
      what: 'Folded values'
    },
    {
      source: ['Content-Type:',
        'Foo: '
      ].join('\r\n') + DCRLF,
      expected: { 'content-type': [''], foo: [''] },
      what: 'Empty values'
    },
    {
      source: MAXED_BUFFER.toString('ascii') + DCRLF,
      expected: {},
      what: 'Max header size (single chunk)'
    },
    {
      source: ['ABCDEFGHIJ', MAXED_BUFFER.toString('ascii'), DCRLF],
      expected: {},
      what: 'Max header size (multiple chunks #1)'
    },
    {
      source: [MAXED_BUFFER.toString('ascii'), MAXED_BUFFER.toString('ascii'), DCRLF],
      expected: {},
      what: 'Max header size (multiple chunk #2)'
    }
  ].forEach(function (v) {
    it(v.what, (done) => {
      const cfg = {
        ...v.cfg
      }

      const parser = Object.keys(cfg).length ? new HeaderParser(cfg) : new HeaderParser()
      let fired = false

      parser.on('header', function (header) {
        assert(!fired, `${v.what}: Header event fired more than once`)
        fired = true
        assert.deepEqual(header,
          v.expected,
          `${v.what}: Parsed result mismatch`)
      })
      if (!Array.isArray(v.source)) { v.source = [v.source] }
      v.source.forEach(function (s) {
        parser.push(s)
      })
      assert(fired, `${v.what}: Did not receive header from parser`)
      done()
    })
  })
})
