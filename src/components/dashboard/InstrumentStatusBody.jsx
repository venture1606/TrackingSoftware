import React from "react";
import { VStack, HStack, Box, Text } from "@chakra-ui/react";
import TableChart from "./TableChart";
import { formatEpochDate, dueLabel } from "../../utils/dateUtils";

const Tile = ({ label, value, color }) => (
  <Box
    bg={`${color}.50`}
    px={4}
    py={2}
    borderRadius="lg"
    border="1px solid"
    borderColor={`${color}.100`}
    minW="110px"
  >
    <Text fontSize="xs" fontWeight="bold" color={`${color}.600`} textTransform="uppercase">
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="black" color={`${color}.700`} lineHeight={1}>
      {value || 0}
    </Text>
  </Box>
);

/**
 * Body of the "Instrument Status" card (main + Quality dashboards).
 * `data` = response of GET /main/quality/calibrationdue.
 */
const InstrumentStatusBody = ({ data }) => {
  const days = data?.dueSoonDays || 10;
  const rows = (data?.openRecords || []).slice(0, 5).map((row) => {
    const items = row.items || [];
    const value = (key) => items.find((i) => i.key === key)?.value;
    const due = value("DUE");
    return {
      instrument: row.instrumentName || "-",
      done: formatEpochDate(value("DONE") || value("DATE")),
      due: due ? formatEpochDate(due) : "-",
      status: row.overdue
        ? dueLabel(due)
        : row.dueSoon
          ? dueLabel(due)
          : row.noCertificate
            ? "No certificate"
            : "-",
    };
  });

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <HStack spacing={4} justify="start" pb={2} flexWrap="wrap">
        <Tile label="Overdue" value={data?.overdueCount} color="red" />
        <Tile label={`Due in ${days} days`} value={data?.dueSoonCount} color="orange" />
        <Tile label="No certificate" value={data?.noCertificateCount} color="purple" />
      </HStack>
      {data?.notRecordedCount > 0 && (
        <Text fontSize="xs" color="gray.500">
          {data.notRecordedCount} active instrument{data.notRecordedCount === 1 ? " has" : "s have"} no
          calibration record yet.
        </Text>
      )}
      <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
        {rows.length ? (
          <TableChart
            headers={["INSTRUMENT", "LAST CALIBRATED", "NEXT DUE", "STATUS"]}
            data={rows}
            keys={["instrument", "done", "due", "status"]}
          />
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            No instruments need attention right now.
          </Text>
        )}
      </Box>
    </VStack>
  );
};

export default InstrumentStatusBody;
