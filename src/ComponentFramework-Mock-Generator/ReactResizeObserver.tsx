import React, { useRef } from "react";

const ReactResizeObserver = (props: {
  updateView: () => React.ReactElement;
  trackContainer: boolean;
}) => {
  const containerRef = useRef();
  const Component = props.updateView();
  return <div ref={containerRef}>{Component}</div>;
};

export default ReactResizeObserver;
