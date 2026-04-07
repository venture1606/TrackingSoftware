import { useDashboard } from "../services/Process";
import React, { useState, Suspense, lazy } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Heading,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

// importing common components
import StatCard from "../components/dashboard/StatCard";
import ChartSkeleton from "../components/dashboard/ChartSkeleton";
import DashboardCardFilter from "../components/dashboard/DashboardCardFilter";

// importing lazy-loaded chart components
const BarChart = lazy(() => import("../components/dashboard/BarChart"));
const AreaChart = lazy(() => import("../components/dashboard/AreaChart"));
const TableChart = lazy(() => import("../components/dashboard/TableChart"));
const CircleChart = lazy(() => import("../components/dashboard/CircleChart"));
const DonutChart = lazy(() => import("../components/dashboard/DonutChart"));
const GaugeChart = lazy(() => import("../components/dashboard/GaugeChart"));

const URL =
  process.env.REACT_APP_PROCESS_URL || "http://localhost:3008/api/v1/process";

function Dashboard() {
  // State to hold global filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    salesPerson: "",
    location: "",
  });

  // Convert filters to what the backend expects (epoch for dates)
  const apiFilters = {
    ...filters,
    startDate: filters.startDate
      ? new Date(filters.startDate).getTime()
      : undefined,
    endDate: filters.endDate ? new Date(filters.endDate).getTime() : undefined,
    // Ensure "All" is treated as empty string or undefined
    salesPerson: filters.salesPerson === "All" ? "" : filters.salesPerson,
    location: filters.location === "All" ? "" : filters.location,
  };

  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useDashboard(apiFilters);

  // Extract data sections gracefully
  const rawData = apiResponse?.data || [];

  const getProcessData = (key) => {
    const section = rawData.find((item) => item[key] !== undefined);
    return section ? section[key] : {};
  };

  const productionPlan = getProcessData("productionPlanProcess");
  const productionReport = getProcessData("productionReportProcess");
  const rejectReport = getProcessData("rejectReportProcess");
  const reworkReport = getProcessData("reworkReportProcess");
  const dispatch = getProcessData("dispatchProcess");
  const npdRegister = getProcessData("npdRegisterProcess");
  const products = getProcessData("productsProcess");
  const calibration = getProcessData("calibrationReportProcess");
  const incoming = getProcessData("incomingInspectionProcess");
  const customerComplaint = getProcessData("customerComplientRegisterProcess");
  const customerList = getProcessData("customerListProcess");
  const quotationList = getProcessData("quotationListProcess");
  const orderList = getProcessData("orderListProcess");
  const procurement = getProcessData("procurementProcess");
  const stockData = getProcessData("stockDataProcess");

  const handleApplyFilter = (section) => (filterValues) => {
    // Current Dashboard structure uses per-card filters, but we map them to global filters
    // to match current backend capabilities.
    setFilters((prev) => ({
      ...prev,
      startDate: filterValues.startDate || prev.startDate,
      endDate: filterValues.endDate || prev.endDate,
      ...(filterValues.fields || {}),
    }));
  };

  const hasFilter = (section) => {
    // Basic check for active filters
    return !!(
      filters.startDate ||
      filters.endDate ||
      filters.salesPerson ||
      filters.location
    );
  };

  if (isLoading && !apiResponse) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  // Helper to format rows from process.items array into a flat object
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

      {isError && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Failed to fetch live dashboard data. Showing available details.
        </Alert>
      )}

      <VStack spacing={8} align="stretch" mb={8}>

        {/* Row 4: Quotation, Order, Stock */}
        <Flex wrap="wrap" gap={6}>
          {/* 15. Quotation List */}
          <StatCard
            title="Quotation List Status"
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("quotation")}
                hasActiveFilter={hasFilter("quotation")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              {/* Simple count representation */}
              <HStack w="100%" h="100%" justify="space-evenly" align="center">
                <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                  <Text fontSize="2xl" fontWeight="black" color="purple.600">
                    {
                      (quotationList.data || []).filter(
                        (row) =>
                          row.items.find((i) => i.key === "QL STATUS")
                            ?.value === "WAITING FOR QUOTE",
                      ).length
                    }
                  </Text>
                  <Text
                    fontSize="10px"
                    fontWeight="bold"
                    color="gray.500"
                    textAlign="center"
                  >
                    WAITING FOR
                    <br />
                    QUOTE
                  </Text>
                </VStack>
                <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                  <Text fontSize="2xl" fontWeight="black" color="cyan.600">
                    {
                      (quotationList.data || []).filter(
                        (row) =>
                          row.items.find((i) => i.key === "QL STATUS")
                            ?.value === "WAITING FOR ORDER",
                      ).length
                    }
                  </Text>
                  <Text
                    fontSize="10px"
                    fontWeight="bold"
                    color="gray.500"
                    textAlign="center"
                  >
                    WAITING
                    <br />
                    ORDER
                  </Text>
                </VStack>
              </HStack>
            </Suspense>
          </StatCard>

          {/* 16. Order List */}
          <StatCard
            title="Order List (Active)"
            minWidth="500px"
            count={orderList?.totalOrderQty}
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("orders")}
                hasActiveFilter={hasFilter("orders")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["CUSTOMER", "PART NO", "PART NAME", "QTY"]}
                  data={formatProcessTableData(orderList.data, {
                    customerName: "CUSTOMER",
                    partNo: "PART NO",
                    partName: "PART NAME",
                    qty: "QTY",
                  })}
                  keys={["customerName", "partNo", "partName", "qty"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* 18. Stock Data */}
          <StatCard
            title="Stock Data (Finished Goods)"
            minWidth="400px"
            count={stockData?.totalStockQty}
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("stock")}
                hasActiveFilter={hasFilter("stock")}
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

        {/* Row 1: Production Plan */}
        <Flex wrap="wrap" gap={6}>
          {/* 1. Production plan pending */}
          <StatCard
            title="Production Plan - Pending"
            count={productionPlan.totalPlanQty}
            minWidth="500px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("productionPlan")}
                hasActiveFilter={hasFilter("productionPlan")}
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

          {/* 2. Production Plan - Graph (x: partNo, y: sum qty) */}
          <StatCard
            title="Production Plan (Qty by Part No)"
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("productionPlanGraph")}
                hasActiveFilter={hasFilter("productionPlanGraph")}
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

        {/* Row 5: Procurement */}
        <Flex wrap="wrap" gap={6}>
          {/* 17. Procurement Register */}
          <StatCard
            title="Procurement Register"
            count={procurement.totalPendingQty}
            minWidth="600px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("procurement")}
                hasActiveFilter={hasFilter("procurement")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={[
                    "DATE",
                    "ITEM CATEGORY",
                    "ITEM NAME",
                    "VENDOR NAME",
                    "QTY",
                    "DUE",
                  ]}
                  data={formatProcessTableData(procurement.data, {
                    date: "DATE",
                    category: "ITEM CATEGORY",
                    itemName: "ITEM NAME",
                    vendor: "VENDOR-NAME",
                    qty: "QTY",
                  }).map((row) => {
                    const diffDays =
                      row.date !== "-"
                        ? Math.floor(
                            (new Date() - new Date(Number(row.date))) /
                              (1000 * 60 * 60 * 24),
                          )
                        : "-";
                    return {
                      ...row,
                      date:
                        row.date !== "-"
                          ? new Date(Number(row.date)).toLocaleDateString()
                          : "-",
                      due: diffDays !== "-" ? `${diffDays} Days` : "-",
                    };
                  })}
                  keys={[
                    "date",
                    "category",
                    "itemName",
                    "vendor",
                    "qty",
                    "due",
                  ]}
                />
              </Box>
            </Suspense>
          </StatCard>
        </Flex>
        
        {/* Row 2: Dispatch Data */}
        <Flex wrap="wrap" gap={6}>
          {/* 8. Dispatch - Table chart */}
          <StatCard
            title="Dispatch Data"
            count={dispatch?.totalQuantity}
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("dispatch")}
                hasActiveFilter={hasFilter("dispatch")}
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

          {/* dispatch graph chart */}
          <StatCard
            title="Dispatch Data (Trends)"
            count={dispatch?.totalQuantity}
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("dispatch")}
                hasActiveFilter={hasFilter("dispatch")}
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

        {/* Row 3: NPD & Products Summary */}
        <Flex wrap="wrap" gap={6}>
          {/* 9. NPD Register */}
          <StatCard
            title="NPD Register"
            count={npdRegister.totalFiltered}
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("npd")}
                hasActiveFilter={hasFilter("npd")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={2} color="gray.700">
                  Total: {npdRegister.totalFiltered || 0}
                </Text>
                {/* Could use BarChart for monthWise/yearWise */}
                <BarChart
                  data={npdRegister.monthWise || []}
                  xAxisKey="label"
                  height={180}
                  dataKeys={[{ key: "count", name: "Count", color: "#f6ad55" }]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* 10. Overall Products Summary */}
          <StatCard
            title="Overall Products Summary"
            minH="150px"
            minWidth="100px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("products")}
                hasActiveFilter={hasFilter("products")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack justify="center" h="100%">
                <Text fontSize="4xl" fontWeight="black" color="blue.600">
                  {Object.keys(products.partNoCount || {}).length || 0}
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Unique Part No's
                </Text>
              </VStack>
            </Suspense>
          </StatCard>
        </Flex>        

        {/* Row 6: Others */}
        <Flex wrap="wrap" gap={6}>
          {/* 3. Production Report - Total */}
          <StatCard
            title="Production Report - Total"
            minH="150px"
            minWidth="200px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("productionReport")}
                hasActiveFilter={hasFilter("productionReport")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack justify="center" h="100%">
                <Text fontSize="4xl" fontWeight="black" color="green.500">
                  {productionReport.totalFiltered || 0}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  TOTAL REPORTS
                </Text>
              </VStack>
            </Suspense>
          </StatCard>

          {/* 5. Reject Report - Details */}
          <StatCard
            title="Reject Report - Details"
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("rejectReport")}
                hasActiveFilter={hasFilter("rejectReport")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["PART NO", "REJECT QTY"]}
                  data={formatProcessTableData(rejectReport.data, {
                    partNo: "PART NO",
                    qty: "REJECT QTY",
                  })}
                  keys={["partNo", "qty"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* 6. Reject / Actual (Gauge) */}
          <StatCard
            title="Reject / Actual Production Ratio"
            minWidth="350px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("rejectActualGauge")}
                hasActiveFilter={hasFilter("rejectActualGauge")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="circles" />}>
              <GaugeChart
                value={(rejectReport.chartResult || 0) * 100} // Convert ratio to percentage
                max={100}
                label="Reject Rate %"
              />
            </Suspense>
          </StatCard>

          {/* 7. Rework Report - Table (unclosed) */}
          <StatCard
            title="Rework Report (Unclosed)"
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("reworkReport")}
                hasActiveFilter={hasFilter("reworkReport")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["PART NO", "PART NAME", "QTY"]}
                  data={formatProcessTableData(reworkReport.data, {
                    partNo: "PART NO",
                    partName: "PART NAME",
                    qty: "QTY",
                  })}
                  keys={["partNo", "partName", "qty"]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* 11. Calibration Details */}
          <StatCard
            title="Calibration Details (Done vs Due)"
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("calibration")}
                hasActiveFilter={hasFilter("calibration")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <DonutChart
                data={[
                  { name: "Done", value: calibration.doneCount || 0 },
                  { name: "Due", value: calibration.dueCount || 0 },
                ]}
                height={220}
                innerRadius={40}
                outerRadius={70}
              />
            </Suspense>
          </StatCard>

          {/* 12. Incoming Inspection */}
          <StatCard
            title="Incoming Inspection (Pending)"
            minWidth="500px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("incoming")}
                hasActiveFilter={hasFilter("incoming")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box maxH="220px" overflowY="auto">
                <TableChart
                  headers={["PART NO", "CATEGORY", "NAME", "QTY", "CODE"]}
                  data={formatProcessTableData(incoming.data, {
                    partNo: "PART NO",
                    itemCategory: "ITEM CATEGORY",
                    itemName: "ITEM NAME",
                    qty: "QTY",
                    itemCode: "ITEM CODE",
                  })}
                  keys={[
                    "partNo",
                    "itemCategory",
                    "itemName",
                    "qty",
                    "itemCode",
                  ]}
                />
              </Box>
            </Suspense>
          </StatCard>

          {/* 13. Customer Complaints Ratio */}
          <StatCard
            title="Customer Complaints Ratio"
            minWidth="400px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("customerComplaint")}
                hasActiveFilter={hasFilter("customerComplaint")}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="chart" />}>
              <BarChart
                data={(customerComplaint.data || []).map((row) => ({
                  date: new Date(Number(row.date)).toLocaleDateString(),
                  ratio: (row.ratio * 100).toFixed(2),
                }))}
                xAxisKey="date"
                height={220}
                dataKeys={[
                  { key: "ratio", name: "Fail Ratio %", color: "#e53e3e" },
                ]}
              />
            </Suspense>
          </StatCard>

          {/* 14. Customer List */}
          <StatCard
            title="Customer List"
            count={customerList.totalFiltered}
            minWidth="450px"
            headerRight={
              <DashboardCardFilter
                onApply={handleApplyFilter("customerList")}
                hasActiveFilter={hasFilter("customerList")}
                fields={[
                  {
                    name: "salesPerson",
                    label: "Sales Person",
                    options: ["Person A", "Person B"],
                  },
                  {
                    name: "location",
                    label: "Location",
                    options: ["Loc A", "Loc B"],
                  },
                ]}
              />
            }
          >
            <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box mb={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  Total Records: {customerList.totalFiltered || 0}
                </Text>
              </Box>
              <Box maxH="180px" overflowY="auto">
                <TableChart
                  headers={["NAME", "SALES PERSON", "LOCATION"]}
                  data={formatProcessTableData(customerList.data, {
                    name: "NAME",
                    salesPerson: "SALES PERSON",
                    location: "LOCATION",
                  })}
                  keys={["name", "salesPerson", "location"]}
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
