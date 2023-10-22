import { Addon, AddonStore, addons, types } from '@storybook/addons';

type Addon_Config<T extends AddonStore['setConfig']> = T extends (value: infer K) => void ? K : never;
type ThemeVars = Addon_Config<AddonStore['setConfig']>['theme'];

addons.setConfig({
    theme: {
        brandTitle: "Shko Online's Component Framework Mock",
        brandUrl: 'https://github.com/shko-online/ComponentFramework-Mock',
        brandImage: './Shko Online 92x32.svg',
    } as ThemeVars,
    showRoots: false,
});
