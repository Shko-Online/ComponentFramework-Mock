export { Fragment } from 'react';

import { createElement } from 'react';

export const jsxDEV = (tag, {children, ...props}) =>{
   return createElement(tag, props, children);
} ;
