import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Image,
  Badge,
  Stack,
  Icon,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AttachmentIcon } from "@chakra-ui/icons";
import ConfirmDialog from "./ConfirmDialog";
import AddData from "../hooks/AddData";

const ProductValidationCompo = ({
  rows,
  nested,
  isView,
  handleEditClick,
  handleDeleteRow,
  showAddData,
  setShowAddData,
  handleAddDataSave,
  setImagePopupUrl,
  getStatusStyle,
}) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [deleteTargetIdx, setDeleteTargetIdx] = React.useState(null);

  const handleDeleteTrigger = (idx) => {
    setDeleteTargetIdx(idx);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIdx !== null) {
      handleDeleteRow(deleteTargetIdx);
      setDeleteTargetIdx(null);
    }
  };
  return (
    <Box p={6} bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Product Validation Report
          </Text>
          <Text fontSize="sm" color="gray.500">
            View and manage technical validation data for NPD.
          </Text>
        </Box>
        {!isView && (
          <Button
            leftIcon={<Box as="span" fontSize="lg">+</Box>}
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

      {/* Reports List */}
      <Stack spacing={8}>
        {rows.map((row, rowIndex) => {
          const testName = row.find((i) => i.key === "TEST NAME")?.value || "-";
          const apparatus = row.find((i) => i.key === "APPARATUS")?.value || "-";
          const evidence = row.find((i) => i.key === "EVIDENCE")?.value || "-";
          const resultValue = row.find((i) => i.key === "RESULT")?.value || "";
          const description = row.find((i) => i.key === "DESCRIPTION")?.value || "";
          const imageUrl = row.find((i) => i.key === "IMAGE")?.value || "";
          
          const { badgeColor, textColor, dotColor } = getStatusStyle(resultValue);

          return (
            <Flex
              key={nested.rowIds?.[rowIndex] || rowIndex}
              direction={{ base: "column", lg: "row" }}
              bg="#f8fafc"
              borderRadius="2xl"
              p={8}
              gap={10}
              position="relative"
              border="1px solid"
              borderColor="gray.100"
            >
              {/* Left Content */}
              <Box flex="1">
                <Stack spacing={6}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                      TEST NAME
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {testName}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                      APPARATUS
                    </Text>
                    <Text fontSize="md" fontWeight="semibold" color="gray.600">
                      {apparatus}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                      EVIDENCE
                    </Text>
                    <Flex align="center" gap={2}>
                      {/* <AttachmentIcon size="sm" /> */}
                      <Text fontSize="sm" fontWeight="medium">
                         {evidence}
                      </Text>
                    </Flex>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                      RESULT
                    </Text>
                    <Flex
                        align="center"
                        padding="4px 12px"
                        borderRadius="20px"
                        backgroundColor={badgeColor}
                        border={`1px solid ${badgeColor === "#fff" ? "#e2e8f0" : badgeColor}`}
                        color={textColor}
                        fontSize="xs"
                        fontWeight="bold"
                        width="fit-content"
                    >
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="50%"
                            bg={dotColor}
                            mr={2}
                        />
                        {resultValue || "Unspecified"}
                    </Flex>
                  </Box>

                  {description && (
                    <Text fontSize="sm" color="gray.600" fontStyle="italic" lineHeight="tall">
                      "{description}"
                    </Text>
                  )}
                </Stack>
              </Box>

              {/* Right Content - Image and Actions */}
              <Box position="relative">
                {/* Action Icons */}
                {!isView && (
                  <Flex position="absolute" top="-10px" right="-10px" zIndex={10} gap={2}>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      bg="white"
                      boxShadow="md"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleEditClick(rowIndex)}
                      aria-label="Edit report"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      bg="white"
                      boxShadow="md"
                      color="red.500"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleDeleteTrigger(rowIndex)}
                      aria-label="Delete report"
                    />
                  </Flex>
                )}

                <Box
                  p={2}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor="gray.200"
                  maxW="400px"
                >
                  <Image
                    src={imageUrl}
                    alt={testName}
                    borderRadius="lg"
                    fallbackSrc="https://via.placeholder.com/400x250?text=No+Validation+Image"
                    objectFit="cover"
                    w="100%"
                    h="250px"
                  />
                </Box>
                <Text mt={3} fontSize="10px" color="gray.400" textAlign="center" fontWeight="bold" textTransform="uppercase">
                   Fig {rowIndex + 1}: {testName} Distribution
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Stack>
      <ConfirmDialog 
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Validation Report"
        message="Are you sure you want to delete this validation report? This action cannot be reversed."
      />
      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}
    </Box>
  );
};

export default ProductValidationCompo;
