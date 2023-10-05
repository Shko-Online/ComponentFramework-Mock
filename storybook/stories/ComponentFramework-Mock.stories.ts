import { StoryObj } from '@storybook/html';
import storyHtml from './ComponentFramework-Mock.stories.html';

import './ComponentFramework-Mock.stories.css';


export default {
    title: "Shko Online's ComponentFramework-Mock/Introduction",   
};

export const Introduction = {
    render: () => storyHtml,
    parameters: {
        controls: false
    }
} as StoryObj;
