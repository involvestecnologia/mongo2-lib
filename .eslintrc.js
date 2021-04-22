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
    'plugin:mocha/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
  }
}
