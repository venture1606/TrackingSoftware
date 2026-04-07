import React from 'react';
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';

const CircleMetric = ({ value, label, size = "80px", color = "blue.500" }) => (
  <VStack spacing={2}>
    <Box position="relative" display="inline-flex">
      <Box boxSize={size} borderRadius="full" border="8px solid" borderColor="gray.100" />
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        boxSize={size} 
        borderRadius="full" 
        border="8px solid" 
        borderColor={color} 
        clipPath={`inset(0 ${100 - value}% 0 0)`} 
      />
      <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center">
        <Text fontSize="sm" fontWeight="bold" color={color}>{value}%</Text>
      </Flex>
    </Box>
    <Text fontSize="xs" fontWeight="bold" color="gray.500">{label}</Text>
  </VStack>
);

const AttendanceMetric = ({ keyIndex, value }) => (
  <VStack bg="blue.50" p={4} borderRadius="lg" minW="80px">
    <Text fontSize="2xl" fontWeight="bold" color="blue.700">{value}%</Text>
    <Text fontSize="10px" fontWeight="extrabold" color="blue.300" textTransform="uppercase">
        Shift {keyIndex}
    </Text>
  </VStack>
);

const CircleChart = ({ data, type = "radial" }) => {
  if (type === "attendance") {
    return (
      <HStack spacing={6} justify="center" h="100%">
        {Object.entries(data).map(([key, val], i) => (
          <AttendanceMetric key={i} keyIndex={key.slice(-1)} value={val} />
        ))}
      </HStack>
    );
  }

  return (
    <HStack justify="space-around" h="100%" py={4}>
      {data.map((d, i) => (
        <CircleMetric key={i} label={d.name} value={d.value} color={d.color || "blue.500"} />
      ))}
    </HStack>
  );
};

export default CircleChart;
