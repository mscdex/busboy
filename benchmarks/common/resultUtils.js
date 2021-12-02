const { exportResults } = require('photofinish')

function outputResults (benchmark, benchmarkResults) {
  console.log(
        `Mean time for ${
            benchmark.benchmarkEntryName
        } is ${benchmarkResults.meanTime.getTimeInNanoSeconds()} nanoseconds`
  )

  exportResults(benchmarkResults, { exportPath: '_results' })
}

module.exports = {
  outputResults
}
