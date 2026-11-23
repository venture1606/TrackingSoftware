import React from "react";
import { Box, Flex, HStack, Text, Badge } from "@chakra-ui/react";
import { Icon } from "@iconify/react";

/**
 * Card for a category or sub-category on the Products page.
 * node: { name, subCategoryCount, totalProductCount }
 */
const CategoryCard = ({ node, kind = "category", onOpen }) => {
  const subs = node.subCategoryCount || 0;
  const products = node.totalProductCount || 0;

  return (
    <Box
      as="button"
      type="button"
      onClick={onOpen}
      textAlign="left"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={4}
      boxShadow="sm"
      transition="all 0.15s ease"
      _hover={{ borderColor: "blue.400", boxShadow: "md", transform: "translateY(-2px)" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "blue.400" }}
      w="100%"
    >
      <Flex align="center" gap={3}>
        <Flex
          boxSize="44px"
          borderRadius="lg"
          bg={kind === "category" ? "blue.50" : "teal.50"}
          color={kind === "category" ? "blue.600" : "teal.600"}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon
            icon={kind === "category" ? "mdi:folder-multiple-outline" : "mdi:folder-outline"}
            width="24"
          />
        </Flex>
        <Box flex="1" minW={0}>
          <Text fontWeight="semibold" color="gray.800" noOfLines={2}>
            {node.name}
          </Text>
          <HStack spacing={2} mt={1} flexWrap="wrap">
            <Badge colorScheme="teal" variant="subtle" fontSize="10px">
              {subs} sub-categor{subs === 1 ? "y" : "ies"}
            </Badge>
            <Badge colorScheme="blue" variant="subtle" fontSize="10px">
              {products} product{products === 1 ? "" : "s"}
            </Badge>
          </HStack>
        </Box>
        <Box color="gray.400" flexShrink={0}>
          <Icon icon="mdi:chevron-right" width="22" />
        </Box>
      </Flex>
    </Box>
  );
};

export default CategoryCard;
