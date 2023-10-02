const webpack = require('webpack');
const path = require('path');

const modules = process.env.BABEL_MODE === 'cjs' ? 'auto' : false;
  
// FIXME: optional chaining introduced in chrome 80, not supported by wepback4
// https://github.com/webpack/webpack/issues/10227#issuecomment-642734920
const targets = process.env.BABEL_MODE === 'modern' ? { chrome: '79' } : 'defaults';

const config = {
  refs: {
    'multi-switch': {
      title: "AlbanianXrm's MultiSwitch",
      url: "https://fluent-ui--643c1df35db0e46d50f8862d.chromatic.com",
      expanded: false // optional, true by default
    },
    'styled-switch': {
      title: "AlbanianXrm's StyledSwitch",
      url: "https://main--651a740f7ae468592174dad8.chromatic.com",
      expanded: false // optional, true by default
    },
    'gantt-view': {
      title: "Gantt View",
      url: "https://betimbeja.github.io/ProjectManagementTools",
      expanded: false // optional, true by default
    },
    'lookup-dropdown': {
      title: "Lookup Dropdown",
      url: "https://main--64039da1132d2ebe19bd43c5.chromatic.com",
      expanded: false // optional, true by default
    },
    'totp-qr-generator': {
      title: "TOTP QR Generator",
      url: "https://main--64039e4a62440831fd847544.chromatic.com",
      expanded: false // optional, true by default
    },
    'totp-verifier': {
      title: "TOTP Verifier",
      url: "https://main--6403b315f2b2d3b2c102b7c9.chromatic.com",
      expanded: false // optional, true by default
    }
  },

  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],

  framework: {
    name: "@storybook/html-webpack5",
    options: {}
  },

  webpackFinal: async config => {
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.fs = false;
    config.resolve.plugins = config.resolve.plugins || [];
    config.plugins.push(new webpack.SourceMapDevToolPlugin({
      append: '\n//# sourceMappingURL=[url]',
      fileContext: './',
      filename: '[file].map'
    }));
    for (var i = 0; i < config.module.rules.length; i++) {
      if ("a.ts".match(config.module.rules[i].test)) {

        // Ensure shared component of stories are transpiled.
        config.module.rules[i].include.push(
          path.resolve('../src')
        );
        config.module.rules[i].include.push(
          path.resolve('../__sample-components__')
        );
        config.module.rules[i].use[0].options.presets = [
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
        ];
        config.module.rules[i].use[0].options.plugins = [
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
        ];
        console.log(config.module.rules[i].use[0].options.overrides[0].plugins);
        break;
      }
    }

    return config;
  },
};
export default config;