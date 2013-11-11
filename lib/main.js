var fs = require('fs'),
    WritableStream = require('stream').Writable
                     || require('readable-stream').Writable,
    inherits = require('util').inherits;

var utils = require('./utils');

function Busboy(opts) {
  if (!(this instanceof Busboy))
    return new Busboy(opts);
  if (opts.highWaterMark !== undefined)
    WritableStream.call(this, { highWaterMark: opts.highWaterMark });
  else
    WritableStream.call(this);

  var self = this;
  this._parser = undefined;

  this.opts = opts;
  if (opts.headers && typeof opts.headers['content-type'] === 'string')
    this.parseHeaders(opts.headers);
  this.once('finish', function() {
    self._parser && self._parser.end();
  });
}
inherits(Busboy, WritableStream);

Busboy.prototype.parseHeaders = function(headers) {
  this._parser = undefined;
  if (headers['content-type']) {
    var parsed = utils.parseParams(headers['content-type']),
        matched, type;
    for (var i = 0; i < TYPES_LEN; ++i) {
      type = TYPES[i];
      if (typeof type.detect === 'function')
        matched = type.detect(parsed);
      else
        matched = type.detect.test(parsed[0]);
      if (matched)
        break;
    }
    if (matched) {
      var cfg = {
        limits: this.opts.limits,
        headers: headers,
        parsedConType: parsed
      };
      if (this.opts.highWaterMark)
        cfg.highWaterMark = this.opts.highWaterMark;
      if (this.opts.fileHwm)
        cfg.fileHwm = this.opts.fileHwm;
      cfg.defCharset = this.opts.defCharset;
      this._parser = new type(this, cfg);
      return;
    }
  }
  throw new Error('Unsupported content type: ' + headers['content-type']);
};

Busboy.prototype._write = function(chunk, encoding, cb) {
  this._parser.write(chunk, cb);
};

var TYPES = [], TYPES_LEN = 0;
fs.readdirSync(__dirname + '/types').forEach(function(type) {
  var typemod = require(__dirname + '/types/' + type);
  if (typemod.detect) {
    TYPES.push(typemod);
    ++TYPES_LEN;
  }
});

module.exports = Busboy;
