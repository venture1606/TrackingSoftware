import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box } from '@chakra-ui/react';

const RadarChart = ({ data, angleKey = "department", dataKey = "score", height = 200, color = "#3182ce" }) => {
  return (
    <Box w="100%" h={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={angleKey} fontSize={10} />
          <PolarRadiusAxis fontSize={10} />
          <Radar
            name={dataKey.toUpperCase()}
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.6}
          />
          <Tooltip contentStyle={{ fontSize: '10px' }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RadarChart;
