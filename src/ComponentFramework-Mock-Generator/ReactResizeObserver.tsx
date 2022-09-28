import React, { useRef } from "react";

const ReactResizeObserver = (props: {
  updateView: () => React.ReactElement;
  trackContainer: boolean;
}) => {
  const containerRef = useRef();
  const Component = props.updateView();
  console.log('Update View');
  return <div style={{width: '100%', height: '100%'}} ref={containerRef}>{Component}</div>;
};

export default ReactResizeObserver;
