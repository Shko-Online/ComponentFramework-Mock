import React, { useEffect, useRef, useState } from "react";
import { KnownTypes } from  "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/KnownTypes";
import { MultiSelectOptionSetPropertyMock } from  "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock";
import arrayEqual from  "@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/arrayEqual";
import { ComponentFrameworkMockGeneratorReact } from  "@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/ComponentFramework-Mock-Generator-React";


const ReactResizeObserver = <TInputs extends ShkoOnline.PropertyTypes<TInputs>,
  TOutputs extends KnownTypes<TOutputs>,>({componentFrameworkMockGeneratorReact}: {
    componentFrameworkMockGeneratorReact: ComponentFrameworkMockGeneratorReact<
      TInputs,
      TOutputs
    >
  }) => {
  const containerRef = useRef();
  const [Component, setComponent] = useState(<></>); 
  useEffect(()=>{
    componentFrameworkMockGeneratorReact.notifyOutputChanged.callsFake(()=>{
      console.log("output Changed")
      const updates = componentFrameworkMockGeneratorReact.control.getOutputs?.();
      componentFrameworkMockGeneratorReact.context.updatedProperties = [];
      for (let k in updates) {
        if (k in componentFrameworkMockGeneratorReact.context.parameters) {
          if (Array.isArray(updates[k])) {
            const arrayUpdate = updates[k] as number[];
            const property = componentFrameworkMockGeneratorReact.context.parameters[
              k
            ] as MultiSelectOptionSetPropertyMock;
            if (!arrayEqual(arrayUpdate, property.raw)) {
              componentFrameworkMockGeneratorReact.context.updatedProperties.push(k);
            }
          } else if (typeof updates[k] === "object") {
          } else {
            // @ts-ignore
            if (componentFrameworkMockGeneratorReact.context.parameters[k].raw != updates[k]) {
              componentFrameworkMockGeneratorReact.context.updatedProperties.push(k);
            }
          }

          // @ts-ignore
          componentFrameworkMockGeneratorReact.context.parameters[k].setValue(updates[k]);
        }
      }
      if (componentFrameworkMockGeneratorReact.context.updatedProperties.length > 0) {
        setComponent(componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context));
      }
    });

    componentFrameworkMockGeneratorReact.context.mode.trackContainerResize.callsFake((value) => {
      const observer = new ResizeObserver((entries) => {
        const size = entries[0];
        componentFrameworkMockGeneratorReact.context.mode.allocatedHeight = size.contentRect.height;
        componentFrameworkMockGeneratorReact.context.mode.allocatedWidth = size.contentRect.width;
        console.log("width", size.contentRect.width);
        console.log("height", size.contentRect.height);
        setComponent(componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context));
      });
      if (value) observer.observe(containerRef.current);
      else observer.unobserve(containerRef.current);
    });

    setComponent(componentFrameworkMockGeneratorReact.control.updateView(componentFrameworkMockGeneratorReact.context));
    
  },[]);

  return <div style={{ width: '100%', height: '100%' }} ref={containerRef}>{Component}</div>;
};

export default ReactResizeObserver;
