import React from 'react';
import { Skeleton, Stack, Box, SimpleGrid } from '@chakra-ui/react';

const ChartSkeleton = ({ type = "table" }) => {
  return (
    <Stack spacing={4} w="100%">
      {type === "chart" && (
        <Skeleton height="150px" borderRadius="md" />
      )}
      
      {type === "table" && (
        <Stack spacing={2}>
          <Skeleton height="20px" width="100%" />
          <Skeleton height="40px" width="100%" />
          <Skeleton height="40px" width="100%" />
          <Skeleton height="40px" width="100%" />
        </Stack>
      )}

      {type === "circles" && (
        <SimpleGrid columns={3} spacing={4}>
          <Skeleton height="80px" borderRadius="full" boxSize="80px" />
          <Skeleton height="80px" borderRadius="full" boxSize="80px" />
          <Skeleton height="80px" borderRadius="full" boxSize="80px" />
        </SimpleGrid>
      )}
    </Stack>
  );
};

export default ChartSkeleton;
