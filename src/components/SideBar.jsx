import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useDispatch } from 'react-redux';

// importing slicer
// import { setProcess } from '../redux/slices/department';

// importing the datas
import ItemsData from '../utils/ItemsData';

function SideBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { DepartmentsListName, SideHeadersList } = ItemsData;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const handleDepartment = (dept) => {
    // dispatch(setProcess(dept.toLowerCase()));
    navigate(`/department/${dept.toLowerCase()}`);
  }

  // ---------- Sidebar when visible ----------
  const SideBarVisible = () => (
    <div className="SideBarVisibleContainer">
      <div className="SideBarHeader">
        <Icon
          icon="mynaui:sidebar-alt"
          className="SideBarIcon IconButtonStyle"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        />
      </div>

      <div className="SideBarList">
        {/* Dashboard */}
        <li
          className="SideBarListItem IconButtonStyle"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </li>

        {/* Side headers */}
        {SideHeadersList.map((item, index) => {
          if (index === 1) {
            // Dropdown for departments
            return (
              <div key={index} className="DropdownContainer">
                <li
                  className="SideBarListItem IconButtonStyle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{item}</span>
                  <span className="DropdownArrow">
                    {dropdownOpen ? '▲' : '▼'}
                  </span>
                </li>

                {dropdownOpen && (
                  <ul className="DropdownMenu">
                    {DepartmentsListName.map((dept, subIndex) => (
                      <li
                        key={subIndex}
                        className="DropdownItem IconButtonStyle"
                        onClick={() => handleDepartment(dept)}
                      >
                        {dept}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          return (
            <li
              key={index}
              className="SideBarListItem IconButtonStyle"
              onClick={() => navigate(`/${item.toLowerCase()}`)}
            >
              {item}
            </li>
          );
        })}
      </div>
    </div>
  );

  // ---------- Sidebar when hidden ----------
  const SideBarHidden = () => {
    const icons = [
      'mynaui:sidebar-alt',
      'duo-icons:dashboard',
      'fluent-mdl2:product-release',
      'mingcute:department-fill',
      'hugeicons:inequality-square-01',
      'icon-park-outline:sales-report',
      'bx:purchase-tag-alt',
      'material-symbols:manufacturing-rounded',
      'mingcute:stock-line',
      'fluent:building-32-regular',
      'hugeicons:master-card',
    ];

    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    return (
      <div className="Hidden">
        {icons.map((icon, idx) => (
          <div
            key={icon}
            style={{ position: 'relative' }}
            onMouseEnter={(e) => {
              if (idx > 0) {
                setHoveredIdx(idx);
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              if (hoveredIdx === idx) {
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <Icon
              icon={icon}
              className="SideBarIcon IconButtonStyle SideBarIconHidden"
              onClick={
                idx === 0
                  ? () => setSidebarVisible(!sidebarVisible)
                  : idx === 1
                  ? () => navigate('/dashboard')
                  : idx === 3
                  ? () => {
                      // open sidebar and dropdown
                      setSidebarVisible(true);
                      setDropdownOpen(true);
                    }
                  : () => {
                      const department = SideHeadersList[idx - 2];
                      navigate(`/${department.toLowerCase()}`);
                    }
              }
            />
          </div>
        ))}

        {hoveredIdx !== null && (
          <span
            className="SidebarTooltip"
            style={{
              top: tooltipPos.y + 15, // below cursor
              left: tooltipPos.x + 15, // right of cursor
            }}
          >
            {hoveredIdx === 1
              ? 'Dashboard'
              : SideHeadersList[hoveredIdx - 2]}
          </span>
        )}
      </div>
    );
  };

  // ---------- Render ----------
  return (
    <div className="SideBarContainer">
      {sidebarVisible ? <SideBarVisible /> : <SideBarHidden />}
    </div>
  );
}

export default SideBar;
