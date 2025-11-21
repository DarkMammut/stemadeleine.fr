module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};

