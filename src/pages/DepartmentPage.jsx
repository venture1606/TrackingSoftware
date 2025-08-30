import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// importing components
import FormPage from "../components/FormPage";

// importing styles
import "../styles/departmentpage.css";

// importing the datas
import ItemsData from "../utils/ItemsData.json";

// utility: transform DesignProcess object → FormPage format
const transformProcess = (process) => {
  return {
    column: process.header,
    value: process.data.map((row) =>
      row.map((cell) => ({
        key: cell.key,
        val: cell.value,
      }))
    ),
  };
};

function DepartmentPage() {
  const navigate = useNavigate();
  const reduxProcess = useSelector((state) => state.department.process);

  const { DepartmentsListName, SubDepartments, DesignProcess } = ItemsData;
  const { department } = useParams(); // department comes from the URL

  const [selectedProcess, setSelectedProcess] = useState("");

  // Find the sub-department list for the current department
  const currentDepartment = SubDepartments.find(
    (d) => d.key.toLowerCase() === department?.toLowerCase()
  );

  // state to hold the selected process object
  const [selectedProcessObject, setSelectedProcessObject] = useState(null);

  useEffect(() => {
    switch (department?.toLowerCase()) {
      case "design":
        if (selectedProcess) {
          const found = DesignProcess.find(
            (p) => p.process === selectedProcess
          );
          if (found) {
            setSelectedProcessObject(transformProcess(found));
          } else {
            setSelectedProcessObject(null);
          }
        }
        break;

      default:
        setSelectedProcessObject(null);
    }
  }, [department, selectedProcess, DesignProcess]);

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
            {currentDepartment.value.map((subProc, index) => (
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

      {/* Show the selected process name */}
      <h1>{selectedProcess}</h1>

      {/* Render the FormPage with the matched process */}
      {selectedProcess && <FormPage process={selectedProcessObject} />}
    </div>
  );
}

export default DepartmentPage;
