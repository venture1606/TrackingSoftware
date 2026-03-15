import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
} from "@chakra-ui/react";
import TruncatedText from "./TruncatedText";

const DetailingProductCompo = ({ bomIds, detailingProducts, ShownArray }) => {
  // Gather all matching BOM rows
  const bomRows = bomIds
    ?.map((bomId) => detailingProducts?.data?.find((d) => d._id === bomId))
    .filter(Boolean);

  if (!bomRows || bomRows.length === 0) {
    return (
      <Box py={2}>
        <Text fontSize="xs" color="gray.400" fontStyle="italic">
          No detailing data available
        </Text>
      </Box>
    );
  }

  return (
    <Box 
      className="DetailingTableContainer" 
      maxH="210px" 
      w="100%"
      overflowY="auto" 
      borderRadius="md" 
      border="1px solid" 
      borderColor="gray.200"
      bg="gray.50"
      p={1}
    >
      <Table size="xs" variant="simple" bg="white" borderRadius="sm" w="100%">
        <Thead bg="gray.100" position="sticky" top={0} zIndex={1}>
          <Tr>
            {detailingProducts?.headers?.map(
              (header, hIdx) =>
                ShownArray.includes(header) && (
                  <Th
                    key={hIdx}
                    fontSize="10px"
                    color="gray.600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={2}
                    textAlign="center"
                  >
                    {header}
                  </Th>
                )
            )}
          </Tr>
        </Thead>
        <Tbody>
          {bomRows.map((bomRow, idx) => (
            <Tr key={idx} _hover={{ bg: "gray.50" }}>
              {detailingProducts?.headers?.map((header, hIdx) => {
                if (!ShownArray.includes(header)) return null;
                const item = bomRow.items.find((i) => i.key === header);
                return (
                  <Td
                    key={hIdx}
                    fontSize="11px"
                    color="gray.700"
                    fontWeight="medium"
                    py={2}
                    textAlign="center"
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                     <TruncatedText text={item?.value || "-"} limit={15} />
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DetailingProductCompo;
