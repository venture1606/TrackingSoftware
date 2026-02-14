import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
    Button, 
    Select, 
    Box, 
    IconButton,
    Tooltip
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

// importing components
import FormPage from "../components/FormPage";
import Loading from "../hooks/Loading";
import HeaderSection from "../components/HeaderSection";
import SearchCompo from "../components/SearchCompo";
import FilterCompo from "../components/FilterCompo";

// importing styles
import "../styles/departmentpage.css";

// importing API's
import { useDepartments } from "../services/Department";
import { 
  useProcessesByDepartmentId, 
  useProcessById, 
  useSearchSelectOptions 
} from "../services/Process";
import { setMainTableData, setProcess } from "../redux/slices/department";

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
        }))
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
    }))
  );

  return {
    ...mainTableData,
    value: mergedValue,
  };
};

function DepartmentPage({ department: propDept, processId: propProcId }) {
  // Use params from router if props not provided (depending on usage)
  const params = useParams();
  const department = propDept || params.department;
  const processId = propProcId || params.processId;

  const dispatch = useDispatch();
  const mainTableData = useSelector((state) => state.department.mainTableData);

  const { data: departments = [], isLoading: loadingDepts } = useDepartments();
  useSearchSelectOptions(); 

  const navigate = useNavigate();

  const [selectedProcess, setSelectedProcess] = useState("");
  const [isMerged, setIsMerged] = useState(false);
  const [originalMainTable, setOriginalMainTable] = useState(null);

  const currentDepartment = departments.find(
    (d) => d.name.toLowerCase() === department?.toLowerCase()
  );

  const { 
      data: processes = [], 
      isLoading: loadingProcesses 
  } = useProcessesByDepartmentId(currentDepartment?._id);

  useEffect(() => {
      if (processes.length > 0) {
          dispatch(setProcess(processes));
      }
  }, [processes, dispatch]);

  useEffect(() => {
    if (processId && processes.length > 0) {
      const found = processes.find((p) => (p._id || p.id) === processId);
      if (found) {
        setSelectedProcess(found.process);
      }
    } else if (!processId) {
      setSelectedProcess("");
    }
  }, [processId, processes]);

  const foundProcess = processes.find((p) => p.process === selectedProcess);
  const selectedProcessId = foundProcess ? (foundProcess._id || foundProcess.id) : null;

  const { 
      data: processDataRaw, 
      isLoading: loadingSingleProcess 
  } = useProcessById(selectedProcessId);

  useEffect(() => {
    dispatch(setMainTableData(null));
    setIsMerged(false);
    setOriginalMainTable(null);

    if (processDataRaw) {
        const transformed = transformProcess(processDataRaw);
        dispatch(setMainTableData(transformed));
    }
  }, [processDataRaw, dispatch]);

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

  if (loadingDepts || loadingProcesses || loadingSingleProcess) {
    return <Loading />;
  }

  return (
    <div className="AppRightContainer DepartmentPageContainer" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", width: "100%", overflow: "hidden" }}>
      
      <HeaderSection 
          title={selectedProcess || `${currentDepartment?.name || department} Analysis`} 
          description={selectedProcess ? `Manage and track ${selectedProcess.toLowerCase()} specifications and statuses.` : `Overview and department-level analysis for ${department}.`}
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
                        color: "blue.500"
                    }}
                    transition="all 0.2s"
                    aria-label="Export Data"
                />
              </Tooltip>
            </>
          )}

          <Box width="180px">
              <Select
                  placeholder="Select Process"
                  value={selectedProcess}
                  onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                          navigate(`/department/${department}`);
                      } else {
                          const processObj = processes.find((p) => p.process === val);
                          if (processObj) {
                              navigate(`/department/${department}/${processObj._id || processObj.id}`);
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
                  {currentDepartment?.process.map((subProc, index) => (
                      <option key={index} value={subProc}>{subProc}</option>
                  ))}
              </Select>
          </Box>

          {selectedProcess === "Procurement Register" && (
            <Button
              onClick={handleSortMerge}
              colorScheme={isMerged ? "red" : "purple"}
              variant="solid"
            >
              {isMerged ? "Undo Sort" : "Sort Data"}
            </Button>
          )}
      </HeaderSection>
      
      <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
        {selectedProcess && (
           <FormPage
             key={selectedProcess}
             process={mainTableData}
             isView={selectedProcess === "Products"}
           />
        )}
      </Box>
    </div>
  );
}

export default DepartmentPage;
