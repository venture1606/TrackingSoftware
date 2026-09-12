import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Icon,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Badge,
  Wrap,
  WrapItem,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const FilterIcon = (props) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);

const formatDateInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FilterCompo = ({
  dateFields = [],
  onFilterChange,
  currentFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Available field options
  const defaultField = dateFields.length > 0 ? dateFields[0] : "Created On";
  const [selectedField, setSelectedField] = useState(defaultField);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({
    field: defaultField,
    startDate: "",
    endDate: "",
  });

  // Sync if dateFields or currentFilter change
  useEffect(() => {
    if (currentFilter) {
      setSelectedField(currentFilter.field || defaultField);
      setStartDate(currentFilter.startDate || "");
      setEndDate(currentFilter.endDate || "");
      setAppliedFilter({
        field: currentFilter.field || defaultField,
        startDate: currentFilter.startDate || "",
        endDate: currentFilter.endDate || "",
      });
    } else {
      const nextField = dateFields.length > 0 ? dateFields[0] : "Created On";
      setSelectedField(nextField);
      setStartDate("");
      setEndDate("");
      setAppliedFilter({
        field: nextField,
        startDate: "",
        endDate: "",
      });
    }
  }, [dateFields, currentFilter]);

  const hasActiveFilter = Boolean(
    appliedFilter.startDate || appliedFilter.endDate
  );

  const handleApply = () => {
    const filterData = {
      field: selectedField,
      startDate,
      endDate,
      isActive: Boolean(startDate || endDate),
    };
    setAppliedFilter({
      field: selectedField,
      startDate,
      endDate,
    });
    if (onFilterChange) {
      onFilterChange(filterData);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    const nextField = dateFields.length > 0 ? dateFields[0] : "Created On";
    setSelectedField(nextField);
    setStartDate("");
    setEndDate("");
    setAppliedFilter({
      field: nextField,
      startDate: "",
      endDate: "",
    });
    if (onFilterChange) {
      onFilterChange({
        field: nextField,
        startDate: "",
        endDate: "",
        isActive: false,
      });
    }
    setIsOpen(false);
  };

  const applyPreset = (preset) => {
    const now = new Date();
    if (preset === "today") {
      const todayStr = formatDateInput(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = formatDateInput(yesterday);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setStartDate(formatDateInput(d));
      setEndDate(formatDateInput(now));
    } else if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDateInput(firstDay));
      setEndDate(formatDateInput(now));
    } else if (preset === "all") {
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Button
          size="sm"
          fontSize="xs"
          variant="outline"
          bg="white"
          borderColor={hasActiveFilter ? "blue.400" : "gray.300"}
          color={hasActiveFilter ? "blue.600" : "gray.700"}
          leftIcon={<FilterIcon />}
          rightIcon={<ChevronDownIcon />}
          onClick={() => setIsOpen(!isOpen)}
          _hover={{ bg: "gray.50", borderColor: "blue.300" }}
          minW="110px"
        >
          {hasActiveFilter ? "Filtered" : "Date Filter"}
          {hasActiveFilter && (
            <Badge
              ml={1.5}
              colorScheme="blue"
              borderRadius="full"
              px={1.5}
              fontSize="9px"
            >
              Active
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w="280px"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
        zIndex={1500}
        _focus={{ boxShadow: "lg" }}
      >
        <PopoverArrow />
        <PopoverCloseButton size="xs" onClick={() => setIsOpen(false)} />
        <PopoverHeader
          fontSize="xs"
          fontWeight="bold"
          color="gray.700"
          borderBottom="1px solid"
          borderColor="gray.100"
          py={2}
        >
          Filter by Date
        </PopoverHeader>
        <PopoverBody p={3}>
          <VStack spacing={3} align="stretch">
            {/* Field Selector */}
            <Box>
              <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={1}>
                Date Field
              </Text>
              <Select
                size="sm"
                fontSize="xs"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
              >
                {dateFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
                <option value="Created On">Created On</option>
                <option value="Updated On">Updated On</option>
              </Select>
            </Box>

            {/* Quick Presets */}
            <Box>
              <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={1}>
                Quick Presets
              </Text>
              <Wrap spacing={1.5}>
                <WrapItem>
                  <Button
                    size="xs"
                    variant="outline"
                    fontSize="10px"
                    px={2}
                    py={1}
                    h="22px"
                    onClick={() => applyPreset("today")}
                  >
                    Today
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    size="xs"
                    variant="outline"
                    fontSize="10px"
                    px={2}
                    py={1}
                    h="22px"
                    onClick={() => applyPreset("yesterday")}
                  >
                    Yesterday
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    size="xs"
                    variant="outline"
                    fontSize="10px"
                    px={2}
                    py={1}
                    h="22px"
                    onClick={() => applyPreset("last7")}
                  >
                    Last 7 Days
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    size="xs"
                    variant="outline"
                    fontSize="10px"
                    px={2}
                    py={1}
                    h="22px"
                    onClick={() => applyPreset("thisMonth")}
                  >
                    This Month
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    size="xs"
                    variant="outline"
                    fontSize="10px"
                    px={2}
                    py={1}
                    h="22px"
                    onClick={() => applyPreset("all")}
                  >
                    Clear Dates
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>

            {/* Date Inputs */}
            <VStack spacing={2} align="stretch">
              <HStack>
                <Text fontSize="11px" color="gray.600" w="35px" flexShrink={0}>
                  From
                </Text>
                <Input
                  type="date"
                  size="sm"
                  fontSize="xs"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  borderRadius="md"
                  borderColor="gray.300"
                />
              </HStack>
              <HStack>
                <Text fontSize="11px" color="gray.600" w="35px" flexShrink={0}>
                  To
                </Text>
                <Input
                  type="date"
                  size="sm"
                  fontSize="xs"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  borderRadius="md"
                  borderColor="gray.300"
                />
              </HStack>
            </VStack>
          </VStack>
        </PopoverBody>
        <PopoverFooter
          borderTop="1px solid"
          borderColor="gray.100"
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            size="xs"
            variant="ghost"
            colorScheme="gray"
            fontSize="11px"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            size="xs"
            colorScheme="blue"
            fontSize="11px"
            onClick={handleApply}
          >
            Apply Filter
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default FilterCompo;
