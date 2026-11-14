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
} from "@chakra-ui/react";

const DetailingProductCompo = ({ bomIds, detailingProducts, ShownArray }) => {
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

  const visibleHeaders = (detailingProducts?.headers || []).filter((h) =>
    ShownArray.includes(h),
  );

  return (
    <Box
      className="DetailingTableContainer"
      w="100%"
      minW="max-content"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      bg="gray.50"
      p={1}
      overflow="visible"
    >
      <Table
        size="xs"
        variant="simple"
        bg="white"
        borderRadius="sm"
        sx={{ tableLayout: "auto" }}
      >
        <Thead bg="gray.100">
          <Tr>
            {visibleHeaders.map((header, hIdx) => (
              <Th
                key={hIdx}
                fontSize="10px"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wider"
                py={2}
                px={2}
                textAlign="center"
                whiteSpace="nowrap"
                width="1%"
              >
                {header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {bomRows.map((bomRow, idx) => (
            <Tr key={idx} _hover={{ bg: "gray.50" }}>
              {visibleHeaders.map((header, hIdx) => {
                const item = bomRow.items.find((i) => i.key === header);
                return (
                  <Td
                    key={hIdx}
                    fontSize="11px"
                    color="gray.700"
                    fontWeight="medium"
                    py={2}
                    px={2}
                    textAlign="center"
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    whiteSpace="nowrap"
                  >
                    {item?.value || "-"}
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
