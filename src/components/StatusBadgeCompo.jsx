import React from "react";
import { Box, Flex } from "@chakra-ui/react";

const StatusBadgeCompo = ({ value, getStatusStyle }) => {
  const { badgeColor, textColor, dotColor } = getStatusStyle(value);

  return (
    <Flex justify="center">
      <Flex
        align="center"
        px={4}
        py={1.5}
        borderRadius="full"
        bg={badgeColor}
        border="1px solid"
        borderColor={badgeColor === "#fff" || badgeColor === "white" ? "gray.200" : badgeColor}
        color={textColor}
        fontSize="xs"
        fontWeight="bold"
        whiteSpace="nowrap"
        shadow="sm"
      >
        <Box
          w="6px"
          h="6px"
          borderRadius="50%"
          bg={dotColor}
          mr={2}
        />
        {value}
      </Flex>
    </Flex>
  );
};

export default StatusBadgeCompo;
