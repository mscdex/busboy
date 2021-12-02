const { getCommonBuilder } = require('./commonBuilder')
const { outputResults } = require('./resultUtils')

function getMeasureFn (constestandId, fn) {
  return () => {
    const benchmark = getCommonBuilder()
      .benchmarkEntryName(constestandId)
      .functionUnderTest(fn).build()
    const benchmarkResults = benchmark.execute()
    outputResults(benchmark, benchmarkResults)
  }
}

module.exports = {
  getMeasureFn
}
