var jsencoding = require('../deps/encoding/encoding');

var RE_ENCODED = /%([a-fA-F0-9]{2})/g;
function encodedReplacer(match, byte) {
  return String.fromCharCode(parseInt(byte, 16));
}
function parseParams(str) {
  var res = [],
      state = 'key',
      charset = '',
      inquote = false,
      escaping = false,
      p = 0,
      tmp = '';

  for (var i = 0, len = str.length; i < len; ++i) {
    if (str[i] === '\\' && inquote) {
      if (escaping)
        escaping = false;
      else {
        escaping = true;
        continue;
      }
    } else if (str[i] === '"') {
      if (!escaping) {
        if (inquote) {
          inquote = false;
          state = 'key';
        } else
          inquote = true;
        continue;
      } else
        escaping = false;
    } else {
      if (escaping && inquote)
        tmp += '\\';
      escaping = false;
      if ((state === 'charset' || state === 'lang') && str[i] === "'") {
        if (state === 'charset') {
          state = 'lang';
          charset = tmp.substring(1);
        } else
          state = 'value';
        tmp = '';
        continue;
      } else if (state === 'key'
                 && (str[i] === '*' || str[i] === '=')
                 && res.length) {
        if (str[i] === '*')
          state = 'charset';
        else
          state = 'value';
        res[p] = [tmp, undefined];
        tmp = '';
        continue;
      } else if (!inquote && str[i] === ';') {
        state = 'key';
        if (charset) {
          if (tmp.length) {
            tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
                             'binary',
                             charset);
          }
          charset = '';
        } else if (tmp.length) {
          tmp = decodeText(tmp, 'binary', 'utf8');
        }
        if (res[p] === undefined)
          res[p] = tmp;
        else
          res[p][1] = tmp;
        tmp = '';
        ++p;
        continue;
      } else if (!inquote && (str[i] === ' ' || str[i] === '\t'))
        continue;
    }
    tmp += str[i];
  }
  if (charset && tmp.length) {
    tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
                     'binary',
                     charset);
  } else if (tmp) {
    tmp = decodeText(tmp, 'binary', 'utf8');
  }

  if (res[p] === undefined) {
    if (tmp)
      res[p] = tmp;
  } else
    res[p][1] = tmp;

  return res;
};
exports.parseParams = parseParams;


function decodeText(text, textEncoding, destEncoding) {
  var ret;
  if (text && jsencoding.encodingExists(destEncoding)) {
    try {
      ret = jsencoding.TextDecoder(destEncoding)
                      .decode(Buffer.from(text, textEncoding));
    } catch(e) {}
  }
  return (typeof ret === 'string' ? ret : text);
}
exports.decodeText = decodeText;


var HEX = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
], RE_PLUS = /\+/g;
function Decoder() {
  this.buffer = undefined;
}
Decoder.prototype.write = function(str) {
  // Replace '+' with ' ' before decoding
  str = str.replace(RE_PLUS, ' ');
  var res = '';
  var i = 0, p = 0, len = str.length;
  for (; i < len; ++i) {
    if (this.buffer !== undefined) {
      if (!HEX[str.charCodeAt(i)]) {
        res += '%' + this.buffer;
        this.buffer = undefined;
        --i; // retry character
      } else {
        this.buffer += str[i];
        ++p;
        if (this.buffer.length === 2) {
          res += String.fromCharCode(parseInt(this.buffer, 16));
          this.buffer = undefined;
        }
      }
    } else if (str[i] === '%') {
      if (i > p) {
        res += str.substring(p, i);
        p = i;
      }
      this.buffer = '';
      ++p;
    }
  }
  if (p < len && this.buffer === undefined)
    res += str.substring(p);
  return res;
};
Decoder.prototype.reset = function() {
  this.buffer = undefined;
};
exports.Decoder = Decoder;


function basename(path) {
  if (typeof path !== 'string')
    return '';
  for (var i = path.length - 1; i >= 0; --i) {
    switch (path.charCodeAt(i)) {
      case 0x2F: // '/'
      case 0x5C: // '\'
        path = path.slice(i + 1);
        return (path === '..' || path === '.' ? '' : path);
    }
  }
  return (path === '..' || path === '.' ? '' : path);
}
exports.basename = basename;


function getLimit(limits, name, defaultLimit) {
  if (!limits)
    return defaultLimit;

  var limit = limits[name];
  // Intentional double equals
  if (limit == undefined)
    return defaultLimit;

  // Ensure limit is a number and is not NaN
  if (typeof limit !== 'number' || limit !== limit) {
    throw new Error('Limit ' + name + ' is not a valid number');
  }

  return limit;
}
exports.getLimit = getLimit;
