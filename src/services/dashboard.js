import axios from "axios";

const API_URL = process.env.REACT_APP_PROCESS_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Main Dashboard
export const getMainDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
  return response.data;
};

// Design Dashboards
export const getNPDRegister = async () => {
  const response = await axios.get(`${API_URL}/design/npdRegister`, getAuthHeaders());
  return response.data;
};

export const getProductsDashboard = async () => {
  const response = await axios.get(`${API_URL}/design/productsDashboard`, getAuthHeaders());
  return response.data;
};

export const getRevisionControl = async () => {
  const response = await axios.get(`${API_URL}/design/revisionControl`, getAuthHeaders());
  return response.data;
};

// Manufacturing Dashboards
export const getOEEDashboard = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/manufacturing/oeeDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getProductionReport = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/manufacturing/productionReportDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getInhouseDashboard = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/manufacturing/inhouseDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

// Quality Dashboards
export const getCustomerQuality = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/quality/customercomplientRegister`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getIncomingInspection = async () => {
  const response = await axios.get(`${API_URL}/quality/incomingInspection`, getAuthHeaders());
  return response.data;
};

export const getQualityAudits = async () => {
  const response = await axios.get(`${API_URL}/quality/qualityAuditDashboard`, getAuthHeaders());
  return response.data;
};

export const getContinuousImprovement = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/quality/continuousImprovement`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

// HR Dashboards
export const getEmployeeOverhead = async (department) => {
  const response = await axios.get(`${API_URL}/hr/overheadDashboard`, {
    ...getAuthHeaders(),
    params: { department },
  });
  return response.data;
};

export const getEmployeeAttendance = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/hr/attendanceDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

// Purchase Dashboards
export const getProcurementDashboard = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/purchase/procurementDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getInwardDashboard = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/purchase/inwardDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

// Sales Dashboards
export const getSalesCustomerCount = async () => {
  const response = await axios.get(`${API_URL}/sales/customerCount`, getAuthHeaders());
  return response.data;
};

export const getSalesTrend = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/sales/salesTrend`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getQuotationStatus = async () => {
  const response = await axios.get(`${API_URL}/sales/quotationStatus`, getAuthHeaders());
  return response.data;
};

export const getSalesOrderDetails = async () => {
  const response = await axios.get(`${API_URL}/sales/orderDetails`, getAuthHeaders());
  return response.data;
};

export const getSalesPaymentAndDelivery = async () => {
  const response = await axios.get(`${API_URL}/sales/paymentAndDelivery`, getAuthHeaders());
  return response.data;
};

export const getSalesTrailStatus = async () => {
  const response = await axios.get(`${API_URL}/sales/trailStatus`, getAuthHeaders());
  return response.data;
};

export const getMainNPDRegister = async () => {
  const response = await axios.get(`${API_URL}/main/design/npdRegister`, getAuthHeaders());
  return response.data;
};

export const getMainProductList = async () => {
  const response = await axios.get(`${API_URL}/main/design/productList`, getAuthHeaders());
  return response.data;
};

export const getMainRevisionControl = async () => {
  const response = await axios.get(`${API_URL}/main/design/revisionControl`, getAuthHeaders());
  return response.data;
};

export const getMainOrderList = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/main/sales/orderList`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getMainDockets = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/main/sales/dockets`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const getProductSuccess = async () => {
  const response = await axios.get(`${API_URL}/design/productSuccess`, getAuthHeaders());
  return response.data;
};

export const getSettingsDashboard = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/manufacturing/settingsDashboard`, {
    ...getAuthHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};