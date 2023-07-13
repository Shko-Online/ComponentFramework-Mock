const modules = process.env.BABEL_MODE === 'cjs' ? 'auto' : false;
  
// FIXME: optional chaining introduced in chrome 80, not supported by wepback4
// https://github.com/webpack/webpack/issues/10227#issuecomment-642734920
const targets = process.env.BABEL_MODE === 'modern' ? { chrome: '79' } : 'defaults';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        useBuiltIns: 'usage',
        corejs: '3',
        targets,
        modules,
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-syntax-flow',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    'babel-plugin-macros',
    ['@emotion', { sourceMap: true, autoLabel: 'always' }],
  ],
}