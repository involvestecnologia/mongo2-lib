module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  plugins: [
    'mocha'
  ],
  extends: [
    'standard',
    'mocha'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
  }
}
