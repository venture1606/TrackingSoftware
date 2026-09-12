import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons'; 

const HeaderSection = ({ title, description, children }) => {
  return (
    <Box 
      bg="white" 
      px={{ base: 3, md: 4 }} 
      py={{ base: 2.5, md: 3 }} 
      borderRadius="lg" 
      boxShadow="sm" 
      border="1px solid" 
      borderColor="gray.100"
      mb={3}
    >
      <Flex 
        direction={{ base: "column", md: "row" }} 
        alignItems={{ base: "flex-start", md: "center" }} 
        justifyContent="space-between"
        gap={{ base: 3, md: 4 }}
      >
        {/* Left Side: Title & Description with compact width */}
        <Box 
          flexShrink={0} 
          maxW={{ base: "100%", md: "230px", lg: "260px" }}
          minW={0}
        >
          <Flex alignItems="center" gap={2.5}>
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
              <Icon as={CopyIcon} boxSize={4} />
            </Box>
            <Box minW={0}>
              <Heading 
                as="h1" 
                size="md" 
                color="gray.800" 
                noOfLines={1} 
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
              >
                {title}
              </Heading>
              {description && (
                <Text color="gray.500" fontSize="xs" mt={0.5} noOfLines={1}>
                  {description}
                </Text>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Right Side: Action controls toolbar */}
        <Flex 
          alignItems="center" 
          gap={2} 
          justifyContent={{ base: "flex-start", md: "flex-end" }} 
          flex="1"
          minW={0}
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
      </Flex>
    </Box>
  );
};

export default HeaderSection;
