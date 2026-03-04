import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box } from '@chakra-ui/react';

const AreaChart = ({ data, xAxisKey = "month", dataKey = "value", color = "#3182ce", height = 150 }) => {
  return (
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xAxisKey} fontSize={10} />
          <YAxis fontSize={10} />
          <Tooltip contentStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AreaChart;
