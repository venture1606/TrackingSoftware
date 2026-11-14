import React from "react";
import { Button, Tooltip } from "@chakra-ui/react";

const ActionButtonCompo = ({
  cell,
  label,
  onClick,
  colorScheme,
  isDisabled = false,
  disabledReason = "No permission for this process",
}) => {
  const button = (
    <Button
      size="xs"
      borderRadius="full"
      px={4}
      colorScheme={colorScheme || "blue"}
      onClick={isDisabled ? undefined : onClick}
      isDisabled={isDisabled}
      fontWeight="bold"
      fontSize="10px"
      textTransform="uppercase"
      shadow="sm"
      _hover={
        isDisabled
          ? undefined
          : { transform: "translateY(-1px)", shadow: "md" }
      }
      transition="all 0.2s"
      opacity={isDisabled ? 0.55 : 1}
      cursor={isDisabled ? "not-allowed" : "pointer"}
    >
      {label}
    </Button>
  );

  if (!isDisabled) return button;

  return (
    <Tooltip label={disabledReason} hasArrow>
      <span>{button}</span>
    </Tooltip>
  );
};

export default ActionButtonCompo;
