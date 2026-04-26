import React, { useEffect, useState, Suspense } from "react";
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

// importing API's
import { useDepartments } from "../services/Department";
import {
  useProcessesByDepartmentId,
  useProcessById,
  useSearchSelectOptions,
} from "../services/Process";
import { setMainTableData, setProcess } from "../redux/slices/department";
import { usePermissions } from "../services/permissions";

// utility: transform process object → FormPage format
const transformProcess = (process) => {
  if (!process || typeof process !== "object") return null;
  return {
    id: process._id,
    process: process.process,
    header: process.headers,
    value:
      process.data?.map((row) =>
        row.items.map((cell) => ({
          key: cell.key,
          value: cell.value,
          process: cell.process || null,
        })),
      ) || [],
    rowIds: process.data?.map((row) => row._id) || [],
    rowDataIds: process.data?.map((row) => row.rowDataId) || [],
  };
};

// ✅ Function to combine rows by ITEM CODE and GRADE
const combineSimilarRows = (mainTableData) => {
  if (!mainTableData || !mainTableData.value) return mainTableData;

  const rows = mainTableData.value.map((row) => {
    const obj = {};
    row.forEach(({ key, value, process }) => {
      obj[key] = { value, process };
    });
    return obj;
  });

  const combinedMap = new Map();

  for (const row of rows) {
    const itemCode = row["ITEM CODE"]?.value || "";
    const grade = row["GRADE"]?.value || "";
    const key = `${itemCode}_${grade}`;

    if (!combinedMap.has(key)) {
      combinedMap.set(key, { ...row });
    } else {
      const existing = combinedMap.get(key);
      const existingQty = Number(existing["QTY"]?.value || 0);
      const newQty = Number(row["QTY"]?.value || 0);
      existing["QTY"].value = (existingQty + newQty).toString();
      combinedMap.set(key, existing);
    }
  }

  const mergedValue = Array.from(combinedMap.values()).map((rowObj) =>
    Object.keys(rowObj).map((k) => ({
      key: k,
      value: rowObj[k].value,
      process: rowObj[k].process,
    })),
  );

  return {
    ...mainTableData,
    value: mergedValue,
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
  }, [processId, processes]);

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
            <SearchCompo
              placeholder="Search records..."
              onSearch={(term) => console.log("Searching for:", term)}
            />

            <FilterCompo
              filters={["Completed", "Pending", "In Progress"]}
              onFilterChange={(val) => console.log("Filter:", val)}
            />

            <Tooltip label="Export Data">
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
              />
            </Tooltip>
          </>
        )}

        <Box width={{ base: "100%", sm: "180px" }}>
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
          >
            {isMerged ? "Undo Sort" : "Sort Data"}
          </Button>
        )}
      </HeaderSection>

      <Box flex="1" overflowY="auto" display="flex" flexDirection="column">
        {selectedProcess ? (
          <FormPage
            key={selectedProcess}
            process={mainTableData}
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
