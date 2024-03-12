import type { Preview, Parameters } from '@storybook/html';

export const parameters: Parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
    layout: 'fullscreen',
    backgrounds: {
        values: [{ name: 'white', value: '#fff' }],
    },
};

const preview: Preview = {
    parameters: {
        options: {
            storySort: {
                order: ['Shko Online\'s ComponentFramework-Mock', ['Introduction','*']],
            },
        },
    },
    argTypes: {
        isDisabled: {
            name: 'Disabled',
            control: 'boolean',
            table: {
                category: 'Mode',
                defaultValue: { summary: 'false' },
            },
        },
        isVisible: {
            name: 'Visible',
            control: 'boolean',
            table: {
                category: 'Mode',
                defaultValue: { summary: 'true' },
            },
        },
    },
    args: {
        isDisabled: false,
        isVisible: true,
    },
};

export default preview;
