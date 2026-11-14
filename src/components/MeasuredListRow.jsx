import React, { useLayoutEffect, useRef } from "react";

/**
 * Measures content height for react-window VariableSizeList rows.
 */
function MeasuredListRow({ index, style, setRowSize, extraPad = 2, children }) {
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;

    const measure = () => {
      const height = el.getBoundingClientRect().height;
      if (height > 0) setRowSize(index, height + extraPad);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <div style={style}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

export default MeasuredListRow;
