const { validateNotNil } = require('validation-utils')
const { BenchmarkBuilder } = require('photofinish')
const getopts = require('getopts')

const options = getopts(process.argv.slice(1), {
  alias: {
    preset: 'p'
  },
  default: {}
})

const PRESET = {
  LOW: (builder) => {
    return builder
      .warmupCycles(1000)
      .benchmarkCycles(1000)
  },

  MEDIUM: (builder) => {
    return builder
      .warmupCycles(1000)
      .benchmarkCycles(2000)
  },

  HIGH: (builder) => {
    return builder
      .warmupCycles(1000)
      .benchmarkCycles(10000)
  }
}

function getCommonBuilder () {
  const presetId = options.preset || 'MEDIUM'
  const preset = validateNotNil(PRESET[presetId.toUpperCase()], `Unknown preset: ${presetId}`)

  const builder = new BenchmarkBuilder()
  preset(builder)
  return builder
    .benchmarkCycleSamples(50)
}

module.exports = {
  getCommonBuilder
}
