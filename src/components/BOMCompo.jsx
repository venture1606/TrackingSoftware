import { Box, Text, Flex, Badge, Stack, Heading, Button } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import FormPage from "./FormPage";
import DisabledWithTooltip from "./DisabledWithTooltip";
import { getAccessDeniedReason } from "../services/permissions";

const BOMCompo = ({
  nested,
  isView,
  bomProducts,
  showAddData,
  setShowAddData,
  showBOMAddData,
  setShowBOMAddData,
  handleRefresh,
  handleRefreshBomProducts,
}) => {
  const addDisabled = !!isView;
  const addDeniedReason = getAccessDeniedReason({
    isView: addDisabled,
    action: "create",
  });

  return (
    <Stack spacing={10}>
      {/* Main BOM Section */}
      <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex align="center" justify="space-between" mb={6}>
          <Box>
            <Badge colorScheme="purple" mb={2} px={3} borderRadius="full">
              Main Structure
            </Badge>
            <Heading size="md" color="gray.800">
              Bill of Materials - Primary
            </Heading>
          </Box>
          <DisabledWithTooltip isDisabled={addDisabled} label={addDeniedReason}>
            <Button
              leftIcon={showAddData ? <CloseIcon boxSize={2.5} /> : <AddIcon />}
              size="sm"
              colorScheme={showAddData ? "red" : "purple"}
              onClick={
                addDisabled ? undefined : () => setShowAddData(!showAddData)
              }
              isDisabled={addDisabled}
              pointerEvents={addDisabled ? "none" : "auto"}
              borderRadius="lg"
            >
              {showAddData ? "Cancel Add" : "Add Main Data"}
            </Button>
          </DisabledWithTooltip>
        </Flex>

        <Box
          p={2}
          bg="gray.50"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
          overflow="visible"
        >
          <FormPage
            process={nested}
            isView={isView}
            isDefault={!!nested?.rowDataId}
            rowDataId={nested?.rowDataId}
            isAddingNewRow={showAddData}
            setIsAddingNewRow={setShowAddData}
            refresh={handleRefresh}
          />
        </Box>
      </Box>

      {/* BOM Products Section */}
      <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex align="center" justify="space-between" mb={6}>
          <Box>
            <Badge colorScheme="green" mb={2} px={3} borderRadius="full">
              Inventory Links
            </Badge>
            <Heading size="md" color="gray.800">
              Products Data
            </Heading>
          </Box>
          {bomProducts && (
            <DisabledWithTooltip
              isDisabled={addDisabled}
              label={addDeniedReason}
            >
              <Button
                leftIcon={
                  showBOMAddData ? <CloseIcon boxSize={2.5} /> : <AddIcon />
                }
                size="sm"
                colorScheme={showBOMAddData ? "red" : "green"}
                onClick={
                  addDisabled
                    ? undefined
                    : () => setShowBOMAddData(!showBOMAddData)
                }
                isDisabled={addDisabled}
                pointerEvents={addDisabled ? "none" : "auto"}
                borderRadius="lg"
              >
                {showBOMAddData ? "Cancel Add" : "Add Product Entry"}
              </Button>
            </DisabledWithTooltip>
          )}
        </Flex>

        {bomProducts ? (
          <Box
            p={2}
            bg="gray.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            overflow="visible"
          >
            <FormPage
              process={bomProducts}
              isView={isView}
              currentBomId={nested?.rowDataId}
              isDefault={!!bomProducts?.rowDataId}
              rowDataId={bomProducts?.rowDataId}
              isAddingNewRow={showBOMAddData}
              setIsAddingNewRow={setShowBOMAddData}
              refresh={handleRefreshBomProducts}
            />
          </Box>
        ) : (
          <Text color="gray.500" fontSize="sm">
            No linked products process available.
          </Text>
        )}
      </Box>
    </Stack>
  );
};

export default BOMCompo;
