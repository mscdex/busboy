module.exports = {
  parserOptions: {
    ecmaVersion: 2018
  },
  ignorePatterns: [
    'bench',
    'deps/encoding'
  ],
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  rules: {
    'no-unused-vars': [1, { vars: 'all', args: 'none' }],
    'node/no-missing-require': 1,
    'no-constant-condition': 'off',
    'no-var': 'off',
    'no-redeclare': 1,
    'no-fallthrough': 1,
    'no-control-regex': 1,
    'no-empty': 'off',
    'prefer-const': 'off'
  },
  env: {
    node: true,
    mocha: true,
    es6: true
  }
}
