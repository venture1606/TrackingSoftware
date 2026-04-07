import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Text, VStack } from '@chakra-ui/react';

const GaugeChart = ({ value = 0, max = 100, label = 'R/A Ratio', color = '#e53e3e', height = 200 }) => {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

  // Gauge uses a half-donut: filled + remainder + transparent bottom half
  const gaugeData = [
    { name: 'Filled', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
    { name: 'Hidden', value: 100 }, // bottom half
  ];

  const COLORS = [color, '#e2e8f0', 'transparent'];

  return (
    <Box w="100%" h={height} position="relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => name !== 'Hidden' ? [`${val.toFixed(1)}%`, name] : null}
            contentStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <VStack
        position="absolute"
        bottom="15%"
        left="50%"
        transform="translateX(-50%)"
        spacing={0}
        textAlign="center"
        pointerEvents="none"
      >
        <Text fontSize="2xl" fontWeight="bold" color={color} lineHeight={1}>
          {percentage.toFixed(1)}%
        </Text>
        <Text fontSize="xs" color="gray.500" fontWeight="semibold" mt={1}>
          {label}
        </Text>
        <Text fontSize="10px" color="gray.400">
          {clampedValue} / {max}
        </Text>
      </VStack>
    </Box>
  );
};

export default GaugeChart;
