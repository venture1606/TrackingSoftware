import React, { useEffect, Suspense, lazy } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";

// Importing the hooks
import Indication from "./hooks/Indication";
import Loading from "./hooks/Loading";
import { isTokenValid } from "./utils/authUtils";

// importing components
import Header from "./components/Header";
import SideBar from "./components/SideBar";

// importing API's
import { setLogin, setLogout } from "./redux/slices/auth";

// Lazy loading pages for performance
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DepartmentPage = lazy(() => import("./pages/DepartmentPage"));
const Products = lazy(() => import("./pages/Products"));
const ShowProduct = lazy(() => import("./pages/ShowProduct"));
const Qms = lazy(() => import("./pages/Qms"));
const SalesOrder = lazy(() => import("./pages/SalesOrder"));
const Purchase = lazy(() => import("./pages/Purchase"));
const Manufacturing = lazy(() => import("./pages/Manufacturing"));
const Stock = lazy(() => import("./pages/Stock"));
const Development = lazy(() => import("./pages/Development"));
const Master = lazy(() => import("./pages/Master"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // This should be replaced with actual authentication logic
  let message = useSelector((state) => state.common.message);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const loggedInFlag = localStorage.getItem("isLoggedIn") === "true";

    if (storedToken && loggedInFlag) {
      if (!isTokenValid(storedToken)) {
        dispatch(setLogout());
        navigate("/login");
      } else {
        dispatch(setLogin(true)); // maintain login state
      }
    } else {
      dispatch(setLogout());
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return (
    <div className="AppContainer">
      {isLoggedIn ? (
        <div className="AppEntireContainer">
          <Header />
          <div className="AppContentContainer">
            <SideBar />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/department/:department"
                  element={<DepartmentPageWrapper />}
                />
                <Route
                  path="/department/:department/:processId"
                  element={<DepartmentPageWrapper />}
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
            </Suspense>
          </div>
        </div>
      ) : (
        <Login />
      )}
      <Indication message={message} />
    </div>
  );
}

// Wrapper component to extract :department and pass as data prop
function DepartmentPageWrapper() {
  const { department, processId } = useParams();
  return <DepartmentPage department={department} processId={processId} />;
}

export default App;
