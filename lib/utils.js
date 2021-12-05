const { TextDecoder } = require('util')
const { TextDecoder: PolyfillTextDecoder, getEncoding } = require('text-decoding')

const RE_ENCODED = /%([a-fA-F0-9]{2})/g
const RE_PLUS = /\+/g

const HEX = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]

// Node has always utf-8
const textDecoders = new Map()
textDecoders.set('utf-8', new TextDecoder('utf-8'))
textDecoders.set('utf8', textDecoders.get('utf-8'))

function encodedReplacer (match, byte) {
  return String.fromCharCode(parseInt(byte, 16))
}

function parseParams (str) {
  const res = []
  let state = 'key'
  let charset = ''
  let inquote = false
  let escaping = false
  let p = 0
  let tmp = ''

  for (var i = 0, len = str.length; i < len; ++i) { // eslint-disable-line no-var
    const char = str[i]
    if (char === '\\' && inquote) {
      if (escaping) { escaping = false } else {
        escaping = true
        continue
      }
    } else if (char === '"') {
      if (!escaping) {
        if (inquote) {
          inquote = false
          state = 'key'
        } else { inquote = true }
        continue
      } else { escaping = false }
    } else {
      if (escaping && inquote) { tmp += '\\' }
      escaping = false
      if ((state === 'charset' || state === 'lang') && char === "'") {
        if (state === 'charset') {
          state = 'lang'
          charset = tmp.substring(1)
        } else { state = 'value' }
        tmp = ''
        continue
      } else if (state === 'key' &&
        (char === '*' || char === '=') &&
        res.length) {
        if (char === '*') { state = 'charset' } else { state = 'value' }
        res[p] = [tmp, undefined]
        tmp = ''
        continue
      } else if (!inquote && char === ';') {
        state = 'key'
        if (charset) {
          if (tmp.length) {
            tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
              'binary',
              charset)
          }
          charset = ''
        } else if (tmp.length) {
          tmp = decodeText(tmp, 'binary', 'utf8')
        }
        if (res[p] === undefined) { res[p] = tmp } else { res[p][1] = tmp }
        tmp = ''
        ++p
        continue
      } else if (!inquote && (char === ' ' || char === '\t')) { continue }
    }
    tmp += char
  }
  if (charset && tmp.length) {
    tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
      'binary',
      charset)
  } else if (tmp) {
    tmp = decodeText(tmp, 'binary', 'utf8')
  }

  if (res[p] === undefined) {
    if (tmp) { res[p] = tmp }
  } else { res[p][1] = tmp }

  return res
}

function decodeText (text, textEncoding, destEncoding) {
  if (text) {
    if (textDecoders.has(destEncoding)) {
      try {
        return textDecoders.get(destEncoding).decode(Buffer.from(text, textEncoding))
      } catch (e) { }
    } else {
      try {
        textDecoders.set(destEncoding, new TextDecoder(destEncoding))
        return textDecoders.get(destEncoding).decode(Buffer.from(text, textEncoding))
      } catch (e) {
        if (getEncoding(destEncoding)) {
          try {
            textDecoders.set(destEncoding, new PolyfillTextDecoder(destEncoding))
            return textDecoders.get(destEncoding).decode(Buffer.from(text, textEncoding))
          } catch (e) { }
        }
      }
    }
  }
  return text
}

function Decoder () {
  this.buffer = undefined
}
Decoder.prototype.write = function (str) {
  // Replace '+' with ' ' before decoding
  str = str.replace(RE_PLUS, ' ')
  let res = ''
  let i = 0; let p = 0; const len = str.length
  for (; i < len; ++i) {
    if (this.buffer !== undefined) {
      if (!HEX[str.charCodeAt(i)]) {
        res += '%' + this.buffer
        this.buffer = undefined
        --i // retry character
      } else {
        this.buffer += str[i]
        ++p
        if (this.buffer.length === 2) {
          res += String.fromCharCode(parseInt(this.buffer, 16))
          this.buffer = undefined
        }
      }
    } else if (str[i] === '%') {
      if (i > p) {
        res += str.substring(p, i)
        p = i
      }
      this.buffer = ''
      ++p
    }
  }
  if (p < len && this.buffer === undefined) { res += str.substring(p) }
  return res
}
Decoder.prototype.reset = function () {
  this.buffer = undefined
}

function basename (path) {
  if (typeof path !== 'string') { return '' }
  for (var i = path.length - 1; i >= 0; --i) { // eslint-disable-line no-var
    switch (path.charCodeAt(i)) {
      case 0x2F: // '/'
      case 0x5C: // '\'
        path = path.slice(i + 1)
        return (path === '..' || path === '.' ? '' : path)
    }
  }
  return (path === '..' || path === '.' ? '' : path)
}

function getLimit (limits, name, defaultLimit) {
  if (
    !limits ||
    limits[name] === undefined ||
    limits[name] === null
  ) { return defaultLimit }

  if (
    typeof limits[name] !== 'number' ||
    isNaN(limits[name])
  ) { throw new TypeError('Limit ' + name + ' is not a valid number') }

  return limits[name]
}

module.exports = {
  Decoder,
  basename,
  getLimit,
  parseParams,
  decodeText
}
