import React from "react";
import { Box, Heading, Badge, Flex } from "@chakra-ui/react";

const StatCard = ({
  title,
  count,
  children,
  minH = "300px",
  headerRight,
  minWidth = "300px",
}) => (
  <Box
    bg="white"
    borderRadius="xl"
    boxShadow="sm"
    border="1px solid"
    borderColor="gray.100"
    p={5}
    minH={minH}
    minW={minWidth}
    flex="1 1 auto"
    display="flex"
    flexDirection="column"
  >
    <Box
      borderBottom="2px solid"
      borderColor="blue.500"
      pb={2}
      mb={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Flex align="center" gap={2}>
        <Heading
          size="xs"
          color="blue.700"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Heading>
        {count !== undefined && count !== null && (
          <Badge
            colorScheme="pink"
            variant="solid"
            borderRadius="full"
            px={2}
            fontSize="1rem"
          >
            {count}
          </Badge>
        )}
      </Flex>
      {headerRight && <Box>{headerRight}</Box>}
    </Box>
    <Box flex="1">{children}</Box>
  </Box>
);

export default StatCard;
