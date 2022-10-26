import React, { useEffect, useRef, useState } from 'react';
import { MultiSelectOptionSetPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock';
import arrayEqual from '@shko-online/componentframework-mock/utils/arrayEqual';
import { ComponentFrameworkMockGeneratorReact } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/ComponentFramework-Mock-Generator-React';
import { PropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';

const ReactResizeObserver = <TInputs extends ShkoOnline.PropertyTypes<TInputs>, TOutputs extends ShkoOnline.KnownTypes<TOutputs>>({
    componentFrameworkMockGeneratorReact,
    circuitBreaker
}: {
    componentFrameworkMockGeneratorReact: ComponentFrameworkMockGeneratorReact<TInputs, TOutputs>;
    circuitBreaker: {}
}) => {
    const containerRef = useRef();
    const [Component, setComponent] = useState(<></>);
    useEffect(() => {
        componentFrameworkMockGeneratorReact.notifyOutputChanged.callsFake(() => {
            console.log('output Changed');
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
                        // @ts-ignore
                        if (componentFrameworkMockGeneratorReact.context.parameters[k].raw !== updates[k]) {
                            componentFrameworkMockGeneratorReact.context.updatedProperties.push(k);
                        }
                    }
                    componentFrameworkMockGeneratorReact.metadata.UpdateValue(updates[k], property._boundTable, property._boundColumn, property._boundRow);
                }
            }
            if (componentFrameworkMockGeneratorReact.context.updatedProperties.length > 0) {
                setComponent(
                    componentFrameworkMockGeneratorReact.control.updateView(
                        componentFrameworkMockGeneratorReact.context,
                    ),
                );
            }
        });

        componentFrameworkMockGeneratorReact.context.mode.trackContainerResize.callsFake((value) => {
            const observer = new ResizeObserver((entries) => {
                const size = entries[0];
                componentFrameworkMockGeneratorReact.context.mode.allocatedHeight = size.contentRect.height;
                componentFrameworkMockGeneratorReact.context.mode.allocatedWidth = size.contentRect.width;
                console.log('width', size.contentRect.width);
                console.log('height', size.contentRect.height);
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
        setComponent(
            componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context)
        );
    },[circuitBreaker]);

    return (
        <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
            {Component}
        </div>
    );
};

export default ReactResizeObserver;
