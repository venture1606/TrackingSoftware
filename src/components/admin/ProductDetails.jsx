import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Spinner, Flex, Text, SimpleGrid, Badge, VStack, HStack, Heading } from '@chakra-ui/react';

import Product from '../../services/Product';

const ProductDetails = () => {
  const { handleGetAllProducts, loading } = Product();
  // Ensure we select the correct shape from redux based on new architecture or old architecture
  const products = useSelector((state) => state.product?.products || []);

  useEffect(() => {
    if (!products || products.length === 0) {
      handleGetAllProducts();
    }
  }, []);

  if (loading && (!products || products.length === 0)) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!products || products.length === 0) {
    return <Text p={4}>No Products found.</Text>;
  }

  return (
    <Box w="100%" py={4}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
        {products.map((prod) => (
          <Box 
            key={prod._id} 
            p={6} 
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.1)',
              borderColor: 'blue.100'
            }}
          >
            <VStack align="start" spacing={4}>
              <Flex justify="space-between" w="100%" align="center">
                <Badge 
                  px={2} 
                  py={1} 
                  borderRadius="md" 
                  colorScheme="blue" 
                  variant="subtle" 
                  fontSize="10px"
                >
                  {prod.category || 'Product'}
                </Badge>
                <Badge 
                  colorScheme={prod.status === 'active' ? 'green' : 'gray'} 
                  variant="solid" 
                  fontSize="10px" 
                  borderRadius="full" 
                  px={3}
                >
                  {prod.status || 'Active'}
                </Badge>
              </Flex>

              <VStack align="start" spacing={1} w="100%">
                <Heading size="sm" color="gray.800" noOfLines={1}>
                  {prod.name || prod.partName || '-'}
                </Heading>
                <Text fontSize="12px" color="gray.500" fontWeight="600">
                  ID: {prod.partNo || '-'}
                </Text>
              </VStack>
              
              <Box pt={2} borderTop="1px solid" borderColor="gray.50" w="100%">
                <Text fontSize="11px" color="gray.400" fontWeight="500">
                  System Entry: {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                </Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ProductDetails;
