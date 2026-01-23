import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// importing components
import FormPage from "../components/FormPage";
import Loading from "../hooks/Loading";
import AddData from "../hooks/AddData";
import DepartmentDashboard from "./DepartmentDashboard";

// importing styles
import "../styles/departmentpage.css";

// importing the datas
import ItemsData from "../utils/ItemsData.json";

// importing API's
import Department from "../services/Department";
import Process from "../services/Process";
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

function DepartmentPage({ department, processId }) {
  const dispatch = useDispatch();
  const process = useSelector((state) => state.department.process);
  const departments = useSelector((state) => state.department.departments);
  const mainTableData = useSelector((state) => state.department.mainTableData);

  const { loading, handleGetAllDepartments } = Department();
  const {
    handleGetProcessbyDepartmentId,
    handleSearchSelectOptions,
    handleAddData,
    handleGetProcessByProcessId,
    loading: processLoading,
  } = Process();

  const navigate = useNavigate();

  const [selectedProcess, setSelectedProcess] = useState("");
  const [processes, setProcesses] = useState([]);
  const [showAddData, setShowAddData] = useState(false);
  const [isMerged, setIsMerged] = useState(false);
  const [originalMainTable, setOriginalMainTable] = useState(null);

  const currentDepartment = departments.find(
    (d) => d.name.toLowerCase() === department?.toLowerCase()
  );

  useEffect(() => {
    handleGetAllDepartments();
    handleSearchSelectOptions();
  }, []);

  useEffect(() => {
    const fetchProcesses = async () => {
      if (currentDepartment?._id) {
        const data = await handleGetProcessbyDepartmentId(
          currentDepartment._id
        );
        setProcesses(data);
        dispatch(setProcess(data));
      }
    };
    fetchProcesses();
    setSelectedProcess("");
    dispatch(setMainTableData(null));
  }, [currentDepartment, department]);
  
  // Sync selectedProcess with URL processId
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

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setMainTableData(null));
      setIsMerged(false);
      setOriginalMainTable(null);

      if (selectedProcess && processes.length > 0) {
        const found = processes.find((p) => p.process === selectedProcess);
        if (found) {
          const data = await handleGetProcessByProcessId(found._id || found.id);
          dispatch(setMainTableData(transformProcess(data)));
        }
      } else {
        dispatch(setMainTableData(null));
      }
    };
    fetchData();
  }, [selectedProcess, processes]);

  const handleAddDataSave = async (data) => {
    const processId = mainTableData.id;
    const response = await handleAddData({ items: data, id: processId });
    dispatch(setMainTableData(transformProcess(response)));
  };

  // ✅ Toggle (Merge / Restore) handler
  const handleSortMerge = () => {
    if (!mainTableData) return;

    if (!isMerged) {
      // 🔹 Store original before merging
      setOriginalMainTable(mainTableData);

      // 🔹 Merge and update Redux
      const merged = combineSimilarRows(mainTableData);
      dispatch(setMainTableData(merged));
      setIsMerged(true);

    } else {
      // 🔹 Restore the original main table
      if (originalMainTable) {
        dispatch(setMainTableData(originalMainTable));
      }
      setIsMerged(false);
    }
  };

  if (loading || processLoading) {
    return <Loading />;
  }

  return (
    <div className="AppRightContainer DepartmentPageContainer">
      {currentDepartment && (
        <div className="ProcessListContainer">
          <select
            value={selectedProcess}
            className="ProcessSelectContainer"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                navigate(`/department/${department}`);
              } else {
                const found = processes.find((p) => p.process === val);
                if (found) {
                  navigate(`/department/${department}/${found._id || found.id}`);
                }
              }
            }}
          >
            <option value="">-- Select Process --</option>
            {currentDepartment.process.map((subProc, index) => (
              <option
                key={index}
                value={subProc}
                className="ProcessOptionContainer"
              >
                {subProc}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProcess && (
        <div className="SelectedProcessContainer">
          <h1>{selectedProcess}</h1>
          <div className="AddDataContainer">
            <button
              className="AddDataButton IconButtonStyle"
              onClick={() => setShowAddData(true)}
            >
              Add Data
            </button>
            {selectedProcess === "Procurement Register" && (
              <button
                className="AddDataButton IconButtonStyle"
                onClick={handleSortMerge}
              >
                {isMerged ? "Undo Sort" : "Sort"}
              </button>
            )}
          </div>
        </div>
      )}

      {showAddData && (
        <AddData
          headers={mainTableData?.header || []}
          IndicationText="Add New Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}

      {selectedProcess && (
        <FormPage
          key={selectedProcess}
          process={mainTableData}
          isView={selectedProcess === "Products"}
        />
      )}

      {!selectedProcess && (
        <DepartmentDashboard Content={currentDepartment?.name || ""} />
      )}
    </div>
  );
}

export default DepartmentPage;
