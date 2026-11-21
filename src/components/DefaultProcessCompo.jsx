import React from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import FormPage from "./FormPage";
import DisabledWithTooltip from "./DisabledWithTooltip";
import { getAccessDeniedReason } from "../services/permissions";

const DefaultProcessCompo = ({
  nested,
  isView,
  showAddData,
  setShowAddData,
  handleRefresh,
}) => {
  const addDisabled = !!isView;
  const addDeniedReason = getAccessDeniedReason({
    isView: addDisabled,
    action: "create",
  });

  return (
    <Box>
      <Flex justify="flex-end" mb={4}>
        <DisabledWithTooltip isDisabled={addDisabled} label={addDeniedReason}>
          <Button
            leftIcon={showAddData ? <CloseIcon boxSize={2.5} /> : <AddIcon />}
            colorScheme={showAddData ? "red" : "blue"}
            onClick={
              addDisabled ? undefined : () => setShowAddData(!showAddData)
            }
            isDisabled={addDisabled}
            pointerEvents={addDisabled ? "none" : "auto"}
            borderRadius="lg"
            boxShadow="sm"
            _hover={
              addDisabled
                ? undefined
                : { transform: "translateY(-1px)", boxShadow: "md" }
            }
          >
            {showAddData ? "Cancel Add" : "Add Data"}
          </Button>
        </DisabledWithTooltip>
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
