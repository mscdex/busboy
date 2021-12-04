const WritableStream = require('stream').Writable
const { inherits } = require('util')

const { parseParams } = require('./utils')

function Busboy (opts) {
  if (!(this instanceof Busboy)) { return new Busboy(opts) }
  if (opts.highWaterMark !== undefined) { WritableStream.call(this, { autoDestroy: false, highWaterMark: opts.highWaterMark }) } else { WritableStream.call(this, { autoDestroy: false }) }

  this._done = false
  this._parser = undefined
  this._finished = false

  this.opts = opts
  if (opts.headers && typeof opts.headers['content-type'] === 'string') { this.parseHeaders(opts.headers) } else { throw new Error('Missing Content-Type') }
}
inherits(Busboy, WritableStream)

Busboy.prototype.emit = function (ev) {
  if (ev === 'finish') {
    if (!this._done) {
      this._parser && this._parser.end()
      return
    } else if (this._finished) {
      return
    }
    this._finished = true
  }
  WritableStream.prototype.emit.apply(this, arguments)
}

Busboy.prototype.parseHeaders = function (headers) {
  this._parser = undefined
  if (headers['content-type']) {
    const parsed = parseParams(headers['content-type'])
    let matched; let type
    for (var i = 0; i < TYPES.length; ++i) { // eslint-disable-line no-var
      type = TYPES[i]
      if (typeof type.detect === 'function') { matched = type.detect(parsed) } else { matched = type.detect.test(parsed[0]) }
      if (matched) { break }
    }
    if (matched) {
      const cfg = {
        limits: this.opts.limits,
        isPartAFile: this.opts.isPartAFile,
        headers: headers,
        parsedConType: parsed,
        highWaterMark: undefined,
        fileHwm: undefined,
        defCharset: undefined,
        preservePath: false
      }
      if (this.opts.highWaterMark) { cfg.highWaterMark = this.opts.highWaterMark }
      if (this.opts.fileHwm) { cfg.fileHwm = this.opts.fileHwm }
      cfg.defCharset = this.opts.defCharset
      cfg.preservePath = this.opts.preservePath
      this._parser = type(this, cfg)
      return
    }
  }
  throw new Error('Unsupported content type: ' + headers['content-type'])
}

Busboy.prototype._write = function (chunk, encoding, cb) {
  if (!this._parser) { return cb(new Error('Not ready to parse. Missing Content-Type?')) }
  this._parser.write(chunk, cb)
}

const TYPES = [
  require('./types/multipart'),
  require('./types/urlencoded')
]

module.exports = Busboy
