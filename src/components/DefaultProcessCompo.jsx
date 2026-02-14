import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import FormPage from "./FormPage";
import AddData from "../hooks/AddData";

const DefaultProcessCompo = ({
  nested,
  isView,
  showAddData,
  setShowAddData,
  handleAddDataSave,
}) => {
  return (
    <Box>
      <Flex justify="flex-end" mb={4}>
        {!isView && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setShowAddData(true)}
            borderRadius="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
          >
            Add Data
          </Button>
        )}
      </Flex>

      <Box 
        bg="white" 
        p={4} 
        borderRadius="xl" 
        shadow="sm" 
        border="1px solid" 
        borderColor="gray.100"
        overflowX="auto"
      >
        <FormPage process={nested} isView={isView} />
      </Box>

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

export default DefaultProcessCompo;
