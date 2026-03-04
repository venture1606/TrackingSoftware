import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box } from '@chakra-ui/react';

const COLORS = ['#3182ce', '#48bb78', '#f6ad55', '#e53e3e', '#805ad5', '#d69e2e'];

const DonutChart = ({ data, nameKey = "name", dataKey = "value", height = 200, innerRadius = 50, outerRadius = 80 }) => {
  return (
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: '10px' }} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DonutChart;
