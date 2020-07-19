module.exports = {
  'settings': {
    'import/resolver': {
      'typescript': {
        'directory': [
          __dirname,
        ],
      },
    },
  },

  'overrides': [{
    files: [
      '*.ts',
      '*.tsx',
    ],
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
    },
    rules: {
      'no-undef': 'off',
      'no-console': 'off',
    },
  }],
}
