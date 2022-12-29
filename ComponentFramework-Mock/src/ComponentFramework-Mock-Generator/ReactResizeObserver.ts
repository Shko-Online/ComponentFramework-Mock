/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { JSXElementConstructor, ReactElement } from 'react';
import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import { ComponentFrameworkMockGeneratorReact } from './ComponentFramework-Mock-Generator-React';
import { MultiSelectOptionSetPropertyMock, PropertyMock } from '../ComponentFramework-Mock';
import { arrayEqual } from '../utils';

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
        componentFrameworkMockGeneratorReact.notifyOutputChanged.callsFake(() => {
            const updates = componentFrameworkMockGeneratorReact.control.getOutputs?.();
            componentFrameworkMockGeneratorReact.context.updatedProperties = [];
            for (const k in updates) {
                if (k in componentFrameworkMockGeneratorReact.context.parameters) {
                    const property = componentFrameworkMockGeneratorReact.context.parameters[k] as PropertyMock;
                    if (Array.isArray(updates[k])) {
                        const arrayUpdate = updates[k] as number[];
                        const property = componentFrameworkMockGeneratorReact.context.parameters[
                            k
                        ] as MultiSelectOptionSetPropertyMock;
                        if (!arrayEqual(arrayUpdate, property.raw)) {
                            componentFrameworkMockGeneratorReact.context.updatedProperties.push(k);
                        }
                    } else if (typeof updates[k] === 'object') {
                    } else {
                        if ((componentFrameworkMockGeneratorReact.context.parameters[k] as any).raw !== updates[k]) {
                            componentFrameworkMockGeneratorReact.context.updatedProperties.push(k);
                        }
                    }
                    componentFrameworkMockGeneratorReact.metadata.UpdateValue(
                        updates[k],
                        property._boundTable,
                        property._boundColumn,
                        property._boundRow,
                    );
                }
            }
            if (componentFrameworkMockGeneratorReact.context.updatedProperties.length > 0) {
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
            }
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
