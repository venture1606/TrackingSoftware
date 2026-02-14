import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { EditIcon, AddIcon } from "@chakra-ui/icons";
import TruncatedText from "./TruncatedText";
import AddData from "../hooks/AddData";

const TechnicalSpecificationCompo = ({
  nested,
  isView,
  handleEditClick,
  setImagePopupUrl,
  ImageUploadArray,
  showAddData,
  setShowAddData,
  handleAddDataSave,
}) => {
  if (!nested?.value) return null;

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6} px={2}>
        <Box>
           <Text fontSize="xl" fontWeight="bold" color="gray.800">Technical Specifications</Text>
           <Text fontSize="sm" color="gray.500">Manage detailed technical requirement and revisions</Text>
        </Box>
        {!isView && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setShowAddData(true)}
            borderRadius="lg"
            px={6}
            _hover={{ transform: "translateY(-1px)", shadow: "md" }}
          >
            Add Data
          </Button>
        )}
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {nested.value.map((row, rowIdx) => {
          const revNo = row.find((f) => f.key === "REVISION NO")?.value;

          return (
            <Box
              key={rowIdx}
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
              p={6}
              position="relative"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              {/* Card Header */}
              <Flex justify="space-between" align="start" mb={4}>
                <Badge 
                  colorScheme="blue" 
                  variant="subtle" 
                  px={3} 
                  py={1} 
                  borderRadius="full" 
                  fontSize="2xs" 
                  fontWeight="bold"
                >
                  REV: {revNo || "00"}
                </Badge>
                {!isView && (
                  <Button
                    size="xs"
                    leftIcon={<EditIcon />}
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEditClick(rowIdx)}
                  >
                    Edit
                  </Button>
                )}
              </Flex>

              {/* Card Body */}
              <Stack spacing={3}>
                {row.map((field) => {
                  if (field.key === "REVISION NO") return null;

                  if (ImageUploadArray.includes(field.key)) {
                    return (
                      <Flex key={field.key} justify="space-between" align="center" py={1}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                          {field.key}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="teal"
                          variant="outline"
                          onClick={() => setImagePopupUrl(field.value)}
                          px={4}
                          borderRadius="lg"
                        >
                          View Attachment
                        </Button>
                      </Flex>
                    );
                  }

                  return (
                    <Box key={field.key} py={1}>
                      <Text fontSize="2xs" fontWeight="extrabold" color="gray.400" textTransform="uppercase" mb={0.5}>
                        {field.key}
                      </Text>
                      <Box fontSize="sm" color="gray.700" fontWeight="medium">
                         <TruncatedText text={field.value} limit={35} />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>

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

export default TechnicalSpecificationCompo;
