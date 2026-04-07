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
    <Box w="100%" p={4}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {products.map((prod) => (
          <Box 
            key={prod._id} 
            p={5} 
            shadow="md" 
            borderWidth="1px" 
            borderRadius="md" 
            bg="white"
            transition="0.2s"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          >
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="100%">
                <Heading size="md" color="blue.700" isTruncated>
                  {prod.name || prod.partName || '-'}
                </Heading>
                <Badge colorScheme="green">{prod.status || '-'}</Badge>
              </HStack>

              <Text fontSize="sm" color="gray.600">
                <strong>Part No:</strong> {prod.partNo || '-'}
              </Text>
              
              <Text fontSize="sm" color="gray.600">
                <strong>Category:</strong> {prod.category || '-'}
              </Text>
              
              <Text fontSize="xs" color="gray.400" mt={2}>
                Created: {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : '-'}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ProductDetails;
