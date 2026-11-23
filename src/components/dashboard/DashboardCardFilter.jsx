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
import { last30Days } from '../../utils/dateUtils';

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
 * DashboardCardFilter — date range for ONE card.
 *
 * Props:
 *  - onApply({ startDate, endDate, fields }): callback with filter values ("YYYY-MM-DD" strings).
 *    Clear calls onApply({ startDate: "", endDate: "" }) so the card returns to its default range.
 *  - value: { startDate, endDate } currently applied to the card (shown when the popover opens)
 *  - defaultValue: { startDate, endDate } shown when nothing is applied (default: last 30 days)
 *  - defaultLabel: text describing what the card shows with no range applied
 *  - fields: Array of { name: string, label: string, options: string[] }
 *            Optional additional field filters besides date range.
 *  - hasActiveFilter: boolean – highlights the icon when a filter is applied
 *    (defaults to "value has a start or end date")
 */
const DashboardCardFilter = ({
  onApply,
  fields = [],
  hasActiveFilter,
  value,
  defaultValue,
  defaultLabel,
}) => {
  const fallback = defaultValue || last30Days();
  const isActive =
    hasActiveFilter !== undefined ? hasActiveFilter : !!(value?.startDate || value?.endDate);

  const [startDate, setStartDate] = useState(value?.startDate || fallback.startDate);
  const [endDate, setEndDate] = useState(value?.endDate || fallback.endDate);
  const [fieldValues, setFieldValues] = useState(
    () => fields.reduce((acc, f) => ({ ...acc, [f.name]: 'All' }), {})
  );
  const [isOpen, setIsOpen] = useState(false);

  // Each time it opens, show the range that is actually applied to this card
  const open = () => {
    const base = value?.startDate || value?.endDate ? value : fallback;
    setStartDate(base.startDate || '');
    setEndDate(base.endDate || '');
    setIsOpen(true);
  };

  const invalidRange = startDate && endDate && startDate > endDate;

  const handleApply = () => {
    if (invalidRange) return;
    if (onApply) {
      onApply({ startDate, endDate, fields: fieldValues });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    const cleared = fields.reduce((acc, f) => ({ ...acc, [f.name]: 'All' }), {});
    setFieldValues(cleared);
    if (onApply) {
      onApply({ startDate: '', endDate: '', fields: cleared });
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
              {isActive && (
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
          colorScheme={isActive ? 'blue' : 'gray'}
          aria-label="Filter this card by date"
          title={
            isActive
              ? `Showing ${value?.startDate || '…'} to ${value?.endDate || '…'} — click to change`
              : 'Filter this card by date'
          }
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          _hover={{ bg: 'blue.50', color: 'blue.600' }}
        />
      </PopoverTrigger>
      <PopoverContent w="240px" boxShadow="lg" border="1px solid" borderColor="gray.200" zIndex={1500}>
        <PopoverArrow />
        <PopoverCloseButton size="xs" onClick={() => setIsOpen(false)} />
        <PopoverBody p={3}>
          <VStack spacing={3} align="stretch">
            <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
              Date Range (this card only)
            </Text>
            <Text fontSize="10px" color="gray.500" lineHeight="1.4">
              {isActive
                ? 'A custom range is applied. Clear returns to the default.'
                : defaultLabel
                  ? `Now showing: ${defaultLabel}.`
                  : 'Pick From and To (both days included).'}
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

            {invalidRange && (
              <Text fontSize="10px" color="red.500">
                From date must be on or before To date.
              </Text>
            )}

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
                Clear
              </Button>
              <Button size="xs" colorScheme="blue" onClick={handleApply} fontSize="10px" isDisabled={!!invalidRange}>
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
