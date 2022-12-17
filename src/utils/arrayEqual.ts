/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { itemEqual } from './itemEqual';

export const arrayEqual = <T>(source: T[]|null, target: T[]|null) => {
    return (
        Array.isArray(source) &&
        Array.isArray(target) &&
        source.length == target.length &&
        source.every((s) => target.some((t) => itemEqual<T>(s, t)))
    );
};

export default arrayEqual;
