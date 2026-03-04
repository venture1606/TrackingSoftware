import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Heading,
  HStack,
  VStack,
} from '@chakra-ui/react';

// importing styles
import '../styles/dashboard.css';

// importing common components
import FilterCompo from '../components/FilterCompo';
import StatCard from '../components/dashboard/StatCard';
import ChartSkeleton from '../components/dashboard/ChartSkeleton';
import { dummyDashboardData } from '../utils/dummyDashboardData';

// importing lazy-loaded chart components
const BarChart = lazy(() => import('../components/dashboard/BarChart'));
const LineChart = lazy(() => import('../components/dashboard/LineChart'));
const TableChart = lazy(() => import('../components/dashboard/TableChart'));
const CircleChart = lazy(() => import('../components/dashboard/CircleChart'));
const AreaChart = lazy(() => import('../components/dashboard/AreaChart'));
const DonutChart = lazy(() => import('../components/dashboard/DonutChart'));
const RadarChart = lazy(() => import('../components/dashboard/RadarChart'));

// importing the datas

function Dashboard() {
  const [dateFilter, setDateFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const {
    planActual,
    couplerOutput,
    reworkRate,
    shiftOee,
    inhouseRejectRate,
    customerRejectionRate,
    supplierRate,
    salesTrend,
    sales,
    audit,
    purchase,
    attendance
  } = dummyDashboardData;

  const oeeData = [
    { name: 'Shift 1', value: shiftOee.shift1 },
    { name: 'Shift 2', value: shiftOee.shift2 },
    { name: 'Shift 3', value: shiftOee.shift3 },
  ];

  return (
    <Box className='AppRightContainer DashboardContainer' bg="gray.25" p={6}>
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={0}>
            <Heading size="lg" color="gray.800">Operational Dashboard</Heading>
            <Text color="gray.500" fontSize="sm">Performance tracking and production metrics</Text>
        </VStack>
        
        <HStack spacing={4} bg="white" p={2} borderRadius="lg" boxShadow="xs" border="1px solid" borderColor="gray.100">
          <Box>
            <Text fontSize="10px" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase" px={1}>Date</Text>
            <FilterCompo 
                filters={['Last 7 Days', 'Last 30 Days', 'Current Month']} 
                onFilterChange={setDateFilter} 
            />
          </Box>
          <Box>
            <Text fontSize="10px" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase" px={1}>Item</Text>
            <FilterCompo 
                filters={['Coupler A', 'Gear B', 'Shaft C']} 
                onFilterChange={setItemFilter} 
            />
          </Box>
          <Box>
            <Text fontSize="10px" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase" px={1}>Status</Text>
            <FilterCompo 
                filters={['Planning', 'Production', 'Shipped']} 
                onFilterChange={setStatusFilter} 
            />
          </Box>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} mb={6}>
        {/* Row 1 */}
        <StatCard title="Plan vs Actual Output">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <BarChart 
                    data={planActual}
                    xAxisKey="partNo"
                    height={220}
                    dataKeys={[
                        { key: "planQty", name: "Plan", color: "#cbd5e0" },
                        { key: "actualQty", name: "Actual", color: "#3182ce" }
                    ]}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Coupler Output By Date">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <BarChart 
                    data={couplerOutput}
                    xAxisKey="date"
                    height={220}
                    dataKeys={[
                        { key: "qty", name: "QTY", color: "#3182ce" }
                    ]}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Rework Rate Trend">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <AreaChart 
                    data={reworkRate}
                    xAxisKey="month"
                    dataKey="rr"
                    color="#e53e3e"
                    height={220}
                />
            </Suspense>
        </StatCard>

        {/* Row 2 */}
        <StatCard title="Shift OEE (%)">
            <Suspense fallback={<ChartSkeleton type="circles" />}>
                <CircleChart data={oeeData} type="radial" />
            </Suspense>
        </StatCard>

        <StatCard title="Inhouse Reject Rate">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <BarChart 
                    data={inhouseRejectRate}
                    xAxisKey="month"
                    height={220}
                    dataKeys={[
                        { key: "rr", name: "Reject Rate %", color: "#f6ad55" }
                    ]}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Customer Rejection Rate">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <AreaChart 
                    data={customerRejectionRate}
                    xAxisKey="month"
                    dataKey="crr"
                    color="#805ad5"
                    height={220}
                />
            </Suspense>
        </StatCard>

        {/* Row 3 */}
        <StatCard title="Supplier Performance (Defect Rate %)">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <BarChart 
                    data={supplierRate}
                    xAxisKey="vendor"
                    height={220}
                    dataKeys={[
                        { key: "defectRate", name: "Defect Rate %", color: "#d69e2e" }
                    ]}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Sales Trend">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <AreaChart 
                    data={salesTrend}
                    xAxisKey="month"
                    dataKey="percentage"
                    color="#48bb78"
                    height={220}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Audit Performance Summary">
            <Suspense fallback={<ChartSkeleton type="chart" />}>
                <RadarChart 
                    data={audit}
                    angleKey="department"
                    dataKey="score"
                    height={220}
                    color="#3182ce"
                />
            </Suspense>
        </StatCard>

        {/* Row 4 */}
        <StatCard title="Recent Sales Details">
            <Suspense fallback={<ChartSkeleton type="table" />}>
                <TableChart 
                    headers={['PART', 'QTY', 'STATUS', 'PAYMENT']}
                    data={sales}
                    keys={['part', 'qty', 'status', 'payment']}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Purchase Transaction Log">
            <Suspense fallback={<ChartSkeleton type="table" />}>
                <TableChart 
                    headers={['ITEM CODE', 'NAME', 'STATUS', 'PAYMENT']}
                    data={purchase}
                    keys={['itemCode', 'itemName', 'status', 'payment']}
                />
            </Suspense>
        </StatCard>

        <StatCard title="Shift Attendance">
             <Suspense fallback={<ChartSkeleton type="table" />}>
                <CircleChart data={attendance} type="attendance" />
             </Suspense>
        </StatCard>
      </SimpleGrid>
    </Box>
  );
}

export default Dashboard;

