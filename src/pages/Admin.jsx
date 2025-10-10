import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

// Importing API's
import Auth from '../services/Auth'
import Process from '../services/Process'
import Department from '../services/Department'

// importing Loading Component
import Loading from '../hooks/Loading'

// import styles
import '../styles/admin.css'
import AdminTableView from '../hooks/AdminTableView'

function Admin() {
  const Details = ['User List', 'Process List', 'Department List', 'Product List']
  const { handleGetAllUser } = Auth();
  const { handlegetAllProcess } = Process();
  const { handleGetAllDepartments } = Department();

  const allUsers = useSelector((state) => state.auth.allUsers);
  const allProcesses = useSelector((state) => state.department.allProcesses);
  const departments = useSelector((state) => state.department.departments);

  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    if (activeIndex === 0) {
      handleGetAllUser();
    } else if (activeIndex === 1) {
      handlegetAllProcess();
    } else if (activeIndex === 2) {
      handleGetAllDepartments();
    }
  }, [activeIndex]);

  // ✅ Format User List safely
  const formattedUsers = useMemo(() => {
    if (!Array.isArray(allUsers) || allUsers.length === 0) return [];
    return allUsers.map((user, index) => [
      { key: "SL.NO", value: index + 1 },
      { key: "USER NAME", value: user.userName },
      { key: "EMPLOYEE ID", value: user.employeeId },
      { key: "ROLE", value: user.role },
      { key: "EMAIL", value: user.email },
      { key: "ACCESS", value: user.access?.join(", ") || "-" },
      { key: "DATE", value: new Date(user.date).toLocaleDateString() },
    ]);
  }, [allUsers]);

  // ✅ Format Department List safely
  const formattedDepartments = useMemo(() => {
    if (!Array.isArray(departments) || departments.length === 0) return [];
    return departments.map((department, index) => ({
      id: department._id,
      name: department.name,
      process: department.process,
      updatedBy: department.updatedBy?.userName || "N/A",
      createdAt: new Date(department.createdAt).toLocaleString(),
      updatedAt: new Date(department.updatedAt).toLocaleString(),
    }));
  }, [departments]);

  const renderContent = () => {
    switch (activeIndex) {
      case 0:
        return (
          <div>
            {allUsers ? (
              formattedUsers.length > 0 ? (
                <AdminTableView DetailsArray={formattedUsers} TableContent={'users'} />
              ) : (
                <p>No users found</p>
              )
            ) : (
              <Loading />
            )}
          </div>
        )
      
      case 1:
        return ( 
          <div>
            {Array.isArray(allProcesses) && allProcesses.length > 0 ? (
              <AdminTableView DetailsArray={allProcesses} TableContent={'process'} />
            ) : (
              <p>No process found</p>
            )}
          </div>
        )

      case 2:
        return (
          <div>
            {departments ? (
              formattedDepartments.length > 0 ? (
                <AdminTableView DetailsArray={formattedDepartments} TableContent={'department'} />
              ) : (
                <p>No department found</p>
              )
            ) : (
              <Loading />
            )}
          </div>
        )

      case 3:
        return (
          <div>Product List</div>
        )

      default:
        return (
          <div>Select any</div>
        )
    }
  }

  return (
    <div className='AppRightContainer AdminContainer'>
      <div className='APIDetailsButtonContainer'>
        {Details.map((item, index) => (
          <button
            key={index}
            className={`APIDetailsButton ${activeIndex === index ? 'APIDetailsButtonActive' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            { item }
          </button>
        ))}
      </div>

      <div className='APIDetailsContainer'>
        {renderContent()}
      </div>
    </div>
  )
}

export default Admin
