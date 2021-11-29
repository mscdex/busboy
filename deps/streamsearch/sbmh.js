/**
 * Copyright Brian White. All rights reserved.
 * 
 * @see https://github.com/mscdex/streamsearch
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 * 
 * Based heavily on the Streaming Boyer-Moore-Horspool C++ implementation
 * by Hongli Lai at: https://github.com/FooBarWidget/boyer-moore-horspool
 */
var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

function SBMH(needle) {
  if (typeof needle === 'string')
    needle = Buffer.from(needle);
  var i, j, needle_len = needle.length;

  this.maxMatches = Infinity;
  this.matches = 0;

  this._occ = new Array(256);
  this._lookbehind_size = 0;
  this._needle = needle;
  this._bufpos = 0;

  this._lookbehind = Buffer.alloc(needle_len);

  // Initialize occurrence table.
  for (j = 0; j < 256; ++j)
    this._occ[j] = needle_len;

  // Populate occurrence table with analysis of the needle,
  // ignoring last letter.
  if (needle_len >= 1) {
    for (i = 0; i < needle_len - 1; ++i)
      this._occ[needle[i]] = needle_len - 1 - i;
  }
}
inherits(SBMH, EventEmitter);

SBMH.prototype.reset = function() {
  this._lookbehind_size = 0;
  this.matches = 0;
  this._bufpos = 0;
};

SBMH.prototype.push = function(chunk, pos) {
  var r, chlen;
  if (!Buffer.isBuffer(chunk))
    chunk = Buffer.from(chunk, 'binary');
  chlen = chunk.length;
  this._bufpos = pos || 0;
  while (r !== chlen && this.matches < this.maxMatches)
    r = this._sbmh_feed(chunk);
  return r;
};

SBMH.prototype._sbmh_feed = function(data) {
  var len = data.length, needle = this._needle, needle_len = needle.length;

  // Positive: points to a position in `data`
  //           pos == 3 points to data[3]
  // Negative: points to a position in the lookbehind buffer
  //           pos == -2 points to lookbehind[lookbehind_size - 2]
  var pos = -this._lookbehind_size,
      last_needle_char = needle[needle_len - 1],
      occ = this._occ,
      lookbehind = this._lookbehind,
      ch;

  if (pos < 0) {
    // Lookbehind buffer is not empty. Perform Boyer-Moore-Horspool
    // search with character lookup code that considers both the
    // lookbehind buffer and the current round's haystack data.
    //
    // Loop until
    //   there is a match.
    // or until
    //   we've moved past the position that requires the
    //   lookbehind buffer. In this case we switch to the
    //   optimized loop.
    // or until
    //   the character to look at lies outside the haystack.
    while (pos < 0 && pos <= len - needle_len) {
      ch = this._sbmh_lookup_char(data, pos + needle_len - 1);

      if (
        ch === last_needle_char &&
        this._sbmh_memcmp(data, pos, needle_len - 1)
      ) {
        this._lookbehind_size = 0;
        ++this.matches;
        if (pos > 0)
          this.emit('info', true, lookbehind, 0, pos);
        else
          this.emit('info', true);

        return (this._bufpos = pos + needle_len);
      }
      pos += occ[ch];
    }

    // No match.

    if (pos < 0) {
      // There's too few data for Boyer-Moore-Horspool to run,
      // so let's use a different algorithm to skip as much as
      // we can.
      // Forward pos until
      //   the trailing part of lookbehind + data
      //   looks like the beginning of the needle
      // or until
      //   pos == 0
      while (pos < 0 && !this._sbmh_memcmp(data, pos, len - pos))
        ++pos;
    }

    if (pos >= 0) {
      // Discard lookbehind buffer.
      this.emit('info', false, lookbehind, 0, this._lookbehind_size);
      this._lookbehind_size = 0;
    } else {
      // Cut off part of the lookbehind buffer that has
      // been processed and append the entire haystack
      // into it.
      var bytesToCutOff = this._lookbehind_size + pos;

      if (bytesToCutOff > 0) {
        // The cut off data is guaranteed not to contain the needle.
        this.emit('info', false, lookbehind, 0, bytesToCutOff);
      }

      lookbehind.copy(lookbehind, 0, bytesToCutOff,
                      this._lookbehind_size - bytesToCutOff);
      this._lookbehind_size -= bytesToCutOff;

      data.copy(lookbehind, this._lookbehind_size);
      this._lookbehind_size += len;

      this._bufpos = len;
      return len;
    }
  }

  if (pos >= 0)
    pos += this._bufpos;

  // Lookbehind buffer is now empty. We only need to check if the 
  // needle is in the haystack. 
  if (data.indexOf(needle, pos) !== -1) {
    pos = data.indexOf(needle, pos);
    ++this.matches;
    if (pos > 0)
      this.emit('info', true, data, this._bufpos, pos);
    else
      this.emit('info', true);

    return (this._bufpos = pos + needle_len);
  } else {
    pos = len - needle_len;
  }

  // There was no match. If there's trailing haystack data that we cannot
  // match yet using the Boyer-Moore-Horspool algorithm (because the trailing
  // data is less than the needle size) then match using a modified
  // algorithm that starts matching from the beginning instead of the end.
  // Whatever trailing data is left after running this algorithm is added to
  // the lookbehind buffer.
  while (
    pos < len && 
    (
      data[pos] !== needle[0] || 
      (
        (Buffer.compare(
          data.subarray(pos, pos + len - pos),
          needle.subarray(0, len - pos)
        ) !== 0)
      )
    )
  ) {
    ++pos;
  }
  if (pos < len) {
    data.copy(lookbehind, 0, pos, pos + (len - pos));
    this._lookbehind_size = len - pos;
  }

  // Everything until pos is guaranteed not to contain needle data.
  if (pos > 0)
    this.emit('info', false, data, this._bufpos, pos < len ? pos : len);

  this._bufpos = len;
  return len;
};

SBMH.prototype._sbmh_lookup_char = function(data, pos) {
  return (pos < 0) 
    ? this._lookbehind[this._lookbehind_size + pos]
    : data[pos];
};

SBMH.prototype._sbmh_memcmp = function(data, pos, len) {
  for (var i = 0; i < len; ++i) {
    if (this._sbmh_lookup_char(data, pos + i) !== this._needle[i])
      return false;
  }
  return true;
};

module.exports = SBMH;
