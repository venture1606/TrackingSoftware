import React, { useState, Suspense, lazy, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react";

// Individual dashboard service functions
import {
  getDashboardProductionPlan,
  getDashboardDispatch,
  getDashboardQuotationList,
  getDashboardOrderList,
  getDashboardStock,
} from "../services/dashboard";

// Other separate dashboard APIs
import {
  getMainNPDRegister,
  getMainProductList,
  getMainRevisionControl,
  getOEEDashboard,
  getInhouseDashboard,
  // Quality department APIs
  getCustomerQuality,
  getIncomingInspection,
  getQualityAudits,
  getContinuousImprovement,
  getCalibrationDueDashboard,
  getProcessControlPlanDashboard,
  getCertificateRenewalDashboard,
  // Purchase department APIs
  getProcurementDashboard,
  getInwardDashboard,
  // Sales department APIs
  getMainDockets,
  // Manufacturing
  getProductionReport,
  getSettingsDashboard,
  getQuotationStatus,
  getSalesOrderDetails,
  // Design
  getProductSuccess,
} from "../services/dashboard";

// importing common components
import StatCard from "../components/dashboard/StatCard";
import ChartSkeleton from "../components/dashboard/ChartSkeleton";
import DashboardCardFilter from "../components/dashboard/DashboardCardFilter";

// importing lazy-loaded chart components
const BarChart = lazy(() => import("../components/dashboard/BarChart"));
const AreaChart = lazy(() => import("../components/dashboard/AreaChart"));
const TableChart = lazy(() => import("../components/dashboard/TableChart"));
const GaugeChart = lazy(() => import("../components/dashboard/GaugeChart"));

function Dashboard() {
  // State to hold global filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    salesPerson: "",
    location: "",
  });

  // ── Individual section states ─────────────────────────────────────────────
  const [productionPlan, setProductionPlan] = useState({});
  const [dispatch, setDispatch] = useState({ totalFiltered: 0, data: [], totalQuantity: 0, graphChart: { monthWise: [], yearWise: [] } });
  const [quotationList, setQuotationList] = useState({ totalFiltered: 0, data: [] });
  const [orderListData, setOrderListData] = useState(null);
  const [procurementDeptData, setProcurementDeptData] = useState(null);
  const [inwardDeptData, setInwardDeptData] = useState(null);
  const [stockData, setStockData] = useState({ totalFiltered: 0, data: [], totalStockQty: 0 });
  const [quotationStatusData, setQuotationStatusData] = useState(null);
  const [salesOrderData, setSalesOrderData] = useState(null);

  // Pre-existing separate API states
  const [npdMainData, setNpdMainData] = useState([]);
  const [productListData, setProductListData] = useState({ totalProducts: 0, totalBOMs: 0 });
  const [revisionControlData, setRevisionControlData] = useState([]);
  const [oeeData, setOeeData] = useState(null);
  const [inHouseData, setInHouseData] = useState(null);

  // ── Department-specific states (from DepartmentDashboard) ─────────────────
  const [prodReportData, setProdReportData] = useState([]);        // OEE Trend
  const [custQualData, setCustQualData] = useState(null);          // Customer Complaints
  const [incomingInspData, setIncomingInspData] = useState(null);  // Incoming Inspection
  const [qualityAuditsData, setQualityAuditsData] = useState(null);// Quality Audits
  const [continuousImpData, setContinuousImpData] = useState(null);// Continuous Improvement
  const [docketsData, setDocketsData] = useState(null);            // Customer Payment Status
  const [productSuccessData, setProductSuccessData] = useState(null);
  const [settingsDeptData, setSettingsDeptData] = useState(null);
  const [calibrationDeptData, setCalibrationDeptData] = useState(null);
  const [pcpDeptData, setPcpDeptData] = useState(null);
  const [certsDeptData, setCertsDeptData] = useState(null);

  // ── Helper: build timestamp params ───────────────────────────────────────
  const getTimestamps = React.useCallback(() => ({
    startTimestamp: filters.startDate ? new Date(filters.startDate).getTime() : undefined,
    endTimestamp: filters.endDate ? new Date(filters.endDate).getTime() : undefined,
  }), [filters.startDate, filters.endDate]);

  // ── Fetch: Production Plan ────────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getDashboardProductionPlan(startTimestamp, endTimestamp)
      .then((res) => setProductionPlan(res.data || {}))
      .catch(() => setProductionPlan({}));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Dispatch ───────────────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getDashboardDispatch(startTimestamp, endTimestamp)
      .then((res) => setDispatch(res.data || { totalFiltered: 0, data: [], totalQuantity: 0, graphChart: { monthWise: [], yearWise: [] } }))
      .catch(() => setDispatch({ totalFiltered: 0, data: [], totalQuantity: 0, graphChart: { monthWise: [], yearWise: [] } }));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Quotation List ─────────────────────────────────────────────────
  useEffect(() => {
    getDashboardQuotationList()
      .then((res) => setQuotationList(res.data || { totalFiltered: 0, data: [] }))
      .catch(() => setQuotationList({ totalFiltered: 0, data: [] }));
  }, []);

  // ── Fetch: Order List ─────────────────────────────────────────────────────
  useEffect(() => {
    getDashboardOrderList()
      .then((res) => setOrderListData(res.data?.data || null))
      .catch(() => setOrderListData(null));
  }, []);

  // ── Fetch: Stock ──────────────────────────────────────────────────────────
  useEffect(() => {
    getDashboardStock()
      .then((res) => setStockData(res.data || { totalFiltered: 0, data: [], totalStockQty: 0 }))
      .catch(() => setStockData({ totalFiltered: 0, data: [], totalStockQty: 0 }));
  }, []);

  // ── Fetch: NPD Main Register ──────────────────────────────────────────────
  useEffect(() => {
    getMainNPDRegister()
      .then((res) => setNpdMainData(res.data || []))
      .catch(() => setNpdMainData([]));
  }, []);

  // ── Fetch: Product List ───────────────────────────────────────────────────
  useEffect(() => {
    getMainProductList()
      .then((res) => setProductListData({ totalProducts: res.totalProducts || 0, totalBOMs: res.totalBOMs || 0 }))
      .catch(() => setProductListData({ totalProducts: 0, totalBOMs: 0 }));
  }, []);

  // ── Fetch: Revision Control ───────────────────────────────────────────────
  useEffect(() => {
    getMainRevisionControl()
      .then((res) => setRevisionControlData(res.data || []))
      .catch(() => setRevisionControlData([]));
  }, []);

  // ── Fetch: OEE ───────────────────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getOEEDashboard(startTimestamp, endTimestamp)
      .then((res) => setOeeData(res.data || null))
      .catch(() => setOeeData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: In House Quality ───────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getInhouseDashboard(startTimestamp, endTimestamp)
      .then((res) => setInHouseData(res.data || null))
      .catch(() => setInHouseData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: OEE Trend (Production Report) ─────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getProductionReport(startTimestamp, endTimestamp)
      .then((res) => setProdReportData(res?.data?.data || res?.data || []))
      .catch(() => setProdReportData([]));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Customer Quality (Customer Complaints dept) ────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getCustomerQuality(startTimestamp, endTimestamp)
      .then((res) => setCustQualData(res?.data?.data || res?.data || null))
      .catch(() => setCustQualData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Incoming Inspection (dept) ────────────────────────────────────
  useEffect(() => {
    getIncomingInspection()
      .then((res) => setIncomingInspData(res?.data?.data || res?.data || null))
      .catch(() => setIncomingInspData(null));
  }, []);

  // ── Fetch: Quality Audits ─────────────────────────────────────────────────
  useEffect(() => {
    getQualityAudits()
      .then((res) => setQualityAuditsData(res?.data?.data || res?.data || null))
      .catch(() => setQualityAuditsData(null));
  }, []);

  // ── Fetch: Continuous Improvement ────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getContinuousImprovement(startTimestamp, endTimestamp)
      .then((res) => setContinuousImpData(res?.data?.data || res?.data || null))
      .catch(() => setContinuousImpData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Procurement Dept ───────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getProcurementDashboard(startTimestamp, endTimestamp)
      .then((res) => setProcurementDeptData(res?.data?.data || res?.data || null))
      .catch(() => setProcurementDeptData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Inward Dept ────────────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getInwardDashboard(startTimestamp, endTimestamp)
      .then((res) => setInwardDeptData(res?.data?.data || res?.data || null))
      .catch(() => setInwardDeptData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Quotation Status (dept) ───────────────────────────────────────
  useEffect(() => {
    getQuotationStatus()
      .then((res) => setQuotationStatusData(res || null))
      .catch(() => setQuotationStatusData(null));
  }, []);

  // ── Fetch: Sales Order Details ────────────────────────────────────────────
  useEffect(() => {
    getSalesOrderDetails()
      .then((res) => setSalesOrderData(res || null))
      .catch(() => setSalesOrderData(null));
  }, []);

  // ── Fetch: Dockets (Customer Payment) ────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getMainDockets(startTimestamp, endTimestamp)
      .then((res) => setDocketsData(res?.data?.data || res?.data || null))
      .catch(() => setDocketsData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Product Success Rate ──────────────────────────────────────────
  useEffect(() => {
    getProductSuccess()
      .then((res) => setProductSuccessData(res || null))
      .catch(() => setProductSuccessData(null));
  }, []);

  // ── Fetch: Settings Dashboard ─────────────────────────────────────────────
  useEffect(() => {
    const { startTimestamp, endTimestamp } = getTimestamps();
    getSettingsDashboard(startTimestamp, endTimestamp)
      .then((res) => setSettingsDeptData(res?.data || null))
      .catch(() => setSettingsDeptData(null));
  }, [filters.startDate, filters.endDate, getTimestamps]);

  // ── Fetch: Calibration Due ───────────────────────────────────────────────
  useEffect(() => {
    getCalibrationDueDashboard()
      .then((res) => setCalibrationDeptData(res?.data || null))
      .catch(() => setCalibrationDeptData(null));
  }, []);

  // ── Fetch: Process Control Plan ──────────────────────────────────────────
  useEffect(() => {
    getProcessControlPlanDashboard()
      .then((res) => setPcpDeptData(res?.data || null))
      .catch(() => setPcpDeptData(null));
  }, []);

  // ── Fetch: Certificate Renewal ───────────────────────────────────────────
  useEffect(() => {
    getCertificateRenewalDashboard()
      .then((res) => setCertsDeptData(res?.data || null))
      .catch(() => setCertsDeptData(null));
  }, []);

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleApplyFilter = (section) => (filterValues) => {
    setFilters((prev) => ({
      ...prev,
      startDate: filterValues.startDate || prev.startDate,
      endDate: filterValues.endDate || prev.endDate,
      ...(filterValues.fields || {}),
    }));
  };

  const hasFilter = () => !!(filters.startDate || filters.endDate || filters.salesPerson || filters.location);

  // ── Helper: format table data ─────────────────────────────────────────────
  const formatProcessTableData = (data, mapping) => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => {
      let formatted = {};
      Object.entries(mapping).forEach(([uiKey, backendKey]) => {
        const item = row.items?.find((i) => i.key === backendKey);
        formatted[uiKey] = item ? item.value : "-";
      });
      return formatted;
    });
  };

  return (
    <Box
      className="AppRightContainer DashboardContainer"
      bg="gray.25"
      p={{ base: 4, md: 6 }}
    >
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="gray.800">
            Operational Dashboard
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Performance tracking and production metrics
          </Text>
        </VStack>
      </Flex>

      <VStack spacing={8} align="stretch" mb={8}>

        {/* ── 1. NPD Register ── */}
        <Flex wrap="wrap" gap={6}>
          <StatCard
            title="NPD Register"
            count={npdMainData.length}
            minWidth="380px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("npd")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["FROM", "DATE", "PART", "PROTO", "VALIDATION", "MASTER", "DUE"]}
                  data={npdMainData.map((row) => ({
                    from: row.from,
                    date: row.date,
                    part: row.part,
                    proto: row.proto,
                    validation: row.validation,
                    master: row.master,
                    due: row.due,
                  }))}
                  keys={["from", "date", "part", "proto", "validation", "master", "due"]}
                  colorKeys={["proto", "validation", "master"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* ── 2. Product Success Rate ── */}
          <StatCard
            title="Product Success Rate"
            count={`${((productSuccessData?.data?.avgSuccessRate || 0) * 100).toFixed(2)}%`}
            minWidth="300px"
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack align="center" justify="center" h="100%" py={2}>
                <Box
                  boxSize="100px"
                  borderRadius="full"
                  border="8px solid"
                  borderColor="green.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="green.50"
                >
                  <Text fontSize="xl" fontWeight="black" color="green.600">
                    {((productSuccessData?.data?.avgSuccessRate || 0) * 100).toFixed(1)}%
                  </Text>
                </Box>
                <Text color="gray.500" fontWeight="bold" mt={2} fontSize="xs">
                  Average Performance
                </Text>
              </VStack>
            </Suspense>
          </StatCard>

          {/* ── 3. Overall Products Summary ── */}
          <StatCard
            title="Overall Products Summary"
            minH="150px"
            minWidth="280px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("products")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <HStack w="100%" h="100%" justify="space-evenly" align="center" py={2}>
                <VStack bg="blue.50" p={4} borderRadius="xl" minW="110px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="blue.600" lineHeight={1}>
                    {productListData.totalProducts}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="blue.400" textTransform="uppercase" textAlign="center">
                    Total<br />Products
                  </Text>
                </VStack>
                <VStack bg="purple.50" p={4} borderRadius="xl" minW="110px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="purple.600" lineHeight={1}>
                    {productListData.totalBOMs}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="purple.400" textTransform="uppercase" textAlign="center">
                    Total<br />BOMs
                  </Text>
                </VStack>
              </HStack>
            </Suspense>
          </StatCard>

          {/* ── 4. Revision Control ── */}
          <StatCard
            title="Revision Control"
            count={revisionControlData.length}
            minWidth="450px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("revisionControl")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["DATE", "PART", "STATUS", "DUE"]}
                  data={revisionControlData.map((row) => ({
                    date: row.date && !isNaN(row.date) ? new Date(Number(row.date)).toLocaleDateString() : row.date || "-",
                    part: row.part,
                    status: row.status,
                    due: row.due,
                  }))}
                  keys={["date", "part", "status", "due"]}
                  colorKeys={["status"]}
                />
              </Box>
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── 5. Average OEE  ──  6. OEE Trend ── */}
        <Flex wrap="wrap" gap={6}>
          <StatCard
            title="Average OEE"
            count={`${oeeData?.averageOEE || 0}%`}
            minH="150px"
            minWidth="200px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("oee")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <GaugeChart
                value={oeeData?.averageOEE || 0}
                max={100}
                label="Overall Efficiency"
                color={oeeData?.averageOEE > 65 ? "#48BB78" : oeeData?.averageOEE > 45 ? "#ECC94B" : "#F56565"}
              />
            </Suspense>
          </StatCard>

          {/* ── 6. OEE Trend ── */}
          <StatCard
            title="OEE Trend"
            minWidth="450px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("oeeTrend")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <Box h="220px">
                <AreaChart
                  data={prodReportData || []}
                  xAxisKey="date"
                  dataKey="oee"
                  height={200}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* ── 7. In House Rejection & Action ── */}
          <StatCard
            title="In House Rejection & Action"
            minWidth="340px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("inHouseRejection")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <HStack justify="space-around" align="center" py={4}>
                <VStack bg="red.50" p={4} borderRadius="xl" minW="130px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="red.600" lineHeight={1}>
                    {inHouseData?.rejectionRatio || 0}%
                  </Text>
                  <Text fontSize="11px" fontWeight="bold" color="red.400" textTransform="uppercase" textAlign="center">
                    Rejection<br />Ratio
                  </Text>
                </VStack>
                <VStack bg="orange.50" p={4} borderRadius="xl" minW="130px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="orange.600" lineHeight={1}>
                    {inHouseData?.actionPending || 0}
                  </Text>
                  <Text fontSize="11px" fontWeight="bold" color="orange.400" textTransform="uppercase" textAlign="center">
                    Action<br />Pending
                  </Text>
                </VStack>
              </HStack>
            </Suspense>
          </StatCard>

          {/* ── 8. In House Rework Status ── */}
          <StatCard
            title="In House Rework Status"
            minWidth="200px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("inHouseRework")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack justify="center" h="100%" py={2}>
                <Box bg="blue.50" p={5} borderRadius="2xl" textAlign="center" minW="140px">
                  <Text fontSize="4xl" fontWeight="black" color="blue.600" lineHeight={1}>
                    {inHouseData?.reworkPending || 0}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color="blue.400" mt={2} textTransform="uppercase">
                    Rework Pending
                  </Text>
                </Box>
              </VStack>
            </Suspense>
          </StatCard>

          {/* ── 9. Settings Performance ── */}
          <StatCard
            title="Settings Performance"
            count={settingsDeptData?.noOfSettings || 0}
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("settings")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <HStack justify="space-around" align="center" py={4} w="100%">
                <VStack bg="purple.50" p={4} borderRadius="xl" minW="135px" spacing={1}>
                  <Text fontSize="2xl" fontWeight="black" color="purple.600">
                    {settingsDeptData?.averageSettingTime || 0}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="purple.400" textTransform="uppercase" textAlign="center">
                    Avg Setting<br />Time (min)
                  </Text>
                </VStack>
                <VStack bg="teal.50" p={4} borderRadius="xl" minW="135px" spacing={1}>
                  <Text fontSize="2xl" fontWeight="black" color="teal.600">
                    {settingsDeptData?.avgSetupLoss || 0}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="teal.400" textTransform="uppercase" textAlign="center">
                    Avg Setup<br />Loss (qty)
                  </Text>
                </VStack>
              </HStack>
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── 10. Customer Quality ── 11. Incoming Inspection ── */}
        <Flex wrap="wrap" gap={6}>
          {/* ── 10. Customer Quality ── */}
          <StatCard
            title="Customer Quality"
            minWidth="300px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("customerQuality")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <HStack w="100%" h="100%" justify="space-around" align="center" py={4}>
                <VStack bg="red.50" p={4} borderRadius="xl" minW="110px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="red.600" lineHeight={1}>
                    {custQualData?.rejectionRate || 0}%
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="red.400" textTransform="uppercase" textAlign="center">
                    Rejection<br />Rate
                  </Text>
                </VStack>
                <VStack bg="orange.50" p={4} borderRadius="xl" minW="110px" spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="orange.600" lineHeight={1}>
                    {custQualData?.actionPending || 0}
                  </Text>
                  <Text fontSize="10px" fontWeight="bold" color="orange.400" textTransform="uppercase" textAlign="center">
                    Action<br />Pending
                  </Text>
                </VStack>
              </HStack>
            </Suspense>
          </StatCard>

          {/* ── 11. Incoming Inspection ── */}
          <StatCard
            title="Incoming Inspection"
            count={incomingInspData?.pendingCount || 0}
            minWidth="300px"
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack align="center" justify="center" h="100%" spacing={3}>
                <Box
                  boxSize="120px"
                  borderRadius="full"
                  border="10px solid"
                  borderColor="blue.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {incomingInspData?.pendingCount || 0}
                  </Text>
                </Box>
                <Text color="gray.500" fontWeight="bold">Pending Inspections</Text>
              </VStack>
            </Suspense>
          </StatCard>

          {/* ── 12. Quality Audits (Pending) ── */}
          <StatCard
            title="Quality Audits (Pending)"
            count={qualityAuditsData?.totalPending || 0}
            minWidth="600px"
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["DEPARTMENT", "NCs", "RESPONSIBLE", "DUE"]}
                  data={(qualityAuditsData?.table || []).slice(0, 5)}
                  keys={["department", "noOfNC", "responsible", "due"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* ── 13. Continuous Improvement ── */}
          <StatCard
            title="Continuous Improvement"
            minWidth="300px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("continuousImprovement")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack justify="center" h="100%" py={4}>
                <Box bg="green.50" p={6} borderRadius="2xl" textAlign="center" minW="200px">
                  <Text fontSize="4xl" fontWeight="black" color="green.600" lineHeight={1}>
                    {continuousImpData?.improvementCount || 0}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color="green.400" mt={2} textTransform="uppercase">
                    Improvement Initiatives
                  </Text>
                </Box>
              </VStack>
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── 14. Calibration Due  ──  15. Process Control Plan  ──  16. Certificate Renewal ── */}
        <Flex wrap="wrap" gap={6}>
          {/* ── 14. Calibration Due Status ── */}
          <StatCard
            title="Calibration Due Status"
            count={calibrationDeptData?.totalFiltered || 0}
            minWidth="400px"
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <VStack spacing={4} align="stretch" w="100%">
                <HStack spacing={4} justify="start" pb={2}>
                  <Box bg="green.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="green.100" minW="100px">
                    <Text fontSize="xs" fontWeight="bold" color="green.600">DONE</Text>
                    <Text fontSize="2xl" fontWeight="black" color="green.700" lineHeight={1}>
                      {calibrationDeptData?.doneCount || 0}
                    </Text>
                  </Box>
                  <Box bg="red.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="red.100" minW="100px">
                    <Text fontSize="xs" fontWeight="bold" color="red.600">DUE</Text>
                    <Text fontSize="2xl" fontWeight="black" color="red.700" lineHeight={1}>
                      {calibrationDeptData?.dueCount || 0}
                    </Text>
                  </Box>
                </HStack>

                <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
                  <TableChart
                    headers={["INSTRUMENT", "LAST DATE", "DUE DATE"]}
                    data={(calibrationDeptData?.openRecords || []).slice(0, 5).map(row => {
                      const items = row.items || [];
                      const formatDate = (val) => {
                        if(!val || isNaN(Number(val))) return val || "-";
                        return new Date(Number(val)).toLocaleDateString('en-GB');
                      };
                      return {
                        instrument: items.find(i => i.key.includes("INSTRUMENT") || i.key.includes("NAME"))?.value || items[0]?.value || "-",
                        done: formatDate(items.find(i => i.key === "DONE")?.value || items.find(i => i.key === "DATE")?.value),
                        due: formatDate(items.find(i => i.key === "DUE")?.value),
                      }
                    })}
                    keys={["instrument", "done", "due"]}
                  />
                </Box>
              </VStack>
            </Suspense>
          </StatCard>

          {/* ── 15. Process Control Plan ── */}
          <StatCard
            title="Process Control Plan"
            count={pcpDeptData?.totalRecords || 0}
            minWidth="400px"
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <VStack spacing={4} align="stretch" w="100%">
                <HStack spacing={4} justify="start" pb={2}>
                  <Box bg="orange.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="orange.100" minW="150px">
                    <Text fontSize="xs" fontWeight="bold" color="orange.600">PENDING UPLOADS</Text>
                    <Text fontSize="2xl" fontWeight="black" color="orange.700" lineHeight={1}>
                      {pcpDeptData?.pendingCount || 0}
                    </Text>
                  </Box>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400">TOTAL RECORDS</Text>
                    <Text fontSize="md" fontWeight="bold" color="gray.600">
                      {pcpDeptData?.totalRecords || 0}
                    </Text>
                  </VStack>
                </HStack>

                <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
                  <TableChart
                    headers={["NAME", "DATE", "REV NO"]}
                    data={(pcpDeptData?.pendingRecords || []).slice(0, 5).map(row => {
                      const items = row.items || [];
                      const formatDate = (val) => {
                        if(!val || isNaN(Number(val))) return val || "-";
                        return new Date(Number(val)).toLocaleDateString('en-GB');
                      };
                      return {
                        name: items.find(i => i.key.includes("INSTRUMENT") || i.key.includes("NAME") || i.key.includes("PART"))?.value || items[0]?.value || "-",
                        date: formatDate(items.find(i => i.key === "DATE")?.value),
                        rev: items.find(i => i.key === "REVISION NO")?.value || "-",
                      }
                    })}
                    keys={["name", "date", "rev"]}
                  />
                </Box>
              </VStack>
            </Suspense>
          </StatCard>

          {/* ── 16. Certificate Renewal Status ── */}
          <StatCard
            title="Certificate Renewal Status"
            count={(certsDeptData || []).filter(c => c.isDue).length}
            minWidth="450px"
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <VStack spacing={4} align="stretch" w="100%">
                <HStack spacing={4} justify="start" pb={2}>
                  <Box bg="purple.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="purple.100" minW="150px">
                    <Text fontSize="xs" fontWeight="bold" color="purple.600">ACTION REQUIRED</Text>
                    <Text fontSize="2xl" fontWeight="black" color="purple.700" lineHeight={1}>
                      {(certsDeptData || []).filter(c => c.isDue).length}
                    </Text>
                  </Box>
                </HStack>

                <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
                  <TableChart
                    headers={["CERTIFICATE NAME", "DEPT", "DUE DATE", "REMINDER"]}
                    data={(certsDeptData || []).slice(0, 5).map(c => {
                      const formatDate = (val) => {
                        if(!val || isNaN(Number(val))) return val || "-";
                        return new Date(Number(val)).toLocaleDateString('en-GB');
                      };
                      return {
                        ...c,
                        dueDate: formatDate(c.dueDate),
                      }
                    })}
                    keys={["certName", "department", "dueDate", "reminder"]}
                  />
                </Box>
              </VStack>
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── Supporting Metrics (Purchase, Sales, Production, Dispatch) ── */}
        <VStack spacing={8} align="stretch" pt={8} borderTop="2px solid" borderColor="gray.100">
          <Heading size="md" color="gray.600" px={2}>Supporting Operational Metrics</Heading>
          
          <Flex wrap="wrap" gap={6}>
            {/* Purchase: Pending Procurements */}
            <StatCard
              title="Pending Procurements"
              count={procurementDeptData?.totalPending || 0}
              minWidth="600px"
              headerRight={
                <DashboardCardFilter
                  onApply={handleApplyFilter("pendingProcurements")}
                  hasActiveFilter={hasFilter()}
                />
              }
            >
              <Suspense fallback={<ChartSkeleton type="table" />}>
                <Box maxH="220px" overflowY="auto">
                  <TableChart
                    headers={["PO NUMBER", "ITEM NAME", "VENDOR", "QTY", "SUPPLY DATE", "DUE"]}
                    data={(procurementDeptData?.pendingRecords || []).map((row) => {
                      const items = row.items;
                      const dateVal = items.find((i) => i.key === "DATE")?.value;
                      let due = "-";
                      if (dateVal && !isNaN(dateVal)) {
                        const diffDays = Math.ceil((Number(dateVal) - Date.now()) / (1000 * 60 * 60 * 24));
                        due = diffDays > 0 ? `${diffDays} days` : diffDays < 0 ? `${Math.abs(diffDays)} days ago` : "Today";
                      }
                      return {
                        po: items.find((i) => i.key === "PO NO")?.value || "-",
                        item: items.find((i) => i.key === "ITEM NAME")?.value || "-",
                        vendor: items.find((i) => i.key === "VENDOR-NAME")?.value || "-",
                        qty: items.find((i) => i.key === "QTY")?.value || "0",
                        supplyDate: dateVal && !isNaN(dateVal) ? new Date(Number(dateVal)).toLocaleDateString() : "-",
                        due,
                      };
                    })}
                    keys={["po", "item", "vendor", "qty", "supplyDate", "due"]}
                  />
                </Box>
              </Suspense>
            </StatCard>

            {/* Purchase: Open Inward Payments */}
            <StatCard
              title="Open Inward Payments"
              count={inwardDeptData?.totalOpen || 0}
              minWidth="500px"
              headerRight={
                <DashboardCardFilter
                  onApply={handleApplyFilter("openInwardPayments")}
                  hasActiveFilter={hasFilter()}
                />
              }
            >
              <Suspense fallback={<ChartSkeleton type="table" />}>
                <Box maxH="220px" overflowY="auto">
                  <TableChart
                    headers={["VENDOR", "INVOICE", "VALUE", "PAYMENT DATE", "DUE"]}
                    data={(inwardDeptData?.openRecords || []).map((row) => {
                      const items = row.items;
                      const dateVal = items.find((i) => i.key === "DELIVERY DATE")?.value;
                      let due = "-";
                      if (dateVal && !isNaN(dateVal)) {
                        const diffDays = Math.ceil((Number(dateVal) - Date.now()) / (1000 * 60 * 60 * 24));
                        due = diffDays > 0 ? `${diffDays} days` : diffDays < 0 ? `${Math.abs(diffDays)} days ago` : "Today";
                      }
                      return {
                        vendor: items.find((i) => i.key === "VENDOR NAME")?.value || "-",
                        invoice: items.find((i) => i.key === "INVOICE NO")?.value || "-",
                        value: items.find((i) => i.key === "VALUE")?.value || "-",
                        paymentDate: dateVal && !isNaN(dateVal) ? new Date(Number(dateVal)).toLocaleDateString() : "-",
                        due,
                      };
                    })}
                    keys={["vendor", "invoice", "value", "paymentDate", "due"]}
                  />
                </Box>
              </Suspense>
            </StatCard>
          </Flex>

          <Flex wrap="wrap" gap={6}>
            {/* Sales: Order List */}
            <StatCard
              title="Order List (Active)"
              minWidth="650px"
              count={orderListData?.length || 0}
              headerRight={
                <DashboardCardFilter
                  onApply={handleApplyFilter("orders")}
                  hasActiveFilter={hasFilter()}
                />
              }
            >
              <Suspense fallback={<ChartSkeleton type="table" />}>
                <Box maxH="220px" overflowY="auto">
                  <TableChart
                    headers={["CUSTOMER NAME", "PO NO", "PART NO", "PART NAME", "DATE", "QTY", "DUE"]}
                    data={(orderListData || []).map(row => {
                      const items = row.items;
                      const dateVal = items.find(i => i.key === 'DATE')?.value;
                      return {
                        customerName: items.find(i => i.key === 'CUSTOMER NAME')?.value || '-',
                        po: items.find(i => i.key === 'PO NO')?.value || '-',
                        partNo: items.find(i => i.key === 'PART NO')?.value || '-',
                        partName: items.find(i => i.key === 'PART NAME')?.value || '-',
                        date: dateVal && !isNaN(dateVal) ? new Date(Number(dateVal)).toLocaleDateString() : '-',
                        qty: items.find(i => i.key === 'QTY')?.value || '0',
                        due: dateVal && !isNaN(dateVal)
                          ? `${Math.floor((new Date() - new Date(Number(dateVal))) / (1000 * 60 * 60 * 24))} Days`
                          : "-",
                      };
                    })}
                    keys={["customerName", "po", "partNo", "partName", "date", "qty", "due"]}
                  />
                </Box>
              </Suspense>
            </StatCard>

            {/* Sales: Quotation Status */}
            <StatCard
              title="Quotation List Status"
              minWidth="350px"
              headerRight={
                <DashboardCardFilter
                  onApply={handleApplyFilter("quotation")}
                  hasActiveFilter={hasFilter()}
                />
              }
            >
              <Suspense fallback={<ChartSkeleton type="chart" />}>
                <HStack w="100%" h="100%" justify="space-evenly" align="center">
                  <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                    <Text fontSize="2xl" fontWeight="black" color="purple.600">
                      {(quotationList.data || []).filter(row => row.items.find((i) => i.key === "QL STATUS")?.value === "WAITING FOR QUOTE").length}
                    </Text>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500" textAlign="center">WAITING FOR<br />QUOTE</Text>
                  </VStack>
                  <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                    <Text fontSize="2xl" fontWeight="black" color="cyan.600">
                      {(quotationList.data || []).filter(row => row.items.find((i) => i.key === "QL STATUS")?.value === "WAITING FOR ORDER").length}
                    </Text>
                    <Text fontSize="10px" fontWeight="bold" color="gray.500" textAlign="center">WAITING<br />ORDER</Text>
                  </VStack>
                </HStack>
              </Suspense>
            </StatCard>

            {/* Sales: Customer Payment Status */}
            <StatCard
              title="Customer Payment Status"
              count={docketsData?.totalOpen || 0}
              minWidth="600px"
              headerRight={
                <DashboardCardFilter
                  onApply={handleApplyFilter("customerPayment")}
                  hasActiveFilter={hasFilter()}
                />
              }
            >
              <Suspense fallback={<ChartSkeleton type="table" />}>
                <Box maxH="220px" overflowY="auto">
                  <TableChart
                    headers={["CUSTOMER NAME", "INVOICE", "VALUE", "PAYMENT DATE", "DUE"]}
                    data={(docketsData?.openRecords || []).map((row) => {
                      const items = row.items;
                      const dateVal = items.find((i) => i.key === "DELIVERY DATE")?.value;
                      let due = "-";
                      if (dateVal && !isNaN(dateVal)) {
                        const dueDate = Number(dateVal) + 2 * 24 * 60 * 60 * 1000;
                        const diffDays = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
                        due = diffDays > 0 ? `${diffDays} days` : diffDays < 0 ? `${Math.abs(diffDays)} days ago` : "Today";
                      }
                      return {
                        vendor: items.find((i) => i.key === "CUSTOMER NAME")?.value || "-",
                        invoice: items.find((i) => i.key === "INVOICE NO")?.value || "-",
                        value: items.find((i) => i.key === "VALUE")?.value || "-",
                        date: dateVal && !isNaN(dateVal) ? new Date(Number(dateVal)).toLocaleDateString() : "-",
                        due,
                      };
                    })}
                    keys={["vendor", "invoice", "value", "date", "due"]}
                  />
                </Box>
              </Suspense>
            </StatCard>
          </Flex>
        </VStack>
        
        <Flex wrap="wrap" gap={6}>
          {/* Stock Data (supporting card – kept at end) */}
          <StatCard
            title="Stock Data (Finished Goods)"
            minWidth="400px"
            count={stockData?.totalStockQty}
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("stock")}
                hasActiveFilter={hasFilter()}
                fields={[
                  {
                    name: "itemCode",
                    label: "Item Code",
                    options: ["CODE-A", "CODE-B"],
                  },
                ]}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["ITEM CODE", "ITEM NAME", "STOCK"]}
                  data={formatProcessTableData(stockData.data, {
                    itemCode: "ITEM CODE",
                    itemName: "ITEM NAME",
                    stockCount: "STOCK",
                  })}
                  keys={["itemCode", "itemName", "stockCount"]}
                />
              </Box>
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── Production Plan (supporting cards – kept below main 16) ── */}
        <Flex wrap="wrap" gap={6}>
          <StatCard
            title="Production Plan - Pending"
            count={productionPlan.totalPlanQty}
            minWidth="500px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("productionPlan")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={[
                    "PLAN NO",
                    "DATE",
                    "CUSTOMER NAME",
                    "PART-NO",
                    "PART-NAME",
                    "PLAN QTY",
                  ]}
                  data={formatProcessTableData(productionPlan.pendingDetails, {
                    planNo: "PLAN NO",
                    date: "DATE",
                    customerName: "CUSTOMER NAME",
                    partNo: "PART-NO",
                    partName: "PART-NAME",
                    planQty: "PLAN QTY",
                  }).map((row) => ({
                    ...row,
                    date:
                      row.date !== "-"
                        ? new Date(Number(row.date)).toLocaleDateString()
                        : "-",
                  }))}
                  keys={[
                    "planNo",
                    "date",
                    "customerName",
                    "partNo",
                    "partName",
                    "planQty",
                  ]}
                />
              </Box>
            </Suspense>
          </StatCard>

          <StatCard
            title="Production Plan (Qty by Part No)"
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("productionPlanGraph")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <BarChart
                data={productionPlan.reportGraph || []}
                xAxisKey="partNo"
                height={220}
                dataKeys={[
                  { key: "planQty", name: "Total Plan Qty", color: "#3182ce" },
                ]}
              />
            </Suspense>
          </StatCard>
        </Flex>

        {/* ── Dispatch Data (supporting) ── */}
        <Flex wrap="wrap" gap={6}>
          <StatCard
            title="Dispatch Data"
            count={dispatch?.totalQuantity}
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("dispatch")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["DATE", "PART-NO", "QTY"]}
                  data={(dispatch.data || []).map((row) => ({
                    date: new Date(Number(row.date)).toLocaleDateString(),
                    partNo: row.partNo,
                    qty: row.qty,
                  }))}
                  keys={["date", "partNo", "qty"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          <StatCard
            title="Dispatch Data (Trends)"
            count={dispatch?.totalQuantity}
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("dispatch")}
                hasActiveFilter={hasFilter()}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <Box h="220px">
                <BarChart
                  data={dispatch.graphChart?.monthWise || []}
                  xAxisKey="label"
                  height={220}
                  dataKeys={[
                    {
                      key: "qty",
                      name: "Total Dispatch Qty",
                      color: "#3182ce",
                    },
                  ]}
                />
              </Box>
            </Suspense>
          </StatCard>
        </Flex>

      </VStack>
    </Box>
  );
}

export default Dashboard;
