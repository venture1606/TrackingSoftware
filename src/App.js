import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

// Importing the hooks
import Indication from './hooks/Indication';
import { isTokenValid } from './utils/authUtils';

// importing components
import Header from './components/Header';
import SideBar from './components/SideBar';

// importing the pages
import Login from './pages/Login';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import DepartmentPage from './pages/DepartmentPage';
import Products from './pages/Products';
import ShowProduct from './pages/ShowProduct';
import Qms from './pages/Qms';
import SalesOrder from './pages/SalesOrder';
import Purchase from './pages/Purchase';
import Manufacturing from './pages/Manufacturing';
import Stock from './pages/Stock';
import Development from './pages/Development';
import Master from './pages/Master';

// importing API's
import { setLogin, setLogout } from './redux/slices/auth';

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector(state => state.auth.isLoggedIn); // This should be replaced with actual authentication logic
  let message = useSelector(state => state.common.message);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const loggedInFlag = localStorage.getItem("isLoggedIn") === "true";

    if (storedToken && loggedInFlag) {
      if (!isTokenValid(storedToken)) {
        dispatch(setLogout());
        navigate('/login');
      } else {
        dispatch(setLogin(true)); // maintain login state
      }
    } else {
      dispatch(setLogout());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return (
    <div className='AppContainer'>
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
              <Route path="/admin" element={<Admin />} />
              <Route path="/quality management system" element={<Qms />} />
              <Route path="/sales order" element={<SalesOrder />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/manufacturing" element={<Manufacturing />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/new development" element={<Development />} />
              <Route path="/master" element={<Master />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ShowProduct />} />
            </Routes>
          </div>
        </div>
        : 
        <Login />
      }
      <Indication message={message}/>
    </div>
  );
}

// Wrapper component to extract :department and pass as data prop
function DepartmentPageWrapper() {
  const { department } = useParams();
  return <DepartmentPage department={department} />;
}

export default App;
