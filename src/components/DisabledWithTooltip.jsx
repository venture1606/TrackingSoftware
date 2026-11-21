import React from "react";
import { Tooltip } from "@chakra-ui/react";
import { ACCESS_DENIED_TOOLTIP } from "../services/permissions";

/**
 * Wraps a control so disabled state still shows a hover tooltip
 * (native disabled elements do not fire pointer events).
 */
const DisabledWithTooltip = ({
  isDisabled = false,
  label = ACCESS_DENIED_TOOLTIP,
  children,
  ...tooltipProps
}) => {
  if (!isDisabled) return children;

  return (
    <Tooltip label={label} hasArrow placement="top" {...tooltipProps}>
      <span style={{ display: "inline-flex", cursor: "not-allowed" }}>
        {children}
      </span>
    </Tooltip>
  );
};

export default DisabledWithTooltip;
