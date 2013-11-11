// TODO:
//  * support 1 nested multipart level
//    (see second multipart example here:
//     http://www.w3.org/TR/html401/interact/forms.html#didx-multipartform-data)
//  * support limits.fieldNameSize
//     -- this will require modifications to utils.parseParams

var ReadableStream = require('stream').Readable || require('readable-stream'),
    Dicer = require('dicer'),
    inherits = require('util').inherits,
    jsencoding = require('../../deps/encoding/encoding');

var utils = require('../utils');

var RE_BOUNDARY = /^boundary$/i,
    RE_FIELD = /^form-data$/i,
    RE_CHARSET = /^charset$/i,
    RE_FILENAME = /^filename$/i,
    RE_NAME = /^name$/i;

Multipart.detect = /^multipart\//i;
function Multipart(boy, cfg) {
  var boundary, i, len, self = this,
      limits = cfg.limits,
      headers = cfg.headers,
      parsedConType = cfg.parsedConType,
      defCharset = cfg.defCharset || 'utf8',
      fileopts = typeof cfg.fileHwm === 'number'
                 ? { highWaterMark: cfg.fileHwm }
                 : {};
  
  for (i = 0, len = parsedConType.length; i < len; ++i) {
    if (RE_BOUNDARY.test(parsedConType[i][0])) {
      boundary = parsedConType[i][1];
      break;
    }
  }

  function checkFinished() {
    if (nends === 0 && finished) {
      finished = false;
      process.nextTick(function() { boy.emit('end'); });
    }
  }

  if (!boundary)
    throw new Error('Multipart: Boundary not found');

  var fieldSizeLimit = (limits && limits.fieldSize) || (1 * 1024 * 1024),
      fileSizeLimit = (limits && limits.fileSize) || Infinity,
      filesLimit = (limits && limits.files) || Infinity,
      fieldsLimit = (limits && limits.fields) || Infinity,
      partsLimit = (limits && limits.parts) || Infinity;

  var nfiles = 0, nfields = 0, nparts = 0, nends = 0,
      finished = false;


  this._needDrain = false;
  this._pause = false;
  this._cb = undefined;

  var parserCfg = {
    boundary: boundary,
    maxHeaderPairs: (limits && limits.headerPairs)
  };
  if (fileopts.highWaterMark)
    parserCfg.partHwm = fileopts.highWaterMark;
  if (cfg.highWaterMark)
    parserCfg.highWaterMark = cfg.highWaterMark
  this.parser = new Dicer(parserCfg);
  this.parser.on('drain', function() {
    self._needDrain = false;
    if (self._cb && !self._pause) {
      var cb = self._cb;
      self._cb = undefined;
      cb();
    }
  });
  this.parser.on('part', function onPart(part) {
    if (++nparts > partsLimit) {
      self.parser.removeListener('part', onPart);
      self.parser.on('part', skipParts);
      return;
    }
    part.on('header', function(header) {
      var contype, fieldname, parsed, charset, encoding, filename, nsize = 0;

      if (header['content-type']) {
        parsed = utils.parseParams(header['content-type'][0]);
        contype = parsed[0].toLowerCase();
        for (i = 0, len = parsed.length; i < len; ++i) {
          if (RE_CHARSET.test(parsed[i][0])) {
            charset = parsed[i][1].toLowerCase();
            break;
          }
        }
      } else
        contype = 'text/plain';

      if (charset === undefined)
        charset = defCharset;

      if (header['content-disposition']) {
        parsed = utils.parseParams(header['content-disposition'][0]);
        if (!RE_FIELD.test(parsed[0]))
          return;
        for (i = 0, len = parsed.length; i < len; ++i) {
          if (RE_NAME.test(parsed[i][0]))
            fieldname = parsed[i][1];
          else if (RE_FILENAME.test(parsed[i][0]))
            filename = parsed[i][1];
        }
      } else
        return;

      if (header['content-transfer-encoding'])
        encoding = header['content-transfer-encoding'][0].toLowerCase();
      else
        encoding = '7bit';

      var onData, onEnd;
      if (contype === 'application/octet-stream' || filename !== undefined) {
        // file/binary field
        if (nfiles === filesLimit)
          return;

        ++nfiles;
        ++nends;
        var file = new FileStream(fileopts);
        file.on('end', function() {
          --nends;
          checkFinished();
        });
        file._read = function(n) {
          if (!self._pause)
            return;
          self._pause = false;
          if (self._cb && !self._needDrain) {
            var cb = self._cb;
            self._cb = undefined;
            cb();
          }
        };
        boy.emit('file', fieldname, file, filename, encoding, contype);

        onData = function(data) {
          if ((nsize += data.length) > fileSizeLimit) {
            file.push(data.slice(0, (fileSizeLimit - nsize)));
            file.emit('limit');
            part.removeAllListeners('data');
          } else if (!file.push(data))
            self._pause = true;
        };

        onEnd = function() {
          file.push(null);
        };
      } else {
        // non-file field
        if (nfields === fieldsLimit)
          return;

        ++nfields;
        ++nends;
        var buffer = '', truncated = false;

        onData = function(data) {
          if ((nsize += data.length) > fieldSizeLimit) {
            buffer += data.toString('binary', 0, (fieldSizeLimit - nsize));
            truncated = true;
            part.removeAllListeners('data');
          } else
            buffer += data.toString('binary');
        };

        onEnd = function() {
          if (buffer.length && jsencoding.encodingExists(charset)) {
            try {
              buffer = jsencoding.TextDecoder(charset)
                                 .decode(new Buffer(buffer, 'binary'));
            } catch(e) {}
          }
          boy.emit('field', fieldname, buffer, truncated, false);
          --nends;
          checkFinished();
        };
      }
      part.on('data', onData);
      part.on('end', onEnd);
    });
  });
  this.parser.on('end', function() {
    finished = true;
    checkFinished();
  });
}

Multipart.prototype.write = function(chunk, cb) {
  var r;
  if ((r = this.parser.write(chunk)) && !this._pause)
    cb();
  else {
    this._needDrain = !r;
    this._cb = cb;
  }
};

Multipart.prototype.end = function() {};

function skipParts(part) {
  part.resume();
}

function FileStream(opts) {
  if (!(this instanceof FileStream))
    return new FileStream(opts);
  ReadableStream.call(this, opts);
}
inherits(FileStream, ReadableStream);

FileStream.prototype._read = function(n) {};

module.exports = Multipart;
