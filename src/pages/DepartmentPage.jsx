import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    value: process.data?.map((row) =>
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

function DepartmentPage() {
  const dispatch = useDispatch();
  const process = useSelector((state) => state.department.process);
  const departments = useSelector((state) => state.department.departments);
  const mainTableData = useSelector((state) => state.department.mainTableData);

  const { loading, handleGetAllDepartments } = Department();
  const { handleGetProcessbyDepartmentId, handleAddData } = Process();

  const { department } = useParams(); // department comes from the URL

  const [selectedProcess, setSelectedProcess] = useState("");
  const [processes, setProcesses] = useState([]); 
  const [showAddData, setShowAddData] = useState(false);

  // Find the current department
  const currentDepartment = departments.find(
    (d) => d.name.toLowerCase() === department?.toLowerCase()
  );

  // Fetch departments initially
  useEffect(() => {
    handleGetAllDepartments();
  }, []);

  // Fetch processes for current department from API
  useEffect(() => {
    const fetchProcesses = async () => {
      if (currentDepartment?._id) {
        const data = await handleGetProcessbyDepartmentId(currentDepartment._id);
        setProcesses(data);
        dispatch(setProcess(data));
      }
    };
    fetchProcesses();
    setSelectedProcess("");
    dispatch(setMainTableData(null));
  }, [currentDepartment, department]);

  // Update selected process object whenever user picks a process
  useEffect(() => {
    dispatch(setMainTableData(null));
    if (selectedProcess && processes.length > 0) {
      const found = processes.find((p) => p.process === selectedProcess);
      dispatch(setMainTableData(found ? transformProcess(found) : null))
    } else {
      dispatch(setMainTableData(null))
    }
  }, [selectedProcess, processes]);


  const handleAddDataSave = async (data) => {
    const processId = mainTableData.id;
    console.log(data, processId);
    const response = await handleAddData({items: data, id: processId});
    dispatch(setMainTableData(transformProcess(response)));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="AppRightContainer DepartmentPageContainer">
      {/* Dropdown for processes */}
      {currentDepartment && (
        <div className="ProcessListContainer">
          <select
            value={selectedProcess}
            className="ProcessSelectContainer"
            onChange={(e) => setSelectedProcess(e.target.value)}
          >
            <option value="">-- Select Process --</option>
            {currentDepartment.process.map((subProc, index) => (
              <option key={index} value={subProc} className="ProcessOptionContainer">
                {subProc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show the selected process name */}
      {selectedProcess && 
        <div className="SelectedProcessContainer">
          <h1>{selectedProcess}</h1>
          <div className="AddDataContainer">
            <button
              className="AddDataButton IconButtonStyle"
              onClick={() => setShowAddData(true)}
            >
              Add Data
            </button>
          </div>
        </div>
      }

      {/* Render AddData modal */}
      {showAddData && (
        <AddData
          headers={mainTableData?.header || []}
          IndicationText="Add New Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}

      {/* Render the FormPage with the matched process */}
      {selectedProcess && 
        <FormPage
          key={selectedProcess}
          process={mainTableData}
        />
      }
      {!selectedProcess && <DepartmentDashboard Content={currentDepartment?.name || ""} />}
    </div>
  );
}

export default DepartmentPage;
