import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box } from '@chakra-ui/react';

const LineChart = ({ data, xAxisKey = "month", dataKey = "rr", stroke = "#3182ce", height = 150 }) => {
  return (
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} fontSize={10} />
          <YAxis fontSize={10} />
          <Tooltip contentStyle={{ fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={stroke} 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;
