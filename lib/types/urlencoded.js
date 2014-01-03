var jsencoding = require('../../deps/encoding/encoding'),
    Decoder = require('../utils').Decoder;

var RE_CHARSET = /^charset$/i;

UrlEncoded.detect = /^application\/x-www-form-urlencoded/i;
function UrlEncoded(boy, cfg) {
  var limits = cfg.limits,
      headers = cfg.headers,
      parsedConType = cfg.parsedConType;
  this.boy = boy;

  this.fieldSizeLimit = (limits && limits.fieldSize !== undefined
                         ? limits.fieldSize
                         : 1 * 1024 * 1024);
  this.fieldNameSizeLimit = (limits && limits.fieldNameSize !== undefined
                             ? limits.fieldNameSize
                             : 100);
  this.fieldsLimit = (limits && limits.fields !== undefined
                      ? limits.fields
                      : Infinity);

  var charset;
  for (var i = 0, len = parsedConType.length; i < len; ++i) {
    if (RE_CHARSET.test(parsedConType[i][0])) {
      charset = parsedConType[i][1].toLowerCase();
      break;
    }
  }

  if (charset === undefined)
    charset = cfg.defCharset || 'utf8';

  this.decoder = new Decoder();
  this.charset = charset;
  this._fields = 0;
  this._state = 'key';
  this._checkingBytes = true;
  this._bytesKey = 0;
  this._bytesVal = 0;
  this._key = '';
  this._val = undefined;
  this._keyTrunc = false;
  this._valTrunc = false;
  this._hitlimit = false;
}

UrlEncoded.prototype.write = function(data, cb) {
  if (this._fields === this.fieldsLimit) {
    if (!boy.hitFieldsLimit) {
      this.boy.hitFieldsLimit = true;
      this.boy.emit('fieldsLimit');
    }
    return cb();
  }

  var idxeq, idxamp, i, p = 0, len = data.length;

  while (p < len) {
    if (this._state === 'key') {
      idxeq = idxamp = undefined;
      for (i = p; i < len; ++i) {
        if (!this._checkingBytes)
          ++p;
        if (data[i] === 0x3D/*=*/) {
          idxeq = i;
          break;
        } else if (data[i] === 0x26/*&*/) {
          idxamp = i;
          break;
        }
        if (this._checkingBytes && this._bytesKey === this.fieldNameSizeLimit) {
          this._hitLimit = true;
          break;
        } else if (this._checkingBytes)
          ++this._bytesKey;
      }

      if (idxeq !== undefined) {
        // key with assignment
        if (idxeq > p)
          this._key += this.decoder.write(data.toString('binary', p, idxeq));
        this._state = 'val';

        this._hitLimit = false;
        this._checkingBytes = true;
        this._val = undefined;
        this._bytesVal = 0;
        this._valTrunc = false;
        this.decoder.reset();

        p = idxeq + 1;
      } else if (idxamp !== undefined) {
        // key with no assignment
        ++this._fields;
        var key, keyTrunc = this._keyTrunc;
        if (idxamp > p)
          key = (this._key += this.decoder.write(data.toString('binary', p, idxamp)));
        else
          key = this._key;

        this._hitLimit = false;
        this._checkingBytes = true;
        this._key = '';
        this._bytesKey = 0;
        this._keyTrunc = false;
        this.decoder.reset();

        if (key.length) {
          this.boy.emit('field', convertVal(key, this.charset),
                                 undefined,
                                 false,
                                 keyTrunc);
        }

        p = idxamp + 1;
        if (this._fields === this.fieldsLimit)
          return cb();
      } else if (this._hitLimit) {
        // we may not have hit the actual limit if there are encoded bytes...
        if (i > p)
          this._key += this.decoder.write(data.toString('binary', p, i));
        p = i;
        if ((this._bytesKey = this._key.length) === this.fieldNameSizeLimit) {
          // yep, we actually did hit the limit
          this._checkingBytes = false;
          this._keyTrunc = true;
        }
      } else {
        if (p < len)
          this._key += this.decoder.write(data.toString('binary', p));
        p = len;
      }
    } else {
      idxamp = undefined;
      for (i = p; i < len; ++i) {
        if (!this._checkingBytes)
          ++p;
        if (data[i] === 0x26/*&*/) {
          idxamp = i;
          break;
        }
        if (this._checkingBytes && this._bytesVal === this.fieldSizeLimit) {
          this._hitLimit = true;
          break;
        }
        else if (this._checkingBytes)
          ++this._bytesVal;
      }

      if (idxamp !== undefined) {
        ++this._fields;
        if (idxamp > p) {
          if (this._val === undefined)
            this._val = this.decoder.write(data.toString('binary', p, idxamp));
          else
            this._val += this.decoder.write(data.toString('binary', p, idxamp));
        }
        this.boy.emit('field', convertVal(this._key, this.charset),
                               convertVal(this._val, this.charset),
                               this._valTrunc,
                               this._keyTrunc);
        this._state = 'key';

        this._hitLimit = false;
        this._checkingBytes = true;
        this._key = '';
        this._bytesKey = 0;
        this._keyTrunc = false;
        this.decoder.reset();

        p = idxamp + 1;
        if (this._fields === this.fieldsLimit)
          return cb();
      } else if (this._hitLimit) {
        // we may not have hit the actual limit if there are encoded bytes...
        if (i > p) {
          if (this._val === undefined)
            this._val = this.decoder.write(data.toString('binary', p, i));
          else
            this._val += this.decoder.write(data.toString('binary', p, i));
        }
        p = i;
        if ((this._val === undefined && this.fieldSizeLimit === 0)
            || (this._bytesVal = this._val.length) === this.fieldSizeLimit) {
          // yep, we actually did hit the limit
          this._checkingBytes = false;
          this._valTrunc = true;
        }
      } else {
        if (p < len) {
          if (this._val === undefined)
            this._val = this.decoder.write(data.toString('binary', p));
          else
            this._val += this.decoder.write(data.toString('binary', p));
        }
        p = len;
      }
    }
  }
  cb();
};

UrlEncoded.prototype.end = function() {
  if (this._state === 'key' && this._key.length > 0) {
    this.boy.emit('field', convertVal(this._key, this.charset),
                           undefined,
                           false,
                           this._keyTrunc);
  } else if (this._state === 'val') {
    this.boy.emit('field', convertVal(this._key, this.charset),
                           convertVal(this._val, this.charset),
                           this._valTrunc,
                           this._keyTrunc);
  }
  this.boy.emit('end');
};

function convertVal(val, charset) {
  var ret = val;
  if (val && val.length && jsencoding.encodingExists(charset)) {
    try {
      ret = jsencoding.TextDecoder(charset)
                      .decode(new Buffer(val, 'binary'));
    } catch(e) {}
  }
  return ret;
}

module.exports = UrlEncoded;
