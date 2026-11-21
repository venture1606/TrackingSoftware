import React, { useCallback, useMemo } from "react";
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
import { FixedSizeList as List } from "react-window";
import ConfirmDialog from "./ConfirmDialog";
import AddData from "../hooks/AddData";
import { resolveFileUrl } from "../config/api";
import DisabledWithTooltip from "./DisabledWithTooltip";
import { getAccessDeniedReason } from "../services/permissions";
import ItemsData from "../utils/ItemsData";

const VALIDATION_PARENT_ALIASES = {
  "NO.": ["NO.", "NO"],
  PART: ["PART"],
  "from.": ["from.", "FROM"],
};

const pickParentValue = (parentRowItems, aliases) => {
  if (!Array.isArray(parentRowItems)) return "";
  for (const alias of aliases) {
    const hit = parentRowItems.find(
      (c) =>
        String(c?.key || "")
          .trim()
          .toUpperCase() === String(alias).trim().toUpperCase(),
    );
    if (hit != null && String(hit.value ?? "").trim() !== "") {
      return hit.value;
    }
  }
  return "";
};

const ProductValidationCompo = ({
  rows,
  nested,
  isView,
  parentRowItems = [],
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

  const lockedKeys =
    ItemsData.ProcessLockedFields?.[nested?.processId || "DD/R/014"] || [
      "NO.",
      "PART",
      "from.",
    ];

  const parentPrefill = useMemo(() => {
    const values = {};
    for (const [key, aliases] of Object.entries(VALIDATION_PARENT_ALIASES)) {
      values[key] = pickParentValue(parentRowItems, aliases);
    }
    return values;
  }, [parentRowItems]);

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

  const ReportRow = useCallback(({ index, style }) => {
    const row = rows[index];
    const rowIndex = index;

    const noVal = row.find((i) => i.key === "NO.")?.value || "";
    const partVal = row.find((i) => i.key === "PART")?.value || "";
    const fromVal = row.find((i) => i.key === "from.")?.value || "";
    const testName = row.find((i) => i.key === "TEST NAME")?.value || "-";
    const apparatus = row.find((i) => i.key === "APPARATUS")?.value || "-";
    const evidence = row.find((i) => i.key === "EVIDENCE")?.value || "-";
    const resultValue = row.find((i) => i.key === "RESULT")?.value || "";
    const description = row.find((i) => i.key === "DESCRIPTION")?.value || "";
    const imageUrl = row.find((i) => i.key === "IMAGE")?.value || "";
    
    const { badgeColor, textColor, dotColor } = getStatusStyle(resultValue);

    return (
      <div style={{ ...style, paddingBottom: "32px" }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          bg="#f8fafc"
          borderRadius="2xl"
          p={8}
          gap={10}
          position="relative"
          border="1px solid"
          borderColor="gray.100"
          height="calc(100% - 32px)"
        >
          {/* Left Content */}
          <Box flex="1">
            <Stack spacing={6}>
              {(noVal || partVal || fromVal) && (
                <Flex gap={6} wrap="wrap">
                  {noVal ? (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                        NO.
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {noVal}
                      </Text>
                    </Box>
                  ) : null}
                  {partVal ? (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                        PART
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {partVal}
                      </Text>
                    </Box>
                  ) : null}
                  {fromVal ? (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mb={1}>
                        from.
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {fromVal}
                      </Text>
                    </Box>
                  ) : null}
                </Flex>
              )}
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
                <Text fontSize="sm" color="gray.600" fontStyle="italic" lineHeight="tall" isTruncated noOfLines={2}>
                  "{description}"
                </Text>
              )}
            </Stack>
          </Box>

          {/* Right Content - Image and Actions */}
          <Box position="relative">
            <Flex position="absolute" top="-10px" right="-10px" zIndex={10} gap={2}>
              <DisabledWithTooltip
                isDisabled={!!isView}
                label={getAccessDeniedReason({ isView: !!isView, action: "edit" })}
              >
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  bg="white"
                  boxShadow="md"
                  _hover={isView ? undefined : { bg: "gray.50" }}
                  onClick={isView ? undefined : () => handleEditClick(rowIndex)}
                  isDisabled={!!isView}
                  pointerEvents={isView ? "none" : "auto"}
                  aria-label="Edit report"
                />
              </DisabledWithTooltip>
              <DisabledWithTooltip
                isDisabled={!!isView}
                label={getAccessDeniedReason({ isView: !!isView, action: "delete" })}
              >
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  bg="white"
                  boxShadow="md"
                  color="red.500"
                  _hover={isView ? undefined : { bg: "gray.50" }}
                  onClick={isView ? undefined : () => handleDeleteTrigger(rowIndex)}
                  isDisabled={!!isView}
                  pointerEvents={isView ? "none" : "auto"}
                  aria-label="Delete report"
                />
              </DisabledWithTooltip>
            </Flex>

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
                src={resolveFileUrl(imageUrl)}
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
      </div>
    );
  }, [rows, nested.rowIds, isView, handleEditClick, getStatusStyle]);

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
        <DisabledWithTooltip
          isDisabled={!!isView}
          label={getAccessDeniedReason({ isView: !!isView, action: "create" })}
        >
          <Button
            leftIcon={<Box as="span" fontSize="lg">+</Box>}
            colorScheme="blue"
            bg="blue.700"
            _hover={isView ? undefined : { bg: "blue.800" }}
            onClick={isView ? undefined : () => setShowAddData(true)}
            isDisabled={!!isView}
            pointerEvents={isView ? "none" : "auto"}
            borderRadius="lg"
            px={6}
          >
            Add Data
          </Button>
        </DisabledWithTooltip>
      </Flex>

      {/* Reports List with Virtualization */}
      <Box height="600px">
        <List
            height={600}
            itemCount={rows.length}
            itemSize={450}
            width="100%"
        >
            {ReportRow}
        </List>
      </Box>

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
          processId={nested?.processId || "DD/R/014"}
          initialValues={parentPrefill}
          lockedKeys={lockedKeys}
        />
      )}
    </Box>
  );
};


export default ProductValidationCompo;
