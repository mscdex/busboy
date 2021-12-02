const { validateEqual } = require('validation-utils')
const { randomContent } = require('./data')

const EXPECTED_RESULT = randomContent.toString()

async function validateAccuracy (actualResultPromise) {
  const result = await actualResultPromise
  validateEqual(result, EXPECTED_RESULT)
}

module.exports = {
  validateAccuracy
}
