import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Image,
  SimpleGrid,
  Divider,
  Badge,
} from "@chakra-ui/react";

import AddData from "../hooks/AddData";

const ContinousImprovementCompo = ({
  rows,
  nested,
  getRowData,
  isView,
  handleEditClick,
  handleDeleteRow,
  showAddData,
  setShowAddData,
  handleAddDataSave,
}) => {
  return (
    <Stack spacing={6} p={2}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
           <Text fontSize="xl" fontWeight="bold" color="gray.800">Improvement Records</Text>
           <Text fontSize="sm" color="gray.500">Track and manage continuous improvement initiatives</Text>
        </Box>
        {!isView && (
          <Button
            leftIcon={<Box as="span">+</Box>}
            colorScheme="blue"
            bg="blue.700"
            _hover={{ bg: "blue.800" }}
            onClick={() => setShowAddData(true)}
            borderRadius="lg"
            px={6}
          >
            Add Data
          </Button>
        )}
      </Flex>
      {rows.map((row, rowIndex) => {
        const rowData = getRowData(row);

        return (
          <Box
            key={rowIndex}
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
            p={6}
          >
            {/* Header / Meta Info */}
            <Flex justify="space-between" align="start" mb={6}>
              <SimpleGrid columns={{ base: 1, md: 5 }} spacing={8} flex="1">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>IMP. NO</Text>
                  <Text fontWeight="bold" color="gray.700">{rowData["IMP. NO"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>DATE</Text>
                  <Text fontWeight="semibold" color="gray.600">{rowData["DATE"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>DONE BY</Text>
                  <Badge colorScheme="blue" borderRadius="full" px={3}>{rowData["DONE BY"] || "Unassigned"}</Badge>
                </Box>
              </SimpleGrid>

              {!isView && (
                <Flex gap={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEditClick(rowIndex)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteRow(rowIndex)}
                  >
                    Delete
                  </Button>
                </Flex>
              )}
            </Flex>

            <Divider mb={6} />

            {/* Content Sections */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
              <Stack spacing={6}>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Nature of Problem</Text>
                  <Text fontSize="md" fontWeight="bold" color="red.500">{rowData["NATURE OF PROBLEM"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Improvement Action</Text>
                  <Text fontSize="md" fontWeight="bold" color="green.600">{rowData["IMPROVEMENT ACTION"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Root Cause</Text>
                  <Text fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">{rowData["ROOT CAUSE"] || "-"}</Text>
                </Box>
              </Stack>

              <Stack spacing={6}>
                 <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Corrective Action</Text>
                  <Text fontSize="sm" color="gray.600">{rowData["CORRECTIVE ACTION"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Action Implementation</Text>
                  <Text fontSize="sm" color="gray.600">{rowData["ACTION IMPLEMENTATION"] || "-"}</Text>
                </Box>
              </Stack>
            </SimpleGrid>

            {/* Visual Comparison Section */}
            <Box mt={10} p={6} bg="blue.50" borderRadius="2xl">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} textAlign="center">Before Improvement</Text>
                  <Flex justify="center" align="center" h="200px">
                    {rowData["BEFORE"] ? (
                      <Image
                        src={rowData["BEFORE"]}
                        alt="Before"
                        maxH="100%"
                        borderRadius="lg"
                        fallbackSrc="https://via.placeholder.com/200x200?text=No+Before+Image"
                      />
                    ) : (
                      <Text color="gray.400" fontSize="sm" fontStyle="italic">No "Before" image available</Text>
                    )}
                  </Flex>
                </Box>

                <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} textAlign="center">After Improvement</Text>
                   <Flex justify="center" align="center" h="200px">
                    {rowData["AFTER"] ? (
                      <Image
                        src={rowData["AFTER"]}
                        alt="After"
                        maxH="100%"
                        borderRadius="lg"
                        fallbackSrc="https://via.placeholder.com/200x200?text=No+After+Image"
                      />
                    ) : (
                      <Text color="gray.400" fontSize="sm" fontStyle="italic">No "After" image available</Text>
                    )}
                  </Flex>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Bottom Details */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={8}>
               <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Results & Benefits</Text>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">{rowData["RESULTS AND BENEFITS"] || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Horizontal Deployment</Text>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">{rowData["HORIZONTAL DEPLOYMENT"] || "-"}</Text>
                </Box>
            </SimpleGrid>
          </Box>
        );
      })}
      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}
    </Stack>
  );
};

export default ContinousImprovementCompo;
