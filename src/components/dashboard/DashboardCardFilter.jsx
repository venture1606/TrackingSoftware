import React, { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Divider,
  Badge,
} from '@chakra-ui/react';

// Inline SVG filter funnel icon
const FunnelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

/**
 * DashboardCardFilter
 *
 * Props:
 *  - onApply({ startDate, endDate, fields }): callback with filter values
 *  - fields: Array of { name: string, label: string, options: string[] }
 *            Optional additional field filters besides date range.
 *  - hasActiveFilter: boolean – highlights the icon when a filter is applied
 */
const DashboardCardFilter = ({ onApply, fields = [], hasActiveFilter = false }) => {
  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [fieldValues, setFieldValues] = useState(
    () => fields.reduce((acc, f) => ({ ...acc, [f.name]: 'All' }), {})
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (onApply) {
      onApply({ startDate, endDate, fields: fieldValues });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setStartDate(oneMonthAgo);
    setEndDate(today);
    setFieldValues(fields.reduce((acc, f) => ({ ...acc, [f.name]: 'All' }), {}));
    if (onApply) {
      onApply({ startDate: oneMonthAgo, endDate: today, fields: fields.reduce((acc, f) => ({ ...acc, [f.name]: 'All' }), {}) });
    }
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end" closeOnBlur>
      <PopoverTrigger>
        <IconButton
          icon={
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <FunnelIcon />
              {hasActiveFilter && (
                <Badge
                  position="absolute"
                  top="-4px"
                  right="-6px"
                  colorScheme="blue"
                  borderRadius="full"
                  boxSize="8px"
                  minW="8px"
                  p={0}
                  bg="blue.500"
                />
              )}
            </span>
          }
          size="xs"
          variant="ghost"
          colorScheme={hasActiveFilter ? 'blue' : 'gray'}
          aria-label="Filter"
          onClick={() => setIsOpen(!isOpen)}
          _hover={{ bg: 'blue.50', color: 'blue.600' }}
        />
      </PopoverTrigger>
      <PopoverContent w="240px" boxShadow="lg" border="1px solid" borderColor="gray.200" zIndex={1500}>
        <PopoverArrow />
        <PopoverCloseButton size="xs" onClick={() => setIsOpen(false)} />
        <PopoverBody p={3}>
          <VStack spacing={3} align="stretch">
            <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
              Date Range
            </Text>
            <VStack spacing={2} align="stretch">
              <HStack>
                <Text fontSize="10px" color="gray.500" w="30px" flexShrink={0}>From</Text>
                <Input
                  type="date"
                  size="xs"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fontSize="11px"
                  borderRadius="md"
                />
              </HStack>
              <HStack>
                <Text fontSize="10px" color="gray.500" w="30px" flexShrink={0}>To</Text>
                <Input
                  type="date"
                  size="xs"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fontSize="11px"
                  borderRadius="md"
                />
              </HStack>
            </VStack>

            {fields.length > 0 && (
              <>
                <Divider />
                <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  Filters
                </Text>
                {fields.map((field) => (
                  <VStack key={field.name} spacing={1} align="stretch">
                    <Text fontSize="10px" color="gray.600" fontWeight="medium">{field.label}</Text>
                    <Select
                      size="xs"
                      fontSize="11px"
                      value={fieldValues[field.name] || 'All'}
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      borderRadius="md"
                    >
                      <option value="All">All</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </VStack>
                ))}
              </>
            )}

            <Divider />
            <HStack spacing={2} justify="flex-end">
              <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleReset} fontSize="10px">
                Reset
              </Button>
              <Button size="xs" colorScheme="blue" onClick={handleApply} fontSize="10px">
                Apply
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardCardFilter;
