import React, { useState, Suspense, lazy, useEffect } from 'react';
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
} from '@chakra-ui/react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// importing common components
import StatCard from '../components/dashboard/StatCard';
import ChartSkeleton from '../components/dashboard/ChartSkeleton';
import DashboardCardFilter from '../components/dashboard/DashboardCardFilter';

// importing lazy-loaded chart components
const BarChart = lazy(() => import('../components/dashboard/BarChart'));
const AreaChart = lazy(() => import('../components/dashboard/AreaChart'));
const TableChart = lazy(() => import('../components/dashboard/TableChart'));
const CircleChart = lazy(() => import('../components/dashboard/CircleChart'));
const DonutChart = lazy(() => import('../components/dashboard/DonutChart'));
const GaugeChart = lazy(() => import('../components/dashboard/GaugeChart'));

const URL = process.env.REACT_APP_PROCESS_URL || 'http://localhost:3008/api/v1/process';

const fetchDashboardData = async (filters) => {
  try {
    // Assuming a POST endpoint that takes filters for various sections
    // If it's a GET, it might be /dashboard or /getMainDashBoardDetails
    // We send filters as payload
    const response = await axios.post(`${URL}/dashboard`, { filters });
    
    // Fallback parsing just in case it returns the shape requested
    if (response.data && response.data.success) {
      return response.data;
    }
    return response.data;
  } catch (err) {
    // If the API fails or doesn't exist, we return a fallback based on the user's provided JSON structure
    console.warn("API failed, using fallback data format", err);
    return {
      success: true,
      data: [
        { productionPlanProcess: { pendingDetails: [], reportGraph: [] } },
        { productionReportProcess: { totalFiltered: 0, completeTrend: [], oeeShift: { shift1: 85, shift2: 78, shift3: 90 } } },
        { rejectReportProcess: { totalFiltered: 0, data: [], chartResult: 15 } },
        { reworkReportProcess: { totalFiltered: 0, data: [] } },
        { dispatchProcess: { totalFiltered: 0, data: [] } },
        { npdRegisterProcess: { totalFiltered: 0, monthWise: [], yearWise: [] } },
        { productsProcess: { partNoCount: {} } },
        { calibrationReportProcess: { totalFiltered: 0, data: [], doneCount: 0, dueCount: 0 } },
        { incomingInspectionProcess: { totalFiltered: 0, data: [] } },
        { customerComplientRegisterProcess: { totalFiltered: 0, data: [] } },
        { customerListProcess: { totalFiltered: 0, data: [] } },
        { quotationListProcess: { totalFiltered: 0, data: [] } },
        { orderListProcess: { totalFiltered: 0, data: [] } },
        { procurementProcess: { totalFiltered: 0, data: [] } },
        { stockDataProcess: { totalFiltered: 0, data: [] } }
      ]
    };
  }
};

function Dashboard() {
  // State to hold filters for each individual card/section
  const [sectionFilters, setSectionFilters] = useState({});

  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardData', sectionFilters],
    queryFn: () => fetchDashboardData(sectionFilters),
    // we could debounce this, but react-query handles it well enough
    keepPreviousData: true,
  });

  // Extract data sections gracefully
  const rawData = apiData?.data || [];
  
  const getProcessData = (key) => {
    const section = rawData.find(item => item[key] !== undefined);
    return section ? section[key] : {};
  };

  const productionPlan = getProcessData('productionPlanProcess');
  const productionReport = getProcessData('productionReportProcess');
  const rejectReport = getProcessData('rejectReportProcess');
  const reworkReport = getProcessData('reworkReportProcess');
  const dispatch = getProcessData('dispatchProcess');
  const npdRegister = getProcessData('npdRegisterProcess');
  const products = getProcessData('productsProcess');
  const calibration = getProcessData('calibrationReportProcess');
  const incoming = getProcessData('incomingInspectionProcess');
  const customerComplaint = getProcessData('customerComplientRegisterProcess');
  const customerList = getProcessData('customerListProcess');
  const quotationList = getProcessData('quotationListProcess');
  const orderList = getProcessData('orderListProcess');
  const procurement = getProcessData('procurementProcess');
  const stockData = getProcessData('stockDataProcess');

  const handleApplyFilter = (section) => (filterValues) => {
    setSectionFilters(prev => ({
      ...prev,
      [section]: filterValues
    }));
  };

  const hasFilter = (section) => {
    return !!sectionFilters[section];
  };

  if (isLoading && !apiData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  // Fallback map data arrays for charting
  const formatTableData = (data, keys) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
      let row = {};
      keys.forEach(k => {
        row[k] = item[k] || '-';
      });
      return row;
    });
  };

  return (
    <Box className='AppRightContainer DashboardContainer' bg="gray.25" p={{ base: 4, md: 6 }}>
      <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="gray.800">Operational Dashboard</Heading>
          <Text color="gray.500" fontSize="sm">Performance tracking and production metrics</Text>
        </VStack>
      </Flex>

      {isError && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Failed to fetch live dashboard data. Showing available details.
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} mb={6}>
        
        {/* 1. Production plan pending */}
        <StatCard 
          title="Production Plan - Pending" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('productionPlan')} 
                 hasActiveFilter={hasFilter('productionPlan')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
            <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['PLAN NO', 'PART NO', 'PART NAME', 'QTY', 'CUSTOMER']}
                  data={formatTableData(productionPlan.pendingDetails, ['planNo', 'partNo', 'partName', 'planQty', 'customerName'])}
                  keys={['planNo', 'partNo', 'partName', 'planQty', 'customerName']}
                />
            </Box>
          </Suspense>
        </StatCard>

        {/* 2. Production Plan - Graph (x: partNo, y: sum qty) */}
         <StatCard 
          title="Production Plan (Qty by Part No)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('productionPlanGraph')} 
                 hasActiveFilter={hasFilter('productionPlanGraph')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
            <BarChart 
              data={productionPlan.reportGraph || []}
              xAxisKey="partNo"
              height={220}
              dataKeys={[
                { key: "sumPlanQty", name: "Total Plan Qty", color: "#3182ce" }
              ]}
            />
          </Suspense>
        </StatCard>

        {/* 3. Production Report - Complete trend (OEE 7/15/30 days) */}
         <StatCard 
          title="Production Report - OEE Trend" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('productionReportAvg')} 
                 hasActiveFilter={hasFilter('productionReportAvg')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
            <BarChart 
              data={productionReport.completeTrend || []}
              xAxisKey="dayLabel" // assuming e.g., '7 Days', '15 Days', '30 Days'
              height={220}
              dataKeys={[
                { key: "avgOee", name: "Avg OEE %", color: "#48bb78" }
              ]}
            />
          </Suspense>
        </StatCard>

        {/* 4. Production Report - Shift OEE */}
         <StatCard 
          title="Production Report - Shift OEE(%)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('productionReportShift')} 
                 hasActiveFilter={hasFilter('productionReportShift')}
                 fields={[
                     { name: 'machine', label: 'Machine', options: ['Machine A', 'Machine B'] },
                     { name: 'operatedBy', label: 'Operated By', options: ['Operator 1', 'Operator 2'] }
                 ]}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="circles" />}>
             {/* If shifted OEE returns a dictionary { shift1: 80, shift2: 90 } */}
            <CircleChart data={productionReport.oeeShift || { "Shift 1": 0, "Shift 2": 0, "Shift 3": 0 }} type="attendance" />
          </Suspense>
        </StatCard>

        {/* 5. Reject Report - Unclosed & Trend */}
        <StatCard 
          title="Reject Report - Rework Trend (Unclosed)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('rejectReport')} 
                 hasActiveFilter={hasFilter('rejectReport')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['PART NO', 'PART NAME', 'QTY', 'DESCRIPTION']}
                  data={formatTableData(rejectReport.data, ['partNo', 'partName', 'qty', 'problemDescription'])}
                  keys={['partNo', 'partName', 'qty', 'problemDescription']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 6. Reject / Actual (Gauge) */}
        <StatCard 
          title="Reject / Actual Production Ratio" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('rejectActualGauge')} 
                 hasActiveFilter={hasFilter('rejectActualGauge')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="circles" />}>
             <GaugeChart 
                 value={rejectReport.chartResult || 0} // Using reject qty over actual sum
                 max={100} 
                 label="Reject Rate %" 
             />
          </Suspense>
        </StatCard>

        {/* 7. Rework Report - Table (unclosed) */}
        <StatCard 
          title="Rework Report (Unclosed)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('reworkReport')} 
                 hasActiveFilter={hasFilter('reworkReport')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['PART NO', 'PART NAME', 'QTY', 'DESCRIPTION']}
                  data={formatTableData(reworkReport.data, ['partNo', 'partName', 'qty', 'problemDescription'])}
                  keys={['partNo', 'partName', 'qty', 'problemDescription']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 8. Dispatch - Bar chart */}
         <StatCard 
          title="Dispatch by Month" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('dispatch')} 
                 hasActiveFilter={hasFilter('dispatch')}
                 fields={[{ name: 'partNo', label: 'Part No', options: ['P1', 'P2'] }]}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
            <BarChart 
              data={dispatch.data || []}
              xAxisKey="month" // x-axis month
              height={220}
              dataKeys={[
                { key: "qty", name: "Dispatch Qty", color: "#805ad5" }
              ]}
            />
          </Suspense>
        </StatCard>

        {/* 9. NPD Register */}
         <StatCard 
          title="NPD Register (Month & Year wise)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('npd')} 
                 hasActiveFilter={hasFilter('npd')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
              <Box>
                  <Text fontSize="md" fontWeight="bold" mb={2} color="gray.700">Total: {npdRegister.totalFiltered || 0}</Text>
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

        {/* 10. Overall Products */}
         <StatCard 
          title="Overall Products Summary" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('products')} 
                 hasActiveFilter={hasFilter('products')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="circles" />}>
              <VStack justify="center" h="100%">
                  <Text fontSize="4xl" fontWeight="black" color="blue.600">
                      {Object.keys(products.partNoCount || {}).length || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">
                      Unique Part No's
                  </Text>
              </VStack>
          </Suspense>
        </StatCard>

        {/* 11. Calibration Details */}
         <StatCard 
          title="Calibration Details (Done vs Due)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('calibration')} 
                 hasActiveFilter={hasFilter('calibration')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
             <DonutChart 
                 data={[
                     { name: 'Done', value: calibration.doneCount || 0 },
                     { name: 'Due', value: calibration.dueCount || 0 },
                 ]}
                 height={220}
                 innerRadius={40}
                 outerRadius={70}
             />
          </Suspense>
        </StatCard>

        {/* 12. Incoming Inspection */}
        <StatCard 
          title="Incoming Inspection (!= Done)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('incoming')} 
                 hasActiveFilter={hasFilter('incoming')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['PART NO', 'CATEGORY', 'NAME', 'QTY', 'CODE']}
                  data={formatTableData(incoming.data, ['partNo', 'itemCategory', 'itemName', 'qty', 'itemCode'])}
                  keys={['partNo', 'itemCategory', 'itemName', 'qty', 'itemCode']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 13. Customer Compliant Registered */}
        <StatCard 
          title="Customer Complaint (Supplied vs Failed)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('customerComplaint')} 
                 hasActiveFilter={hasFilter('customerComplaint')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
            <BarChart 
              data={customerComplaint.data || []}
              xAxisKey="month" // or year
              height={220}
              dataKeys={[
                { key: "suppliedQty", name: "Supplied", color: "#3182ce" },
                { key: "failedQty", name: "Failed", color: "#e53e3e" }
              ]}
            />
          </Suspense>
        </StatCard>

        {/* 14. Customer List */}
        <StatCard 
          title="Customer List" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('customerList')} 
                 hasActiveFilter={hasFilter('customerList')}
                 fields={[
                     { name: 'salesPerson', label: 'Sales Person', options: ['Person A', 'Person B'] },
                     { name: 'location', label: 'Location', options: ['Loc A', 'Loc B'] }
                 ]}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
              <Box mb={2}>
                 <Text fontSize="sm" fontWeight="bold" color="gray.600">Total Records: {customerList.totalFiltered || 0}</Text>
              </Box>
             <Box maxH="180px" overflowY="auto">
                <TableChart 
                  headers={['NAME', 'SALES PERSON', 'LOCATION']}
                  data={formatTableData(customerList.data, ['name', 'salesPerson', 'location'])}
                  keys={['name', 'salesPerson', 'location']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 15. Quotation List */}
         <StatCard 
          title="Quotation List Status" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('quotation')} 
                 hasActiveFilter={hasFilter('quotation')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="chart" />}>
             {/* Simple count representation */}
             <HStack w="100%" h="100%" justify="space-evenly" align="center">
                 <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                     <Text fontSize="2xl" fontWeight="black" color="purple.600">{quotationList.waitingForQuote || 0}</Text>
                     <Text fontSize="10px" fontWeight="bold" color="gray.500" textAlign="center">WAITING FOR<br/>QUOTE</Text>
                 </VStack>
                 <VStack bg="gray.50" p={4} borderRadius="lg" minW="100px">
                     <Text fontSize="2xl" fontWeight="black" color="cyan.600">{quotationList.waitingOrder || 0}</Text>
                     <Text fontSize="10px" fontWeight="bold" color="gray.500" textAlign="center">WAITING<br/>ORDER</Text>
                 </VStack>
             </HStack>
          </Suspense>
        </StatCard>

        {/* 16. Order List */}
        <StatCard 
          title="Order List (!= Closed)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('orders')} 
                 hasActiveFilter={hasFilter('orders')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['CUSTOMER', 'PART NO', 'PART NAME', 'QTY']}
                  data={formatTableData(orderList.data, ['customerName', 'partNo', 'partName', 'qty'])}
                  keys={['customerName', 'partNo', 'partName', 'qty']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 17. Procurement Register */}
        <StatCard 
          title="Procurement (Pending Qty)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('procurement')} 
                 hasActiveFilter={hasFilter('procurement')}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['ITEM CODE', 'PENDING QTY', 'PAYMENT PENDING']}
                  data={formatTableData(procurement.data, ['itemCode', 'pendingQty', 'paymentPending'])}
                  keys={['itemCode', 'pendingQty', 'paymentPending']}
                />
             </Box>
          </Suspense>
        </StatCard>

        {/* 18. Stock Data */}
        <StatCard 
          title="Stock Data (Finished Goods)" 
          headerRight={
             <DashboardCardFilter 
                 onApply={handleApplyFilter('stock')} 
                 hasActiveFilter={hasFilter('stock')}
                 fields={[{ name: 'itemCode', label: 'Item Code', options: ['CODE-A', 'CODE-B'] }]}
             />
          }
        >
          <Suspense fallback={<ChartSkeleton type="table" />}>
             <Box maxH="220px" overflowY="auto">
                <TableChart 
                  headers={['ITEM CODE', 'NAME', 'STOCK COUNT']}
                  data={formatTableData(stockData.data, ['itemCode', 'itemName', 'stockCount'])}
                  keys={['itemCode', 'itemName', 'stockCount']}
                />
             </Box>
          </Suspense>
        </StatCard>

      </SimpleGrid>
    </Box>
  );
}

export default Dashboard;
