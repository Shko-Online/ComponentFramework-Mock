/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { JSXElementConstructor, ReactElement } from 'react';
import type { ShkoOnline } from '../ShkoOnline';

import { createElement, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ComponentFrameworkMockGeneratorReact } from './ComponentFramework-Mock-Generator-React';
import { mockNotifyOutputChanged } from './mockNotifyOutputChanged';
import { mockRefreshDatasets } from './mockRefreshDatasets';
import { DataSetMock } from '../ComponentFramework-Mock/PropertyTypes';

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
    const updateView = useCallback(() => {
        setComponent(
            componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context),
        );
    }, [setComponent, componentFrameworkMockGeneratorReact]);
    useEffect(() => {
        Object.getOwnPropertyNames(componentFrameworkMockGeneratorReact.context._parameters).forEach((p) => {
            var parameter = componentFrameworkMockGeneratorReact.context._parameters[p];
            if (parameter instanceof DataSetMock) {
                parameter._updateView = updateView;
            }
        });

        mockNotifyOutputChanged(
            componentFrameworkMockGeneratorReact,
            componentFrameworkMockGeneratorReact.control.getOutputs?.bind(componentFrameworkMockGeneratorReact.control),
            () => {
                componentFrameworkMockGeneratorReact.RefreshParameters();
                updateView();
                componentFrameworkMockGeneratorReact.RefreshDatasets();
            },
        );

        componentFrameworkMockGeneratorReact.resizeObserver = new ResizeObserver((entries) => {
            const size = entries[0];
            componentFrameworkMockGeneratorReact.context.mode.allocatedHeight = size.contentRect.height;
            componentFrameworkMockGeneratorReact.context.mode.allocatedWidth = size.contentRect.width;
            componentFrameworkMockGeneratorReact.RefreshParameters();
            updateView();
        });

        mockRefreshDatasets(componentFrameworkMockGeneratorReact, updateView);

        componentFrameworkMockGeneratorReact.context.mode.trackContainerResize.callsFake((value) => {
            if (!containerRef.current) {
                console.error('Container Ref is null');
                return;
            }

            if (value) componentFrameworkMockGeneratorReact.resizeObserver.observe(containerRef.current);
            else componentFrameworkMockGeneratorReact.resizeObserver.unobserve(containerRef.current);
        });

        if (componentFrameworkMockGeneratorReact.context.mode._TrackingContainerResize && containerRef.current) {
            componentFrameworkMockGeneratorReact.resizeObserver.observe(containerRef.current);
        }
    }, []);

    useEffect(() => {
        componentFrameworkMockGeneratorReact.RefreshParameters();
        updateView();
        componentFrameworkMockGeneratorReact.RefreshDatasets();
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
