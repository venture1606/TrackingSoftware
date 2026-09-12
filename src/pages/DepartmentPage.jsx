import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Select,
  Box,
  IconButton,
  Tooltip,
  Center,
  Spinner,
  Text as ChakraText,
  VStack,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

// importing components
import FormPage from "../components/FormPage";
import Loading from "../hooks/Loading";
import HeaderSection from "../components/HeaderSection";
import SearchCompo from "../components/SearchCompo";
import FilterCompo from "../components/FilterCompo";
import DepartmentDashboard from "./DepartmentDashboard";

// importing styles
import "../styles/departmentpage.css";

// importing constants & metadata
import ItemsData from "../utils/ItemsData.json";

// importing API's
import { useDepartments } from "../services/Department";
import {
  useProcessesByDepartmentId,
  useProcessById,
  useSearchSelectOptions,
} from "../services/Process";
import { setMainTableData, setProcess } from "../redux/slices/department";
import { usePermissions } from "../services/permissions";

// helper: extract timestamp from MongoDB ObjectId hex string
const getObjectIdTimestamp = (id) => {
  if (!id) return null;
  const strId = String(id);
  if (strId.length < 8) return null;
  try {
    const epochSec = parseInt(strId.substring(0, 8), 16);
    if (!isNaN(epochSec) && epochSec > 0) {
      return epochSec * 1000;
    }
  } catch (e) {
    return null;
  }
  return null;
};

// utility: transform process object → FormPage format
const transformProcess = (process) => {
  if (!process || typeof process !== "object") return null;
  const dataRows = process.data || [];
  return {
    id: process._id,
    process: process.process,
    header: process.headers || [],
    value: dataRows.map((row) =>
      (row.items || []).map((cell) => ({
        key: cell.key,
        value: cell.value,
        process: cell.process || null,
      })),
    ),
    rowIds: dataRows.map((row) => row._id),
    rowDataIds: dataRows.map((row) => row.rowDataId || ""),
    rowMeta: dataRows.map((row) => {
      const fallbackTime = getObjectIdTimestamp(row._id);
      const createdTime = row.createdAt
        ? new Date(row.createdAt).getTime()
        : fallbackTime;
      const updatedTime = row.updatedAt
        ? new Date(row.updatedAt).getTime()
        : (createdTime || fallbackTime);
      return {
        createdAt: createdTime,
        updatedAt: updatedTime,
      };
    }),
  };
};

// Detect headers that represent date values
const detectDateHeaders = (headers = []) => {
  const DateFieldsArray = ItemsData?.DateFieldsArray || [];
  return headers.filter((h) => {
    if (!h) return false;
    const upper = h.trim().toUpperCase();
    return (
      upper.includes("DATE") ||
      upper.includes("DUE") ||
      DateFieldsArray.some((d) => d.trim().toUpperCase() === upper)
    );
  });
};

// Parse various date values into epoch milliseconds
const parseDateValue = (val) => {
  if (val === null || val === undefined || val === "") return null;
  // If it's a number or numeric string (epoch)
  if (typeof val === "number" || /^\d+$/.test(String(val).trim())) {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const ms = num < 10000000000 ? num * 1000 : num;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  // Try string format (e.g., DD/MM/YYYY or ISO)
  if (typeof val === "string") {
    const ddmmyyyy = val.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (ddmmyyyy) {
      const d = new Date(
        Number(ddmmyyyy[3]),
        Number(ddmmyyyy[2]) - 1,
        Number(ddmmyyyy[1]),
      );
      if (!isNaN(d.getTime())) return d.getTime();
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return null;
};

// Function to combine rows by ITEM CODE and GRADE (for Procurement Register)
const combineSimilarRows = (mainTableData) => {
  if (!mainTableData || !mainTableData.value) return mainTableData;

  const rows = mainTableData.value.map((row, idx) => {
    const obj = {};
    row.forEach(({ key, value, process }) => {
      obj[key] = { value, process };
    });
    return {
      obj,
      rowId: mainTableData.rowIds?.[idx],
      rowDataId: mainTableData.rowDataIds?.[idx],
      meta: mainTableData.rowMeta?.[idx] || null,
    };
  });

  const combinedMap = new Map();

  for (const { obj, rowId, rowDataId, meta } of rows) {
    const itemCode = obj["ITEM CODE"]?.value || "";
    const grade = obj["GRADE"]?.value || "";
    const key = `${itemCode}_${grade}`;

    if (!combinedMap.has(key)) {
      combinedMap.set(key, { rowObj: { ...obj }, rowId, rowDataId, meta });
    } else {
      const existing = combinedMap.get(key);
      const existingQty = Number(existing.rowObj["QTY"]?.value || 0);
      const newQty = Number(obj["QTY"]?.value || 0);
      existing.rowObj["QTY"].value = (existingQty + newQty).toString();
      combinedMap.set(key, existing);
    }
  }

  const entries = Array.from(combinedMap.values());
  const mergedValue = entries.map((entry) =>
    Object.keys(entry.rowObj).map((k) => ({
      key: k,
      value: entry.rowObj[k].value,
      process: entry.rowObj[k].process,
    })),
  );

  return {
    ...mainTableData,
    value: mergedValue,
    rowIds: entries.map((e) => e.rowId),
    rowDataIds: entries.map((e) => e.rowDataId),
    rowMeta: entries.map((e) => e.meta),
  };
};

const PageLoader = () => (
  <Center h="100%" w="100%" bg="white" borderRadius="xl">
    <VStack spacing={4}>
      <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
      <ChakraText color="gray.500" fontWeight="medium">
        Loading process data...
      </ChakraText>
    </VStack>
  </Center>
);

function DepartmentPage({ department: propDept, processId: propProcId }) {
  const params = useParams();
  const department = propDept || params.department;
  const processId = propProcId || params.processId;
  const { hasAccessToDepartment, hasAccessToProcess, isViewer, isAdmin } =
    usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (department && !hasAccessToDepartment(department)) {
      navigate("/"); // Redirect unauthorized users
    }
  }, [department, hasAccessToDepartment, navigate]);

  return (
    <Box
      className="AppRightContainer DepartmentPageContainer"
      p={{ base: "10px", md: "20px" }}
      display="flex"
      flexDirection="column"
      gap="20px"
      width="100%"
      overflow="hidden"
      height="100%"
    >
      <Suspense fallback={<Loading />}>
        <DepartmentPageContent
          department={department}
          processId={processId}
          isViewOnly={isViewer}
        />
      </Suspense>
    </Box>
  );
}

const DEPT_URL = process.env.REACT_APP_DEPARTMENT_URL;
const PROC_URL = process.env.REACT_APP_PROCESS_URL;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

function DepartmentPageContent({ department, processId, isViewOnly }) {
  const dispatch = useDispatch();
  const mainTableData = useSelector((state) => state.department.mainTableData);
  const navigate = useNavigate();
  const { hasAccessToProcess, isAdmin } = usePermissions();

  // Suspense-enabled queries
  const { data: departments } = useSuspenseQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get(`${DEPT_URL}/all`);
      return response.data.data;
    },
  });

  useSearchSelectOptions();

  const [selectedProcess, setSelectedProcess] = useState("");
  const [isMerged, setIsMerged] = useState(false);
  const [originalMainTable, setOriginalMainTable] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHeader, setSearchHeader] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    field: "Created On",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  const currentDepartment = departments.find(
    (d) => d.name.toLowerCase() === department?.toLowerCase(),
  );

  const { data: processes } = useSuspenseQuery({
    queryKey: ["processesByDepartment", currentDepartment?._id],
    queryFn: async () => {
      const response = await axios.get(
        `${PROC_URL}/department/${currentDepartment?._id}`,
        getAuthHeaders(),
      );
      return response.data.data;
    },
  });

  useEffect(() => {
    if (processes.length > 0) {
      dispatch(setProcess(processes));
    }
  }, [processes, dispatch]);

  useEffect(() => {
    if (processId && processes.length > 0) {
      const found = processes.find((p) => (p._id || p.id) === processId);
      if (found) {
        // Enforce restriction handle
        if (!isAdmin && !hasAccessToProcess(found.processId)) {
          navigate(`/department/${department}`);
          return;
        }
        setSelectedProcess(found.process);
      }
    } else if (!processId) {
      setSelectedProcess("");
    }
  }, [processId, processes, isAdmin, hasAccessToProcess, department, navigate]);

  const foundProcess = processes.find((p) => p.process === selectedProcess);
  const selectedProcessId = foundProcess
    ? foundProcess._id || foundProcess.id
    : null;

  const { data: processDataRaw, refetch: refetchProcess } = useSuspenseQuery({
    queryKey: ["process", selectedProcessId],
    queryFn: async () => {
      if (!selectedProcessId) return null;
      const response = await axios.get(
        `${PROC_URL}/${selectedProcessId}`,
        getAuthHeaders(),
      );
      return response.data.data;
    },
  });

  const handleRefresh = () => {
    refetchProcess();
  };

  useEffect(() => {
    dispatch(setMainTableData(null));
    setIsMerged(false);
    setOriginalMainTable(null);

    if (processDataRaw) {
      const transformed = transformProcess(processDataRaw);
      dispatch(setMainTableData(transformed));
    }
  }, [processDataRaw, dispatch, selectedProcessId]);

  // Detect date fields in current process headers
  const availableDateFields = useMemo(() => {
    if (!mainTableData?.header) return [];
    return detectDateHeaders(mainTableData.header);
  }, [mainTableData?.header]);

  // Reset search and filters when process changes
  useEffect(() => {
    setSearchTerm("");
    setSearchHeader("all");
    const defaultDateField =
      availableDateFields.length > 0 ? availableDateFields[0] : "Created On";
    setDateFilter({
      field: defaultDateField,
      startDate: "",
      endDate: "",
      isActive: false,
    });
  }, [selectedProcess, availableDateFields]);

  // Combined Search & Date Filtering Pipeline
  const displayedTableData = useMemo(() => {
    if (!mainTableData || !mainTableData.value) return mainTableData;

    const {
      value = [],
      rowIds = [],
      rowDataIds = [],
      rowMeta = [],
    } = mainTableData;
    const trimmedSearch = searchTerm.trim().toLowerCase();

    const startEpoch = dateFilter.startDate
      ? new Date(`${dateFilter.startDate}T00:00:00.000`).getTime()
      : null;
    const endEpoch = dateFilter.endDate
      ? new Date(`${dateFilter.endDate}T23:59:59.999`).getTime()
      : null;
    const isDateFiltering =
      dateFilter.isActive && (startEpoch !== null || endEpoch !== null);

    const filteredIndices = [];

    for (let i = 0; i < value.length; i++) {
      const row = value[i];
      const meta = rowMeta[i] || {};

      // 1. Text Search Filter
      if (trimmedSearch) {
        if (searchHeader === "all") {
          const matchesAny = row.some((cell) => {
            if (cell.value === null || cell.value === undefined) return false;
            if (
              typeof cell.value === "string" ||
              typeof cell.value === "number"
            ) {
              return String(cell.value).toLowerCase().includes(trimmedSearch);
            }
            if (Array.isArray(cell.value)) {
              return cell.value.some((v) =>
                String(v).toLowerCase().includes(trimmedSearch),
              );
            }
            return false;
          });
          if (!matchesAny) continue;
        } else {
          const cell = row.find((c) => c.key === searchHeader);
          if (!cell || cell.value === null || cell.value === undefined) {
            continue;
          }
          let matches = false;
          if (
            typeof cell.value === "string" ||
            typeof cell.value === "number"
          ) {
            matches = String(cell.value).toLowerCase().includes(trimmedSearch);
          } else if (Array.isArray(cell.value)) {
            matches = cell.value.some((v) =>
              String(v).toLowerCase().includes(trimmedSearch),
            );
          }
          if (!matches) continue;
        }
      }

      // 2. Date Filter
      if (isDateFiltering) {
        let rowTime = null;
        if (dateFilter.field === "Created On") {
          rowTime = meta.createdAt || null;
        } else if (dateFilter.field === "Updated On") {
          rowTime = meta.updatedAt || null;
        } else {
          const cell = row.find((c) => c.key === dateFilter.field);
          if (cell && cell.value) {
            rowTime = parseDateValue(cell.value);
          }
        }

        if (rowTime === null) {
          // Row has no valid date for this field
          continue;
        }

        if (startEpoch !== null && rowTime < startEpoch) {
          continue;
        }
        if (endEpoch !== null && rowTime > endEpoch) {
          continue;
        }
      }

      filteredIndices.push(i);
    }

    return {
      ...mainTableData,
      value: filteredIndices.map((i) => value[i]),
      rowIds: filteredIndices.map((i) => rowIds[i]),
      rowDataIds: filteredIndices.map((i) => rowDataIds[i]),
      rowMeta: filteredIndices.map((i) => rowMeta[i]),
    };
  }, [mainTableData, searchTerm, searchHeader, dateFilter]);

  const handleSortMerge = () => {
    if (!mainTableData) return;

    if (!isMerged) {
      setOriginalMainTable(mainTableData);
      const merged = combineSimilarRows(mainTableData);
      dispatch(setMainTableData(merged));
      setIsMerged(true);
    } else {
      if (originalMainTable) {
        dispatch(setMainTableData(originalMainTable));
      }
      setIsMerged(false);
    }
  };

  // Export current filtered table records as CSV
  const handleExportCSV = () => {
    if (
      !displayedTableData ||
      !displayedTableData.header ||
      !displayedTableData.value
    ) {
      return;
    }
    const headers = displayedTableData.header;
    const rows = displayedTableData.value.map((row) =>
      headers
        .map((h) => {
          const cell = row.find((c) => c.key === h);
          let val = cell ? cell.value : "";
          if (Array.isArray(val)) {
            val = val.join("; ");
          } else if (typeof val === "object" && val !== null) {
            val = JSON.stringify(val);
          }
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows,
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const safeProcessName = (selectedProcess || "process").replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `${safeProcessName}_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <HeaderSection
        title={
          selectedProcess || `${currentDepartment?.name || department} Analysis`
        }
        description={
          selectedProcess
            ? `Manage and track ${selectedProcess.toLowerCase()} specifications and statuses.`
            : `Overview and department-level analysis for ${department}.`
        }
      >
        {selectedProcess && (
          <>
            {/* Header selection dropdown beside Search component */}
            <Box width={{ base: "100%", sm: "140px" }} flexShrink={0}>
              <Select
                size="sm"
                fontSize="xs"
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
                value={searchHeader}
                onChange={(e) => setSearchHeader(e.target.value)}
              >
                <option value="all">All Headers</option>
                {(mainTableData?.header || []).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Search component with targeted header placeholder */}
            <SearchCompo
              placeholder={
                searchHeader === "all"
                  ? "Search records..."
                  : `Search ${searchHeader}...`
              }
              value={searchTerm}
              onSearch={(term) => setSearchTerm(term)}
              width={{ base: "100%", sm: "170px", md: "190px" }}
            />

            {/* Date range filter component */}
            <FilterCompo
              dateFields={availableDateFields}
              currentFilter={dateFilter}
              onFilterChange={(newFilter) => setDateFilter(newFilter)}
            />

            {/* Export data button */}
            <Tooltip label="Export Filtered Data (CSV)">
              <IconButton
                icon={<DownloadIcon />}
                size="sm"
                variant="solid"
                bg="white"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
                _hover={{
                  bg: "gray.50",
                  boxShadow: "sm",
                  borderColor: "gray.300",
                  color: "blue.500",
                }}
                transition="all 0.2s"
                aria-label="Export Data"
                onClick={handleExportCSV}
              />
            </Tooltip>
          </>
        )}

        <Box width={{ base: "100%", sm: "165px" }} flexShrink={0}>
          <Select
            placeholder="Select Process"
            value={selectedProcess}
            onChange={(e) => {
              const val = e.target.value;
              setIsAdding(false); // Reset adding state when process changes
              if (val === "") {
                navigate(`/department/${department}`);
              } else {
                const processObj = processes.find((p) => p.process === val);
                if (processObj) {
                  navigate(
                    `/department/${department}/${processObj._id || processObj.id}`,
                  );
                } else {
                  navigate(`/department/${department}`);
                }
              }
            }}
            bg="white"
            borderColor="gray.300"
            size="sm"
            fontSize="xs"
            borderRadius="md"
          >
            {processes
              .filter((p) => isAdmin || hasAccessToProcess(p.processId))
              .map((p, index) => (
                <option key={index} value={p.process}>
                  {p.process}
                </option>
              ))}
          </Select>
        </Box>

        {selectedProcess && !isViewOnly && (
          <Button
            leftIcon={<Icon icon="material-symbols:add-rounded" />}
            onClick={() => setIsAdding(!isAdding)}
            colorScheme={isAdding ? "red" : "blue"}
            variant="solid"
            size="sm"
            flexShrink={0}
          >
            {isAdding ? "Cancel Add" : "Add Data"}
          </Button>
        )}

        {selectedProcess === "Procurement Register" && (
          <Button
            onClick={handleSortMerge}
            colorScheme={isMerged ? "red" : "purple"}
            variant="solid"
            size="sm"
            flexShrink={0}
          >
            {isMerged ? "Undo Sort" : "Sort Data"}
          </Button>
        )}
      </HeaderSection>

      <Box flex="1" overflowY="auto" display="flex" flexDirection="column">
        {selectedProcess ? (
          <FormPage
            key={selectedProcess}
            process={displayedTableData}
            isView={isViewOnly || selectedProcess === "Products"}
            refresh={handleRefresh}
            isAddingNewRow={isAdding}
            setIsAddingNewRow={setIsAdding}
          />
        ) : (
          <DepartmentDashboard Content={department} />
        )}
      </Box>
    </>
  );
}

export default DepartmentPage;
