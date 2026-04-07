import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box } from '@chakra-ui/react';

const BarChart = ({ data, dataKeys = [], xAxisKey = "name", height = 150, showLegend = false }) => {
  return (
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} fontSize={10} />
          <YAxis fontSize={10} />
          <Tooltip contentStyle={{ fontSize: '12px' }} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
          {dataKeys.map((dk, idx) => (
            <Bar 
              key={dk.key} 
              dataKey={dk.key} 
              name={dk.name || dk.key}
              fill={dk.color || (idx === 0 ? "#cbd5e0" : "#3182ce")} 
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;
