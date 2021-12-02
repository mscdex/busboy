const fs = require('fs')
const path = require('path')
const getopts = require('getopts')
const systemInformation = require('systeminformation')
const { loadResults } = require('photofinish')

const options = getopts(process.argv.slice(1), {
  alias: {
    resultsDir: 'r',
    precision: 'p'
  },
  default: {}
})

const { generateTable } = require('photofinish')

async function getSpecs () {
  const cpuInfo = await systemInformation.cpu()

  return {
    cpu: {
      brand: cpuInfo.brand,
      speed: `${cpuInfo.speed} GHz`
    }
  }
}

async function saveTable () {
  const baseResultsDir = options.resultsDir
  const benchmarkResults = await loadResults(baseResultsDir)

  const table = generateTable(benchmarkResults, {
    precision: options.precision,
    sortBy: [
      { field: 'meanTimeNs', order: 'asc' }
    ]
  })

  const specs = await getSpecs()

  console.log(specs)
  console.log(table)

  const targetFilePath = path.resolve(baseResultsDir, 'results.md')
  fs.writeFileSync(
    targetFilePath,
    `${table}` +
      `\n\n**Specs**: ${specs.cpu.brand} (${specs.cpu.speed})`
  )
}

saveTable()
