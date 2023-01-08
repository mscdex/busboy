'use strict'

const parseParams = require('../lib/utils/parseParams')
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

const simple = 'video/ogg'
const complex = "'text/plain; filename*=utf-8''%c2%a3%20and%20%e2%82%ac%20rates'"

suite
  .add(simple, function () { parseParams(simple) })
  .add(complex, function () { parseParams(complex) })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .run();