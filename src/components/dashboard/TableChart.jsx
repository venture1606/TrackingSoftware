import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Badge } from '@chakra-ui/react';

const STATUS_COLOR_MAP = {
  red: { bg: '#FED7D7', color: '#C53030', label: 'Red' },
  green: { bg: '#C6F6D5', color: '#276749', label: 'Green' },
  orange: { bg: '#FEEBC8', color: '#C05621', label: 'Orange' },
  pending: { bg: '#E2E8F0', color: '#4A5568', label: 'Pending' },
  'in progress': { bg: '#EBF8FF', color: '#2B6CB0', label: 'In Progress' },
  inrevision: { bg: '#EBF8FF', color: '#2B6CB0', label: 'In Revision' },
  completed: { bg: '#C6F6D5', color: '#276749', label: 'Completed' },
  closed: { bg: '#C6F6D5', color: '#276749', label: 'Closed' },
  approved: { bg: '#C6F6D5', color: '#276749', label: 'Approved' },
  rejected: { bg: '#FED7D7', color: '#C53030', label: 'Rejected' },
};

const StatusDot = ({ value }) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  const config = STATUS_COLOR_MAP[normalized];
  if (!config) return <span>{value}</span>;
  return (
    <Badge
      px={2}
      py={0.5}
      borderRadius="full"
      fontSize="9px"
      fontWeight="bold"
      bg={config.bg}
      color={config.color}
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {config.label}
    </Badge>
  );
};

const isStatusValue = (value) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  return normalized in STATUS_COLOR_MAP;
};

const TableChart = ({ headers = [], data = [], keys = [], colorKeys = [] }) => {
  return (
    <Box 
      maxH="400px" 
      overflowY="auto" 
      overflowX="auto" 
      w="100%"
      sx={{
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '10px',
          border: '2px solid #f1f1f1',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}
    >
      <Table size="sm" variant="simple" layout="fixed">
        <Thead 
          bg="gray.100" 
          position="sticky" 
          top={0} 
          zIndex={2}
          boxShadow="0 2px 2px -1px rgba(0,0,0,0.1)"
        >
          <Tr>
            {headers.map((h, i) => (
              <Th 
                key={i} 
                fontSize="11px" 
                color="gray.600" 
                px={3} 
                py={3} 
                whiteSpace="nowrap"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {h}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, i) => (
            <Tr key={i}>
              {keys.map((k, j) => {
                const val = row[k];
                const shouldColor = colorKeys.includes(k) || isStatusValue(val);
                return (
                  <Td key={j} fontSize="11px" fontWeight="medium" px={2} py={2}>
                    {shouldColor
                      ? <StatusDot value={val} />
                      : typeof val === 'number' && k.toLowerCase().includes('percentage')
                        ? `${val}%`
                        : val}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableChart;
