import React from "react"

import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, Line as ReLine } from "recharts"

// Custom Tooltip (still reusable)
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <Box w="40" rounded="sm" bg="white" p="3">
      <HStack>
        <span>{label}</span>
      </HStack>
      <Stack>
        {payload.map((item) => (
          <HStack key={item.name}>
            <Box boxSize="2" bg={item.color} />
            <Text textStyle="xl">{item.value}</Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  )
}

// ✅ Reusable Graph component
function Graph({ data, series, xKey, xLabel = "X-Axis", yLabel = "Y-Axis" }) {
  return (
    <Box maxH="sm" className="GraphContainer">
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid stroke="#ccc" vertical={false} />
        <XAxis dataKey={xKey} label={{ value: xLabel, position: "bottom" }} />
        <YAxis label={{ value: yLabel, position: "insideLeft", angle: -90, style: { textAnchor: "middle" } }} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((item) => (
          <ReLine
            key={item.name}
            type="monotone"
            dataKey={item.name}
            stroke="teal"
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </Box>
  )
}

export default Graph
