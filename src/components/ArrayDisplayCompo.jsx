import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";

const ArrayDisplayCompo = ({ values }) => {
  if (!Array.isArray(values) || values.length === 0) return <Text fontSize="sm" color="gray.400">-</Text>;

  return (
    <Flex wrap="wrap" gap={2} justify="center">
      {values.map((val, idx) => (
        <Box
          key={idx}
          border="1px solid"
          borderColor="gray.200"
          px={3}
          py={1}
          borderRadius="md"
          bg={idx === values.length - 1 ? "green.500" : "transparent"}
          color={idx === values.length - 1 ? "white" : "gray.700"}
          fontSize="xs"
          fontWeight="bold"
          shadow="sm"
        >
          {val}
        </Box>
      ))}
    </Flex>
  );
};

export default ArrayDisplayCompo;
