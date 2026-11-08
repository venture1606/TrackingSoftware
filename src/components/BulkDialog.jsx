import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Select,
  Flex,
  Stack,
  Text,
  Checkbox,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  useBulkConfig,
  useBulkFetch,
  useBulkUpsert,
} from "../services/Process";
import ItemsData from "../utils/ItemsData.json";

const { DateFieldsArray = [], ProcessDateFields = {} } = ItemsData;

const isDateHeader = (key, processId) => {
  if (!key) return false;
  const lower = key.trim().toLowerCase();
  if (DateFieldsArray.some((h) => h.trim().toLowerCase() === lower)) return true;
  const scoped = ProcessDateFields?.[processId] || [];
  return scoped.some((h) => h.trim().toLowerCase() === lower);
};

const toEpochIfDate = (key, value, processId) => {
  if (!value || !isDateHeader(key, processId)) return value;
  if (/^\d+$/.test(String(value).trim())) return String(value);
  const epoch = new Date(value).getTime();
  return Number.isNaN(epoch) ? value : String(epoch);
};

let tempIdCounter = 0;
const nextTempId = () => `tmp-${Date.now()}-${++tempIdCounter}`;

function BulkDialog({ isOpen, onClose, processId, mongoProcessId, onSuccess }) {
  const { data: config, isLoading: configLoading, isError } = useBulkConfig(
    processId,
    isOpen,
  );
  const fetchMutation = useBulkFetch();
  const upsertMutation = useBulkUpsert();

  const [singleEntry, setSingleEntry] = useState({});
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 500;

  const multiHeaders = config?.multiEntryHeaders || [];
  const parentDisplayHeaders = config?.parentDisplayHeaders || [];

  useEffect(() => {
    if (!config || !isOpen) return;
    const se = {};
    (config.singleEntryHeaders || []).forEach((h) => {
      se[h] = "";
    });
    setSingleEntry(se);
    setFilters({ ...(config.defaultFilters || {}) });
    setRows([]);
    setSelected(new Set());
    setPage(1);
    setTotal(0);

    if (config.mode === "blankMultiCreate") {
      const id = nextTempId();
      const empty = {};
      (config.multiEntryHeaders || []).forEach((h) => {
        empty[h] = "";
      });
      setRows([{ tempId: id, items: empty }]);
      setSelected(new Set([id]));
    }
  }, [config, isOpen]);

  const supportsFetch = !!(config?.filterHeaders || []).length;

  const runFetch = useCallback(
    async (pageNum = 1) => {
      if (!config || !supportsFetch) return;

      // Prefer ENQUIRY NO from filter; fall back to shared field for Quotation edit
      const mergedFilters = { ...filters };
      (config.filterHeaders || []).forEach((key) => {
        if (
          (mergedFilters[key] === undefined ||
            mergedFilters[key] === null ||
            String(mergedFilters[key]).trim() === "") &&
          singleEntry[key]
        ) {
          mergedFilters[key] = singleEntry[key];
        }
      });

      if (config.filtersOptional) {
        const hasAny = (config.filterHeaders || []).some((key) =>
          String(mergedFilters[key] ?? "").trim(),
        );
        if (!hasAny) {
          alert(
            `Enter at least one filter (${(config.filterHeaders || []).join(", ")}) before Fetch`,
          );
          return;
        }
      } else {
        for (const key of config.filterHeaders || []) {
          if (!String(mergedFilters[key] ?? "").trim()) {
            alert(`Enter ${key} in Filters (or Shared fields) before Fetch`);
            return;
          }
        }
      }

      const result = await fetchMutation.mutateAsync({
        processId,
        filters: mergedFilters,
        page: pageNum,
        limit,
      });

      const multiKeys =
        config.multiEntryHeaders || config.multipleEntryHeaders || [];

      const fetched = (result.rows || []).map((r) => {
        const items = {};
        multiKeys.forEach((h) => {
          items[h] = r.items?.[h] ?? "";
        });
        // Keep parent display fields for docket mode
        (config.parentDisplayHeaders || []).forEach((h) => {
          items[h] = r.items?.[h] ?? items[h] ?? "";
        });
        return {
          tempId: String(r.rowId || r.sourceRowId),
          rowId: r.rowId || null,
          sourceRowId: r.sourceRowId || r.rowId || null,
          items,
        };
      });

      setRows(fetched);
      setSelected(new Set(fetched.map((r) => r.tempId)));
      setTotal(result.total || 0);
      setPage(result.page || pageNum);

      // Prefill shared fields from first fetched row (bulk edit)
      if (result.singleEntryFromFetch) {
        setSingleEntry((prev) => ({
          ...prev,
          ...result.singleEntryFromFetch,
        }));
        setFilters((prev) => {
          const next = { ...prev };
          (config.filterHeaders || []).forEach((key) => {
            if (result.singleEntryFromFetch[key] != null) {
              next[key] = result.singleEntryFromFetch[key];
            }
          });
          return next;
        });
      }
    },
    [config, fetchMutation, filters, processId, singleEntry, supportsFetch],
  );

  useEffect(() => {
    // Auto-fetch only when defaultFilters exist (e.g. Dockets OPEN).
    // Inward (filtersOptional, no defaultFilters) waits for user filters + Fetch.
    if (
      isOpen &&
      config?.mode === "parentFetchCreate" &&
      config?.defaultFilters &&
      Object.keys(config.defaultFilters).length > 0
    ) {
      runFetch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config?.mode, config?.defaultFilters]);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && selected.size < rows.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.tempId)));
  };

  const toggleOne = (tempId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };

  const updateRowItem = (tempId, key, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === tempId
          ? { ...r, items: { ...r.items, [key]: value } }
          : r,
      ),
    );
  };

  const addBlankRow = () => {
    const id = nextTempId();
    const empty = {};
    multiHeaders.forEach((h) => {
      empty[h] = "";
    });
    setRows((prev) => [...prev, { tempId: id, items: empty }]);
    setSelected((prev) => new Set([...prev, id]));
  };

  const removeRow = (tempId) => {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!config) return;
    const checkedRows = rows.filter((r) => selected.has(r.tempId));
    if (checkedRows.length === 0) {
      alert("Select at least one row");
      return;
    }

    const normalizedSingle = {};
    Object.entries(singleEntry).forEach(([k, v]) => {
      normalizedSingle[k] = toEpochIfDate(k, v, processId);
    });

    const payloadRows = checkedRows.map((r) => {
      const items = {};
      Object.entries(r.items || {}).forEach(([k, v]) => {
        items[k] = toEpochIfDate(k, v, processId);
      });
      return {
        rowId: r.rowId || null,
        sourceRowId: r.sourceRowId || null,
        items,
      };
    });

    const result = await upsertMutation.mutateAsync({
      processId,
      singleEntry: normalizedSingle,
      rows: payloadRows,
    });

    if (onSuccess) onSuccess(result);
    onClose();
  };

  const tableColumns = useMemo(() => {
    if (!config) return [];
    if (config.mode === "parentFetchCreate") {
      return [...parentDisplayHeaders, ...multiHeaders];
    }
    return multiHeaders;
  }, [config, parentDisplayHeaders, multiHeaders]);

  const renderFieldInput = (key, value, onChange) => {
    if (isDateHeader(key, processId)) {
      let display = value || "";
      if (display && /^\d+$/.test(String(display))) {
        const d = new Date(Number(display));
        if (!Number.isNaN(d.getTime())) display = d.toISOString().slice(0, 10);
      }
      return (
        <Input
          type="date"
          size="sm"
          value={display}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    if (key === "QL STATUS" || key === "ORDER STATUS") {
      return (
        <Select
          size="sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select"
        >
          {key === "QL STATUS" ? (
            <>
              <option value="WAITING FOR QUOTE">WAITING FOR QUOTE</option>
              <option value="WAITING FOR ORDER">WAITING FOR ORDER</option>
              <option value="ORDER">ORDER</option>
            </>
          ) : (
            <>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
            </>
          )}
        </Select>
      );
    }
    return (
      <Input
        size="sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={key}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="95vw">
        <ModalHeader>
          Bulk Insert / Edit
          {config?.processName ? ` — ${config.processName}` : ""}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {configLoading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : isError || !config ? (
            <Text color="red.500">Bulk entry is not configured for this process.</Text>
          ) : (
            <Stack spacing={5}>
              {config.instructions ? (
                <Box
                  bg="blue.50"
                  borderWidth="1px"
                  borderColor="blue.100"
                  borderRadius="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="sm" color="blue.800">
                    {config.instructions}
                  </Text>
                </Box>
              ) : null}
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Shared fields (applied to every selected row)
                </Text>
                <Flex wrap="wrap" gap={3}>
                  {(config.singleEntryHeaders || []).map((key) => (
                    <Box key={key} minW="180px" flex="1">
                      <Text fontSize="xs" mb={1} color="gray.600">
                        {key}
                      </Text>
                      {renderFieldInput(key, singleEntry[key], (val) =>
                        setSingleEntry((prev) => ({ ...prev, [key]: val })),
                      )}
                    </Box>
                  ))}
                </Flex>
              </Box>

              {supportsFetch && (
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Filters — fetch existing records to bulk edit
                  </Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    {config.mode === "parentFetchCreate"
                      ? config.filtersOptional
                        ? `Fill any of ${(config.filterHeaders || []).join(" / ")}, then Fetch parent rows. Only filled filters are applied.${
                            config.excludeParentValues?.["INSPECTION-STATUS"]
                              ? " Rows already marked Done are excluded."
                              : ""
                          }`
                        : "Adjust filters and Fetch parent orders."
                      : config.filtersOptional
                        ? `Fill any of ${(config.filterHeaders || []).join(" / ")}, then Fetch. Only filled filters are applied. Unchecked rows are skipped; Add Row creates new lines.`
                        : "Enter required filter(s) and Fetch to load matching rows for edit. Unchecked rows are skipped. Add Row still creates new lines."}
                  </Text>
                  <Flex gap={3} align="flex-end" wrap="wrap">
                    {(config.filterHeaders || []).map((key) => (
                      <Box key={key} minW="160px">
                        <Text fontSize="xs" mb={1} color="gray.600">
                          {key}
                        </Text>
                        {renderFieldInput(key, filters[key] ?? "", (val) => {
                          setFilters((prev) => ({ ...prev, [key]: val }));
                          // Keep shared ENQUIRY NO in sync for Quotation
                          if ((config.singleEntryHeaders || []).includes(key)) {
                            setSingleEntry((prev) => ({ ...prev, [key]: val }));
                          }
                        })}
                      </Box>
                    ))}
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => runFetch(1)}
                      isLoading={fetchMutation.isPending}
                    >
                      Fetch
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRows([]);
                        setSelected(new Set());
                        setTotal(0);
                        if (config.mode === "blankMultiCreate") {
                          const id = nextTempId();
                          const empty = {};
                          multiHeaders.forEach((h) => {
                            empty[h] = "";
                          });
                          setRows([{ tempId: id, items: empty }]);
                          setSelected(new Set([id]));
                        }
                      }}
                    >
                      Clear / New
                    </Button>
                    <Text fontSize="sm" color="gray.500">
                      {total} matching · page {page}
                    </Text>
                  </Flex>
                </Box>
              )}

              <Divider />

              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">
                  Rows ({selected.size}/{rows.length} selected)
                </Text>
                {config.mode === "blankMultiCreate" && (
                  <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    onClick={addBlankRow}
                    colorScheme="blue"
                    variant="outline"
                  >
                    Add Row
                  </Button>
                )}
              </Flex>

              <Box overflowX="auto" maxH="420px" overflowY="auto" borderWidth="1px" borderRadius="md">
                <Table size="sm" variant="simple">
                  <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
                    <Tr>
                      <Th width="40px">
                        <Checkbox
                          isChecked={allSelected}
                          isIndeterminate={someSelected}
                          onChange={toggleAll}
                        />
                      </Th>
                      {tableColumns.map((h) => (
                        <Th key={h} whiteSpace="nowrap">
                          {h}
                        </Th>
                      ))}
                      {config.mode === "blankMultiCreate" && <Th width="50px" />}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={tableColumns.length + 2}>
                          <Text color="gray.500" py={4} textAlign="center">
                            {config.mode === "parentFetchCreate"
                              ? config.filtersOptional
                                ? "Fill any filter and Fetch to load procurement rows."
                                : "No rows fetched. Adjust filters and Fetch."
                              : config.filtersOptional
                                ? "Fill any filter and Fetch to edit, or Add Row to create new."
                                : "Enter required filter(s) and Fetch to edit, or Add Row to create new."}
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      rows.map((row) => {
                        const isParentCol = (h) =>
                          config.mode === "parentFetchCreate" &&
                          parentDisplayHeaders.includes(h);
                        return (
                          <Tr key={row.tempId}>
                            <Td>
                              <Checkbox
                                isChecked={selected.has(row.tempId)}
                                onChange={() => toggleOne(row.tempId)}
                              />
                            </Td>
                            {tableColumns.map((h) => (
                              <Td key={h} minW="120px">
                                {isParentCol(h) ? (
                                  <Text fontSize="sm">{row.items?.[h] ?? ""}</Text>
                                ) : (
                                  renderFieldInput(h, row.items?.[h], (val) =>
                                    updateRowItem(row.tempId, h, val),
                                  )
                                )}
                              </Td>
                            ))}
                            {config.mode === "blankMultiCreate" && (
                              <Td>
                                <IconButton
                                  aria-label="Remove row"
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeRow(row.tempId)}
                                />
                              </Td>
                            )}
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>

              {supportsFetch && total > limit && (
                <Flex gap={2} justify="flex-end">
                  <Button
                    size="sm"
                    isDisabled={page <= 1 || fetchMutation.isPending}
                    onClick={() => runFetch(page - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    isDisabled={page * limit >= total || fetchMutation.isPending}
                    onClick={() => runFetch(page + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={upsertMutation.isPending}
            isDisabled={!config || selected.size === 0}
          >
            Submit ({selected.size})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default BulkDialog;
