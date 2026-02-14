import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Select,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, AddIcon } from "@chakra-ui/icons";

const ProtoCompo = ({
  nested,
  rows,
  isView,
  editingProtoCell,
  handleProtoStatusChange,
  handleProtoSaveClick,
  setEditingProtoCell,
  colorCoordinatesProto,
  getStatusStyle,
  handleAddDataSave,
  DefaultTemplateForProtoProcess,
}) => {
  const gridTemplateColumns = `60px repeat(${nested.header?.length || 1}, 180px)`;

  return (
    <Box 
      className="ProtoCompoContainer" 
      overflowX="auto" 
      maxW="100%" 
      p={4} 
      bg="#f8fafc" 
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
    >
      {/* Header Row */}
      <Box 
        display="grid" 
        gridTemplateColumns={gridTemplateColumns} 
        gap={6} 
        mb={4} 
        px={4} 
        minW="fit-content"
      >
        <Text 
          fontWeight="800" 
          color="gray.400" 
          fontSize="xs" 
          textTransform="uppercase" 
          textAlign="center" 
          py={2}
          letterSpacing="wider"
        >
          SL.NO
        </Text>
        {nested.header.map((col, idx) => (
          <Text 
            key={idx} 
            fontWeight="800" 
            color="gray.400" 
            fontSize="xs" 
            textTransform="uppercase"
            minW="180px"
            textAlign="center"
            py={2}
            letterSpacing="wider"
          >
            {col}
          </Text>
        ))}
      </Box>

      {/* Data Rows */}
      {nested.value.length > 0 ? (
        <Stack spacing={3} minW="fit-content" px={2}>
          {rows.map((row, rowIdx) => (
            <Box 
              key={rowIdx} 
              display="grid" 
              gridTemplateColumns={gridTemplateColumns} 
              gap={6} 
              bg="white" 
              py={4} 
              px={4} 
              borderRadius="xl" 
              boxShadow="sm" 
              border="1px solid"
              borderColor="gray.50"
              alignItems="center"
              _hover={{ boxShadow: "md", borderColor: "blue.100" }}
              transition="all 0.2s"
            >
              {/* SL.NO */}
              <Text fontSize="sm" fontWeight="bold" color="gray.500" textAlign="center">
                {String(rowIdx + 1).padStart(2, '0')}
              </Text>

              {/* Dynamic Columns */}
              {row.map((cell, colIdx) => {
                const isEditing = editingProtoCell?.rowIdx === rowIdx && editingProtoCell?.colIdx === colIdx;
                const { badgeColor, textColor, dotColor } = getStatusStyle(cell.value);

                return (
                  <Flex key={`${rowIdx}-${colIdx}`} justify="center" align="center">
                    {isEditing ? (
                      <Flex align="center" gap={2} w="100%">
                        <Select
                          size="sm"
                          value={cell.value}
                          onChange={(e) => handleProtoStatusChange(e, rowIdx, colIdx)}
                          borderRadius="lg"
                          bg="white"
                          fontSize="xs"
                          fontWeight="600"
                          cursor="pointer"
                          focusBorderColor="blue.400"
                        >
                          <option value="">Select Status</option>
                          {colorCoordinatesProto.map((option) => (
                            <option key={option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <Tooltip label="Save Status">
                          <IconButton
                            size="xs"
                            icon={<CheckIcon />}
                            colorScheme="green"
                            onClick={() => handleProtoSaveClick(rowIdx)}
                            aria-label="Save status"
                            borderRadius="md"
                          />
                        </Tooltip>
                      </Flex>
                    ) : (
                      <Flex align="center" gap={2}>
                        <Box
                          display="inline-flex"
                          alignItems="center"
                          px={4}
                          py={1.5}
                          borderRadius="full"
                          bg={badgeColor}
                          border="1px solid"
                          borderColor={badgeColor === "#fff" ? "gray.200" : badgeColor}
                          color={textColor}
                          fontSize="xs"
                          fontWeight="bold"
                          whiteSpace="nowrap"
                          shadow="sm"
                        >
                          <Box
                            w="6px"
                            h="6px"
                            borderRadius="50%"
                            bg={dotColor}
                            mr={2}
                          />
                          {cell.value || "Select"}
                        </Box>
                        {!isView && (
                          <Tooltip label="Change Status">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={<EditIcon />}
                              color="gray.400"
                              _hover={{ color: "blue.500", bg: "blue.50" }}
                              onClick={() => setEditingProtoCell({ rowIdx, colIdx })}
                              aria-label="Edit status"
                              borderRadius="md"
                            />
                          </Tooltip>
                        )}
                      </Flex>
                    )}
                  </Flex>
                );
              })}
            </Box>
          ))}
        </Stack>
      ) : (
        !isView && (
          <Flex direction="column" align="center" justify="center" py={20} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
            <Text color="gray.500" mb={4} fontWeight="medium">No Proto Model data found. Start by creating the page.</Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="solid"
              px={8}
              borderRadius="lg"
              onClick={() => handleAddDataSave(DefaultTemplateForProtoProcess)}
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Init Proto Model
            </Button>
          </Flex>
        )
      )}
    </Box>
  );
};

export default ProtoCompo;
