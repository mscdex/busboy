const Dicer = require('../deps/dicer/lib/Dicer')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const inspect = require('util').inspect

const FIXTURES_ROOT = path.join(__dirname, 'fixtures/')

describe('dicer-multipart-nolisteners', () => {
  [
    {
      source: 'many',
      opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
      chsize: 16,
      nparts: 0,
      what: 'No preamble or part listeners'
    }
  ].forEach(function (v) {
    it(v.what, (done) => {
      const fixtureBase = path.resolve(FIXTURES_ROOT, v.source)
      let n = 0
      const buffer = Buffer.allocUnsafe(v.chsize)
      const state = { done: false, parts: [], preamble: undefined }

      const fd = fs.openSync(fixtureBase + '/original', 'r')

      const dicer = new Dicer(v.opts)
      let error
      let partErrors = 0
      let finishes = 0

      if (v.events && v.events.indexOf('preamble') > -1) {
        dicer.on('preamble', function (p) {
          const preamble = {
            body: undefined,
            bodylen: 0,
            error: undefined,
            header: undefined
          }

          p.on('header', function (h) {
            preamble.header = h
          }).on('data', function (data) {
          // make a copy because we are using readSync which re-uses a buffer ...
            const copy = Buffer.allocUnsafe(data.length)
            data.copy(copy)
            data = copy
            if (!preamble.body) { preamble.body = [data] } else { preamble.body.push(data) }
            preamble.bodylen += data.length
          }).on('error', function (err) {
            preamble.error = err
          }).on('end', function () {
            if (preamble.body) { preamble.body = Buffer.concat(preamble.body, preamble.bodylen) }
            if (preamble.body || preamble.header) { state.preamble = preamble }
          })
        })
      }
      if (v.events && v.events.indexOf('part') > -1) {
        dicer.on('part', function (p) {
          const part = {
            body: undefined,
            bodylen: 0,
            error: undefined,
            header: undefined
          }

          p.on('header', function (h) {
            part.header = h
          }).on('data', function (data) {
          // make a copy because we are using readSync which re-uses a buffer ...
            const copy = Buffer.allocUnsafe(data.length)
            data.copy(copy)
            data = copy
            if (!part.body) { part.body = [data] } else { part.body.push(data) }
            part.bodylen += data.length
          }).on('error', function (err) {
            part.error = err
            ++partErrors
          }).on('end', function () {
            if (part.body) { part.body = Buffer.concat(part.body, part.bodylen) }
            state.parts.push(part)
          })
        })
      }
      dicer.on('error', function (err) {
        error = err
      }).on('finish', function () {
        assert(finishes++ === 0, makeMsg(v.what, 'finish emitted multiple times'))

        if (v.dicerError) { assert(error !== undefined, makeMsg(v.what, 'Expected error')) } else { assert(error === undefined, makeMsg(v.what, `Unexpected error: ${error}`)) }

        if (v.events && v.events.indexOf('preamble') > -1) {
          let preamble
          if (fs.existsSync(fixtureBase + '/preamble')) {
            const prebody = fs.readFileSync(fixtureBase + '/preamble')
            if (prebody.length) {
              preamble = {
                body: prebody,
                bodylen: prebody.length,
                error: undefined,
                header: undefined
              }
            }
          }
          if (fs.existsSync(fixtureBase + '/preamble.header')) {
            const prehead = JSON.parse(fs.readFileSync(fixtureBase +
            '/preamble.header', 'binary'))
            if (!preamble) {
              preamble = {
                body: undefined,
                bodylen: 0,
                error: undefined,
                header: prehead
              }
            } else { preamble.header = prehead }
          }
          if (fs.existsSync(fixtureBase + '/preamble.error')) {
            const err = new Error(fs.readFileSync(fixtureBase +
            '/preamble.error', 'binary'))
            if (!preamble) {
              preamble = {
                body: undefined,
                bodylen: 0,
                error: err,
                header: undefined
              }
            } else { preamble.error = err }
          }

          assert.deepEqual(state.preamble,
            preamble,
            makeMsg(v.what,
              'Preamble mismatch:\nActual:' +
            inspect(state.preamble) +
            '\nExpected: ' +
            inspect(preamble)))
        }

        if (v.events && v.events.indexOf('part') > -1) {
          assert.equal(state.parts.length,
            v.nparts,
            makeMsg(v.what,
              'Part count mismatch:\nActual: ' +
            state.parts.length +
            '\nExpected: ' +
            v.nparts))

          if (!v.npartErrors) { v.npartErrors = 0 }
          assert.equal(partErrors,
            v.npartErrors,
            makeMsg(v.what,
              'Part errors mismatch:\nActual: ' +
            partErrors +
            '\nExpected: ' +
            v.npartErrors))

          for (let i = 0, header, body; i < v.nparts; ++i) {
            if (fs.existsSync(fixtureBase + '/part' + (i + 1))) {
              body = fs.readFileSync(fixtureBase + '/part' + (i + 1))
              if (body.length === 0) { body = undefined }
            } else { body = undefined }
            assert.deepEqual(state.parts[i].body,
              body,
              makeMsg(v.what,
                'Part #' + (i + 1) + ' body mismatch'))
            if (fs.existsSync(fixtureBase + '/part' + (i + 1) + '.header')) {
              header = fs.readFileSync(fixtureBase +
              '/part' + (i + 1) + '.header', 'binary')
              header = JSON.parse(header)
            } else { header = undefined }
            assert.deepEqual(state.parts[i].header,
              header,
              makeMsg(v.what,
                'Part #' + (i + 1) +
              ' parsed header mismatch:\nActual: ' +
              inspect(state.parts[i].header) +
              '\nExpected: ' +
              inspect(header)))
          }
        }
        done()
      })

      while (true) {
        n = fs.readSync(fd, buffer, 0, buffer.length, null)
        if (n === 0) {
          dicer.end()
          break
        }
        dicer.write(n === buffer.length ? buffer : buffer.slice(0, n))
      }
      fs.closeSync(fd)
    })
  })
})

function makeMsg (what, msg) {
  return what + ': ' + msg
}
