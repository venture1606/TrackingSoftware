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
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} 
        alignItems="center" 
        gap={4}
      >
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Flex alignItems="center" gap={3}>
            <Box 
              p={2} 
              bg="blue.500" 
              borderRadius="md" 
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
             <Icon as={CopyIcon} boxSize={5} />
            </Box>
            <Box minW={0}>
              <Heading as="h1" size="md" color="gray.800" noOfLines={1} fontSize={{ base: "lg", md: "xl" }}>
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

        <GridItem colSpan={{ base: 12, md: 8 }}>
          <Flex 
            alignItems="center" 
            gap={2} 
            justifyContent={{ base: "flex-start", md: "flex-end" }} 
            overflowX="auto"
            pb={{ base: 2, md: 0 }}
            css={{
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#E2E8F0',
                borderRadius: '10px',
              },
            }}
          >
             {children}
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default HeaderSection;
