module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // JS rules
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single'],
    
    // Vue rules
    'vue/html-indent': ['warn', 2],
    'vue/max-attributes-per-line': 'off',
    
    // Some rules loosened to make code look more natural/human
    'no-unused-vars': 'warn',
    'vue/require-default-prop': 'off'
  }
}; 