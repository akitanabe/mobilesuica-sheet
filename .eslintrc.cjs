module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    semi: ['error', 'always'],
    'semi-spacing': ['error', { after: true, before: false }],
    'semi-style': ['error', 'last'],
    'no-extra-semi': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
  },
};
