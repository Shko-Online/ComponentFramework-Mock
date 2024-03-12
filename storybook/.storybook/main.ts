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
            url: 'https://fluent-ui--65ad6e3fa84fde3601f6d6c0.chromatic.com',
            expanded: false, // optional, true by default
        },
        'styled-switch': {
            title: "AlbanianXrm's StyledSwitch",
            url: 'https://main--651a740f7ae468592174dad8.chromatic.com',
            expanded: false, // optional, true by default
        },
        'totp-qr-generator': {
            title: 'TOTP QR Generator',
            url: 'https://main--64039e4a62440831fd847544.chromatic.com',
            expanded: false, // optional, true by default
        },
        'totp-verifier': {
            title: 'TOTP Verifier',
            url: 'https://main--6403b315f2b2d3b2c102b7c9.chromatic.com',
            expanded: false, // optional, true by default
        },
        'audio-player': {
            title: 'Audio Player',
            url: 'https://main--6559cb12bce5150811879c95.chromatic.com',
            expanded: false, // optional, true by default
        },
        'creator-kit': {
            title: 'PowerCAT Code Components',
            url: 'https://tests-componentframework-mock--65ad64221dfbbf94ab5a13c7.chromatic.com',
            expanded: false, // optional, true by default
        },
        'colorful-optionset': {
            title: 'Colorful Optionset',
            url: 'https://feat-storybook--65ad5a00f2c6d7287526f1b8.chromatic.com/',
            expanded: false, // optional, true by default
        },
        'gantt-view': {
            title: 'Gantt View',
            url: 'https://main--651b27cd606191e4fd79881f.chromatic.com',
            expanded: false, // optional, true by default
        },
        'lookup-dropdown': {
            title: 'Lookup Dropdown',
            url: 'https://main--65ad48f306645670d75e0731.chromatic.com',
            expanded: false, // optional, true by default
        },
        'country-picker': {
            title: 'Country Picker',
            url: 'https://feat-storybook--65b3b205d4d48903e0ca9dc4.chromatic.com',
            expanded: false, // optional, true by default
        },
        'fluentui-slider': {
            title: 'FluentUI Slider',
            url: 'https://feat-storybook--65b77198c12b58aaf4c05d69.chromatic.com',
            expanded: false, // optional, true by default
        },
        'fluentui-tag-list': {
            title: 'FluentUI TagList',
            url: 'https://feat-storybook--65ba4bd1c04dfc47f5543ee4.chromatic.com',
            expanded: false, // optional, true by default
        },
        'choices-stages': {
            title: 'Choices Stages',
            url: 'https://main--65ad40f30449340f55124229.chromatic.com/',
            expanded: false, // optional, true by default
        },
        'json-viewer': {
            title: 'JSON Viewer',
            url: 'https://feat-storybook--65ad57676f9ec654cd67dc65.chromatic.com/',
            expanded: false, // optional, true by default
        },
    },

    stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)', '../stories/**/*.mdx'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-webpack5-compiler-babel'
    ],
    framework: {
        name: '@storybook/html-webpack5',
        options: {},
    },
    staticDirs: ['./public'],
    webpackFinal: async (config) => {
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['react'] = path.resolve('./node_modules/react');
        config.resolve.alias['react-dom'] = path.resolve('./node_modules/react-dom');
        config.resolve.fallback = config.resolve.fallback || {};
        config.resolve.fallback['react/jsx-dev-runtime'] = path.resolve(
            './.storybook/react-jsx-dev-runtime.development.js',
        );
        config.resolve.fallback['react/jsx-runtime'] = path.resolve('./.storybook/react-jsx-runtime.production.min.js');

        config.plugins.push(
            new webpack.SourceMapDevToolPlugin({
                append: '\n//# sourceMappingURL=[url]',
                fileContext: './',
                filename: '[file].map',
            }),
        );
        for (var i = 0; i < config.module.rules.length; i++) {
            if (config.module.rules[i].test && 'a.ts'.match(config.module.rules[i].test)) {
                // Ensure shared component of stories are transpiled.
                config.module.rules[i].include = config.module.rules[i].include || [];
                config.module.rules[i].include.push(path.resolve('../src'));
                config.module.rules[i].include.push(path.resolve('../__sample-components__'));
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
                break;
            }
        }

        return config;
    },
};
export default config;
