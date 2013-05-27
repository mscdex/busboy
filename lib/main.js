var fs = require('fs'),
    WritableStream = require('readable-stream').Writable,
    inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

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

  if (opts.headers && opts.headers['content-type'] !== undefined)
    this.parseHeaders(opts.headers);
  this.limits = opts.limits;
  this.once('finish', function() {
    self._parser.end();
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
      this._parser = new type(this, this.limits, headers, parsed);
      return;
    }
  }
  throw new Error('Unsupported content type: ' + headers['content-type']);
};

Busboy.prototype._write = function(chunk, encoding, cb) {
  this._parser.write(chunk);
  cb();
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
