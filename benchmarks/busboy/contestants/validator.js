const {validateEqual} = require("validation-utils");

const EXPECTED_RESULT = 'REPLACE_WITH_ACTUAL_CONTENT'

async function validateAccuracy(actualResultPromise) {
    const result = await actualResultPromise
    validateEqual(result, EXPECTED_RESULT);
}

module.exports = {
    validateAccuracy
}
