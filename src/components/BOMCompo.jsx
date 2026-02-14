import { Box, Text, Flex, Badge, Stack, Heading, Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import FormPage from "./FormPage";
import AddData from "../hooks/AddData";

const BOMCompo = ({
  nested,
  isView,
  bomProducts,
  showAddData,
  setShowAddData,
  handleAddDataSave,
  showBOMAddData,
  setShowBOMAddData,
  handleAddDataSaveForBOM,
}) => {
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
            <Badge colorScheme="purple" mb={2} px={3} borderRadius="full">Main Structure</Badge>
            <Heading size="md" color="gray.800">Bill of Materials - Primary</Heading>
          </Box>
          {!isView && (
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              colorScheme="purple"
              onClick={() => setShowAddData(true)}
              borderRadius="lg"
            >
              Add Main Data
            </Button>
          )}
        </Flex>
        
        <Box 
          overflowX="auto" 
          p={2} 
          bg="gray.50" 
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
        >
          <FormPage process={nested} isView={isView} />
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
            <Badge colorScheme="green" mb={2} px={3} borderRadius="full">Inventory Links</Badge>
            <Heading size="md" color="gray.800">Products Data</Heading>
          </Box>
          {!isView && (
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              colorScheme="green"
              onClick={() => setShowBOMAddData(true)}
              borderRadius="lg"
            >
              Add Product Entry
            </Button>
          )}
        </Flex>

        {bomProducts ? (
          <Box 
            overflowX="auto" 
            p={2} 
            bg="gray.50" 
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <FormPage
              process={bomProducts}
              isView={isView}
              currentBomId={nested?.rowDataId}
            />
          </Box>
        ) : (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            py={10} 
            bg="gray.50" 
            borderRadius="xl" 
            border="1px dashed" 
            borderColor="gray.300"
          >
            <Text color="gray.400" fontStyle="italic">No linked product data found for this BOM</Text>
          </Flex>
        )}
      </Box>

      {/* Modals */}
      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Main Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}
      {showBOMAddData && (
        <AddData
          headers={bomProducts?.header || []}
          IndicationText="Add New Product Entry"
          isOpen={showBOMAddData}
          onClose={() => setShowBOMAddData(false)}
          onSave={handleAddDataSaveForBOM}
          currentBomId={nested?.rowDataId}
        />
      )}
    </Stack>
  );
};

export default BOMCompo;
