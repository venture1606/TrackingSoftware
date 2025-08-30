import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';

// Importing the hooks
import Indication from './hooks/Indication';

// importing components
import Header from './components/Header';
import SideBar from './components/SideBar';

// importing the pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DepartmentPage from './pages/DepartmentPage';
import Products from './pages/Products';


function App() {

  const isLoggedIn = useSelector(state => state.auth.isLoggedIn); // This should be replaced with actual authentication logic
  let message = useSelector(state => state.common.message); 

  return (
    <Router className='AppContainer'>
      {isLoggedIn 
        ? 
        <div className='AppEntireContainer'>
          <Header />
          <div className='AppContentContainer'>
            <SideBar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/department/:department"
                element={
                  <DepartmentPageWrapper />
                }
              />
              <Route path="/products" element={<Products />} />
            </Routes>
          </div>
        </div>
        : 
        <Login />
      }
      <Indication message={message}/>
    </Router>
  );
}

// Wrapper component to extract :department and pass as data prop
function DepartmentPageWrapper() {
  const { department } = useParams();
  return <DepartmentPage department={department} />;
}

export default App;
