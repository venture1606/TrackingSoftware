import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// importing components
import FormPage from "../components/FormPage";

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
    process: process.process,
    header: process.headers, // ✅ API uses `headers` not `header`
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

  const { handleGetAllDepartments } = Department();
  const { handleGetProcessbyDepartmentId } = Process();

  const { department } = useParams(); // department comes from the URL

  const [selectedProcess, setSelectedProcess] = useState("");
  const [selectedProcessObject, setSelectedProcessObject] = useState(null);
  const [processes, setProcesses] = useState([]); // store fetched processes

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
      <h1>{selectedProcess}</h1>

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
