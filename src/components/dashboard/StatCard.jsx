import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

const StatCard = ({ title, children, minH = "300px" }) => (
  <Box 
    bg="white" 
    borderRadius="xl" 
    boxShadow="sm" 
    border="1px solid" 
    borderColor="gray.100" 
    p={5}
    minH={minH}
    display="flex"
    flexDirection="column"
  >
    <Box borderBottom="2px solid" borderColor="blue.500" pb={2} mb={4}>
        <Heading size="xs" color="blue.700" textTransform="uppercase" letterSpacing="wider">
            {title}
        </Heading>
    </Box>
    <Box flex="1">
        {children}
    </Box>
  </Box>
);

export default StatCard;
