import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// importing components
import FormPage from "../components/FormPage";
import Loading from "../hooks/Loading";
import FormDialog from "../hooks/FormDialog";
import AddData from "../hooks/AddData";

// importing styles
import "../styles/departmentpage.css";

// importing the datas
import ItemsData from "../utils/ItemsData.json";

// importing API's
import Department from "../services/Department";
import Process from "../services/Process";

// utility: transform process object → FormPage format
const transformProcess = (process) => {
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
  };
};

function DepartmentPage() {
  const navigate = useNavigate();
  const departments = useSelector((state) => state.department.departments);

  const { loading, handleGetAllDepartments } = Department();
  const { handleGetProcessbyDepartmentId, handleAddData  } = Process();

  const { department } = useParams(); // department comes from the URL

  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedProcessObject, setSelectedProcessObject] = useState(null);
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
      }
    };
    fetchProcesses();
    setSelectedProcess("");
    setSelectedProcessObject(null);
  }, [currentDepartment, department]);

  // Update selected process object whenever user picks a process
  useEffect(() => {
    setSelectedProcessObject(null);
    if (selectedProcess && processes.length > 0) {
      const found = processes.find((p) => p.process === selectedProcess);
      setSelectedProcessObject(found ? transformProcess(found) : null);
    } else {
      setSelectedProcessObject(null);
    }
  }, [selectedProcess, processes]);

  const handleAddDataSave = (data) => {
    const processId = selectedProcessObject.id;
    handleAddData({items: data, id: processId});
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
          headers={selectedProcessObject?.header || []}
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
          process={selectedProcessObject}
        />
      }
    </div>
  );
}

export default DepartmentPage;
