/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

/// <reference types="powerapps-component-framework" />

interface ObjectConstructor {
    getOwnPropertyNames<T>(o: T): (keyof T)[];
}
