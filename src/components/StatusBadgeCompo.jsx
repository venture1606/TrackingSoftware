import React from "react";
import { Box, Flex } from "@chakra-ui/react";

const StatusBadgeCompo = ({ value, getStatusStyle }) => {
  const { badgeColor, textColor, dotColor } = getStatusStyle(value);

  return (
    <Flex justify="center" w="100%" minW={0}>
      <Flex
        align="center"
        flexShrink={0}
        px={3}
        py={1}
        borderRadius="full"
        bg={badgeColor}
        border="1px solid"
        borderColor={
          badgeColor === "#fff" || badgeColor === "white"
            ? "gray.200"
            : badgeColor
        }
        color={textColor}
        fontSize="xs"
        fontWeight="bold"
        whiteSpace="nowrap"
        shadow="sm"
        maxW="100%"
      >
        <Box
          w="6px"
          h="6px"
          borderRadius="50%"
          bg={dotColor}
          mr={2}
          flexShrink={0}
        />
        <Box as="span" whiteSpace="nowrap">
          {value}
        </Box>
      </Flex>
    </Flex>
  );
};

export default StatusBadgeCompo;
