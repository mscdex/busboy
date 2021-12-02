const getopts = require('getopts')

const options = getopts(process.argv.slice(1), {
  alias: {
    contestant: 'c'
  },
  default: {}
})

function resolveContestant (contestants) {
  const contestantId = options.contestant
  const contestant = Number.isFinite(contestantId)
    ? Object.values(contestants)[contestantId]
    : contestants[contestantId]

  if (!contestant) {
    throw new Error(`Unknown contestant ${contestantId}`)
  }
  return contestant
}

module.exports = {
  resolveContestant
}
