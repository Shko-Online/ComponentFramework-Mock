const webpack = require('webpack');
const config = {
  refs: {
    'multi-switch': {
      title: "AlbanianXrm's MultiSwitch",
      url: "https://albanian-xrm.github.io/PCF.MultiSwitch",
      expanded: false // optional, true by default
    },

    'gantt-view': {
      title: "Gantt View",
      url: "https://betimbeja.github.io/ProjectManagementTools",
      expanded: false // optional, true by default
    },

    'lookup-dropdown': {
      title: "Lookup Dropdown",
      url: "https://betimbeja.github.io/drivardxrm__LookupDropdown.PCF",
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
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-mdx-gfm"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  webpackFinal: async config => {
    config.resolve.plugins = config.resolve.plugins || [];
    config.plugins.push(new webpack.SourceMapDevToolPlugin({
      append: '\n//# sourceMappingURL=[url]',
      fileContext: './',
      filename: '[file].map'
    }));
    return config;
  }
};
export default config;