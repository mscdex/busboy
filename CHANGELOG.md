# Changelog

Major changes since the last busboy release (0.31):

# 1.0.0 - 04 December, 2021

* Prevent malformed headers from crashing the web server (#34)
* Prevent empty parts from hanging the process (#55)
* Use non-deprecated Buffer creation (#8, #10)
* Include TypeScript types in the package itself (#13)
* Make `busboy` importable both as ESM and as CJS module (#61)
* Improve performance (#21, #32, #36)
* Set `autoDestroy` to `false` by default in order to avoid regressions when upgrading from Node.js 12 to Node.js 14 (#9)
* Add option `isPartAFile`, to make the file-detection configurable (#53)
* Add property `bytesRead` on FileStreams (#51)
* Add and expose headerSize limit (#64)
* Throw an error on non-number limit (#7)
* Use the native TextDecoder and the package `text-decoding` for fallback if Node.js does not support the requested encoding (#50)
* Integrate `dicer` dependency into `busboy` itself (#14)
* Convert tests to Mocha (#11, #12, #22, #23)
* Implement better benchmarks (#40, #54)
* Use JavaScript Standard style (#44, #45)
