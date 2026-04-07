import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box } from '@chakra-ui/react';

const TableChart = ({ headers = [], data = [], keys = [] }) => {
  return (
    <Box overflowX="auto" w="100%">
      <Table size="sm" variant="simple">
        <Thead bg="gray.50">
          <Tr>
            {headers.map((h, i) => (
              <Th key={i} fontSize="10px" color="gray.500" px={2} py={1}>{h}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              {keys.map((k, j) => (
                <Td key={j} fontSize="11px" fontWeight="medium" px={2} py={2}>
                  {typeof row[k] === 'number' && k.toLowerCase().includes('percentage') ? `${row[k]}%` : row[k]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableChart;
