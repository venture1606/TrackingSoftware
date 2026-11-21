import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Heading,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { EditIcon, AddIcon } from "@chakra-ui/icons";
import AddData from "../hooks/AddData";
import DisabledWithTooltip from "./DisabledWithTooltip";
import { getAccessDeniedReason } from "../services/permissions";

const BreakHourCompo = ({
  rows,
  nested,
  isView,
  handleEditClick,
  showAddData,
  setShowAddData,
  handleAddDataSave,
}) => {
  return (
    <Box p={2}>
      <Flex justify="space-between" align="center" mb={6} px={4}>
        <Box>
           <Text fontSize="xl" fontWeight="bold" color="gray.800">Break Hour Configurations</Text>
           <Text fontSize="sm" color="gray.500">Track and manage employee break and setup loss times</Text>
        </Box>
        {rows.length === 0 && (
          <DisabledWithTooltip
            isDisabled={!!isView}
            label={getAccessDeniedReason({ isView: !!isView, action: "create" })}
          >
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={isView ? undefined : () => setShowAddData(true)}
              isDisabled={!!isView}
              pointerEvents={isView ? "none" : "auto"}
              borderRadius="lg"
              px={6}
            >
              Add Data
            </Button>
          </DisabledWithTooltip>
        )}
      </Flex>
      {rows.length > 0 ? (
        <Stack spacing={6}>
          {rows.map((row, rowIdx) => {
            const breakName = row.find((f) => f.key === "BREAK NAME")?.value;

            return (
              <Box
                key={rowIdx}
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
              >
                {/* Header Section */}
                <Flex
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  px={6}
                  py={4}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Flex align="center" gap={3}>
                    <Box 
                      bg="blue.500" 
                      color="white" 
                      p={2} 
                      borderRadius="lg" 
                      fontSize="xs" 
                      fontWeight="bold"
                    >
                      {String(rowIdx + 1).padStart(2, '0')}
                    </Box>
                    <Heading size="sm" color="gray.700">
                      {breakName || `Break Entry ${rowIdx + 1}`}
                    </Heading>
                  </Flex>
                  
                  <DisabledWithTooltip
                    isDisabled={!!isView}
                    label={getAccessDeniedReason({ isView: !!isView, action: "edit" })}
                  >
                    <Button
                      size="sm"
                      leftIcon={<EditIcon />}
                      colorScheme="blue"
                      variant="ghost"
                      onClick={isView ? undefined : () => handleEditClick(rowIdx)}
                      isDisabled={!!isView}
                      pointerEvents={isView ? "none" : "auto"}
                      borderRadius="lg"
                    >
                      Edit
                    </Button>
                  </DisabledWithTooltip>
                </Flex>

                {/* Grid Section for fields */}
                <Flex p={6} wrap="wrap" gap={6}>
                  {row.map((field, idx) => (
                    <Box
                      key={idx}
                      flex="1"
                      minW="150px"
                      p={4}
                      bg="gray.50"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                      transition="all 0.2s"
                      _hover={{ bg: "white", shadow: "sm", borderColor: "blue.200" }}
                    >
                      <Text 
                        fontSize="2xs" 
                        fontWeight="extrabold" 
                        color="gray.400" 
                        textTransform="uppercase" 
                        letterSpacing="wider" 
                        mb={1}
                      >
                        {field.key}
                      </Text>
                      <Text 
                        fontSize="md" 
                        fontWeight="bold" 
                        color="gray.700"
                      >
                        {field.value || "-"}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={20} 
          bg="white" 
          borderRadius="2xl" 
          border="1px dashed" 
          borderColor="gray.300"
        >
          <Text color="gray.400" fontWeight="medium">No break hour configurations found.</Text>
          <Text color="gray.400" fontSize="sm">Please use the 'Add Data' button above to initialize.</Text>
        </Flex>
      )}

      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Break Hour"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}
    </Box>
  );
};

export default BreakHourCompo;
