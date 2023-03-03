
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
  },
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  webpackFinal: async config => {
    config.resolve.plugins = config.resolve.plugins || [];
    config.plugins.push(new webpack.SourceMapDevToolPlugin({
      append: '\n//# sourceMappingURL=[url]',
      fileContext: './',
      filename: '[file].map',
    }));
    return config;
  },
  features: {
    storyStoreV7: true,
  }
};

export default config;