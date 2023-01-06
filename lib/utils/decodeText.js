'use strict'

let TextDecoder
try {
  TextDecoder = require('util').TextDecoder
} catch (e) { }

const { TextDecoder: PolyfillTextDecoder, getEncoding } = require('text-decoding')

// Node has always utf-8
const textDecoders = new Map()
if (TextDecoder) {
  textDecoders.set('utf-8', new TextDecoder('utf-8'))
} else {
  textDecoders.set('utf-8', new PolyfillTextDecoder('utf-8'))
}
textDecoders.set('utf8', textDecoders.get('utf-8'))

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

function decodeTextPolyfill (text, textEncoding, destEncoding) {
  if (text) {
    if (textDecoders.has(destEncoding)) {
      try {
        return textDecoders.get(destEncoding).decode(Buffer.from(text, textEncoding))
      } catch (e) { }
    } else {
      if (getEncoding(destEncoding)) {
        try {
          textDecoders.set(destEncoding, new PolyfillTextDecoder(destEncoding))
          return textDecoders.get(destEncoding).decode(Buffer.from(text, textEncoding))
        } catch (e) { }
      }
    }
  }
  return text
}

module.exports = TextDecoder ? decodeText : decodeTextPolyfill
