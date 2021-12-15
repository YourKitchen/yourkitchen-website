module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier', 'standard'],
  plugins: ['prettier'],
  ignorePatterns: ['*.js', 'dist', 'node_modules', 'build'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    'no-async-promise-executor': 'off',
    'no-unsafe-finally': 'off',
    'no-extra-semi': 'off',
    'prettier/prettier': ['error'],
    'no-console': 'off',
    'comma-dangle': 'off',
    'multiline-ternary': 'off',
    'no-use-before-define': 'off',
    indent: 'off',
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'function',
            format: ['PascalCase', 'camelCase'],
          },
          {
            selector: 'interface',
            format: ['PascalCase', 'camelCase', 'snake_case'],
          },
        ],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react-native/no-inline-styles': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'no-async-promise-executor': 'off',
        'no-unsafe-finally': 'off',
        'no-undef': 'off',
      },
    },
  ],
}
