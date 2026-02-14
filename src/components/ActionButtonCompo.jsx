import React from "react";
import { Button } from "@chakra-ui/react";

const ActionButtonCompo = ({ cell, label, onClick, colorScheme }) => {
  return (
    <Button
      size="xs"
      borderRadius="full"
      px={4}
      colorScheme={colorScheme || "blue"}
      onClick={onClick}
      fontWeight="bold"
      fontSize="10px"
      textTransform="uppercase"
      shadow="sm"
      _hover={{ transform: "translateY(-1px)", shadow: "md" }}
      transition="all 0.2s"
    >
      {label}
    </Button>
  );
};

export default ActionButtonCompo;
