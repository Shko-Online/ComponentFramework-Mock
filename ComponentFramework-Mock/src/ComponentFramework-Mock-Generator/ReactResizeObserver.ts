/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { JSXElementConstructor, ReactElement } from 'react';
import type { ShkoOnline } from '../ShkoOnline';

import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import { ComponentFrameworkMockGeneratorReact } from './ComponentFramework-Mock-Generator-React';
import { MultiSelectOptionSetPropertyMock, PropertyMock } from '../ComponentFramework-Mock';
import { arrayEqual } from '../utils';
import { mockNotifyOutputChanged } from './mockNotifyOutputChanged';

export interface ReactResizeObserverProps<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> {
    componentFrameworkMockGeneratorReact: ComponentFrameworkMockGeneratorReact<TInputs, TOutputs>;
    circuitBreaker: {};
}

export const ReactResizeObserver = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>({
    componentFrameworkMockGeneratorReact,
    circuitBreaker,
}: ReactResizeObserverProps<TInputs, TOutputs>) => {
    const containerRef = useRef<HTMLElement>();
    const [Component, setComponent] = useState<ReactElement<any, string | JSXElementConstructor<any>>>(
        createElement(Fragment),
    );
    useEffect(() => {
        mockNotifyOutputChanged(
            componentFrameworkMockGeneratorReact,
            componentFrameworkMockGeneratorReact.control.getOutputs?.bind(componentFrameworkMockGeneratorReact.control),
            () => {
                Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(
                    componentFrameworkMockGeneratorReact.context.parameters,
                ).forEach((propertyName) => {
                    componentFrameworkMockGeneratorReact.context._parameters[propertyName]._Refresh();
                });
                setComponent(
                    componentFrameworkMockGeneratorReact.control.updateView(
                        componentFrameworkMockGeneratorReact.context,
                    ),
                );
            });
      
        componentFrameworkMockGeneratorReact.context.mode.trackContainerResize.callsFake((value) => {
            if (!containerRef.current) {
                console.error('Container Ref is null');
                return;
            }
            const observer = new ResizeObserver((entries) => {
                const size = entries[0];
                componentFrameworkMockGeneratorReact.context.mode.allocatedHeight = size.contentRect.height;
                componentFrameworkMockGeneratorReact.context.mode.allocatedWidth = size.contentRect.width;
                Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(
                    componentFrameworkMockGeneratorReact.context.parameters,
                ).forEach((propertyName) => {
                    componentFrameworkMockGeneratorReact.context._parameters[propertyName]._Refresh();
                });
                setComponent(
                    componentFrameworkMockGeneratorReact.control.updateView(
                        componentFrameworkMockGeneratorReact.context,
                    ),
                );
            });
            if (value) observer.observe(containerRef.current);
            else observer.unobserve(containerRef.current);
        });
    }, []);

    useEffect(() => {
        componentFrameworkMockGeneratorReact._RefreshParameters();
        setComponent(
            componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context),
        );
    }, [circuitBreaker]);

    return createElement(
        'div',
        {
            style: { width: '100%', height: '100%' },
            ref: containerRef,
        },
        Component,
    );
};
