import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

const ProtoCompo = ({
  nested,
  rows,
  isView,
  handleProtoInlineSave,
  colorCoordinatesProto,
  getStatusStyle,
  handleAddDataSave,
  DefaultTemplateForProtoProcess,
}) => {
  const gridTemplateColumns = "60px 1fr 200px";

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
        gap={4} 
        mb={4} 
        px={4} 
        minW="fit-content"
        bg="gray.100"
        borderRadius="lg"
      >
        <Text 
          fontWeight="800" 
          color="gray.600" 
          fontSize="xs" 
          textTransform="uppercase" 
          textAlign="center" 
          py={3}
          letterSpacing="wider"
        >
          SL.NO
        </Text>
        <Text 
          fontWeight="800" 
          color="gray.600" 
          fontSize="xs" 
          textTransform="uppercase"
          textAlign="left"
          py={3}
          letterSpacing="wider"
        >
          PROCESS
        </Text>
        <Text 
          fontWeight="800" 
          color="gray.600" 
          fontSize="xs" 
          textTransform="uppercase"
          textAlign="center"
          py={3}
          letterSpacing="wider"
        >
          STATUS
        </Text>
      </Box>

      {/* Data Rows */}
      {rows && rows.length > 0 ? (
        <Box minW="fit-content" px={2}>
          {rows.map((row, rowIdx) => (
            <React.Fragment key={rowIdx}>
              {row.map((cell, colIdx) => {
                const slNo = rowIdx * row.length + colIdx + 1;
                const { badgeColor, textColor, dotColor } = getStatusStyle(cell.value);

                return (
                  <Box 
                    key={`${rowIdx}-${colIdx}`}
                    display="grid" 
                    gridTemplateColumns={gridTemplateColumns} 
                    gap={4} 
                    bg="white" 
                    py={3} 
                    px={4} 
                    mb={2}
                    borderRadius="lg" 
                    boxShadow="sm" 
                    border="1px solid"
                    borderColor="gray.50"
                    alignItems="center"
                    _hover={{ boxShadow: "md", borderColor: "blue.100" }}
                    transition="all 0.2s"
                  >
                    {/* SL.NO */}
                    <Text fontSize="sm" fontWeight="bold" color="gray.500" textAlign="center">
                      {String(slNo).padStart(2, '0')}
                    </Text>

                    {/* PROCESS NAME */}
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      {cell.key}
                    </Text>

                    {/* STATUS SELECT */}
                    <Box>
                      {isView ? (
                        <Flex align="center" gap={2} justify="center">
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
                              {cell.value || "Pending"}
                            </Box>
                        </Flex>
                      ) : (
                        <Select
                          size="sm"
                          value={cell.value || ""}
                          onChange={(e) => handleProtoInlineSave(e.target.value, rowIdx, colIdx)}
                          borderRadius="md"
                          bg="white"
                          fontSize="xs"
                          fontWeight="600"
                          cursor="pointer"
                          focusBorderColor="blue.400"
                          borderColor={badgeColor}
                          borderWidth="1px"
                          _focus={{ boxShadow: "none" }}
                        >
                          <option value="">Select Status</option>
                          {colorCoordinatesProto.map((option) => (
                            <option key={option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
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
