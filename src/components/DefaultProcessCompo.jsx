import React from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import FormPage from "./FormPage";

const DefaultProcessCompo = ({
  nested,
  isView,
  showAddData,
  setShowAddData,
  handleRefresh,
}) => {
  return (
    <Box>
      <Flex justify="flex-end" mb={4}>
        {!isView && (
          <Button
            leftIcon={showAddData ? <CloseIcon boxSize={2.5} /> : <AddIcon />}
            colorScheme={showAddData ? "red" : "blue"}
            onClick={() => setShowAddData(!showAddData)}
            borderRadius="lg"
            boxShadow="sm"
            _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
          >
            {showAddData ? "Cancel Add" : "Add Data"}
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
        overflow="visible"
      >
        <FormPage
          process={nested}
          isView={isView}
          isDefault={true}
          rowDataId={nested?.rowDataId}
          refresh={handleRefresh}
          isAddingNewRow={showAddData}
          setIsAddingNewRow={setShowAddData}
        />
      </Box>
    </Box>
  );
};

export default DefaultProcessCompo;
