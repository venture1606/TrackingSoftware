import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  Icon,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons'; 

const HeaderSection = ({ title, description, children }) => {
  return (
    <Box 
      bg="white" 
      p={4} 
      borderRadius="lg" 
      boxShadow="sm" 
      border="1px solid" 
      borderColor="gray.100"
      mb={4}
    >
      <Grid templateColumns="repeat(12, 1fr)" alignItems="center" gap={2}>
        <GridItem colSpan={4}>
          <Flex alignItems="center" gap={3}>
            <Box 
              p={2} 
              bg="blue.500" 
              borderRadius="md" 
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
             <Icon as={CopyIcon} boxSize={5} />
            </Box>
            <Box>
              <Heading as="h1" size="md" color="gray.800" noOfLines={1}>
                {title}
              </Heading>
              {description && (
                <Text color="gray.500" fontSize="xs" mt={0.5} noOfLines={1}>
                  {description}
                </Text>
              )}
            </Box>
          </Flex>
        </GridItem>

        <GridItem colSpan={8}>
          <Flex alignItems="center" gap={2} justifyContent="flex-end" overflowX="auto">
             {children}
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default HeaderSection;
