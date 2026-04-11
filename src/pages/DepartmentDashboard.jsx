import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  useToast,
  Badge,
} from '@chakra-ui/react';
import {
  getNPDRegister,
  getProductsDashboard,
  getRevisionControl,
  getOEEDashboard,
  getProductionReport,
  getInhouseDashboard,
  getCustomerQuality,
  getIncomingInspection,
  getQualityAudits,
  getContinuousImprovement,
  getEmployeeOverhead,
  getEmployeeAttendance,
  getProcurementDashboard,
  getInwardDashboard,
  getSalesCustomerCount,
  getSalesTrend,
  getQuotationStatus,
  getSalesOrderDetails,
  getSalesPaymentAndDelivery,
  getSalesTrailStatus,
} from '../services/dashboard';

// Import Dashboard Components
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/dashboard/BarChart';
import AreaChart from '../components/dashboard/AreaChart';
import CircleChart from '../components/dashboard/CircleChart';
import DonutChart from '../components/dashboard/DonutChart';
import GaugeChart from '../components/dashboard/GaugeChart';
import TableChart from '../components/dashboard/TableChart';
import DashboardCardFilter from '../components/dashboard/DashboardCardFilter';

const DepartmentDashboard = ({ Content }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const toast = useToast();

  // DASHBOARD FILTERS STATE
  const [globalFilters, setGlobalFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = useCallback(async (deptName, filters = globalFilters) => {
    setLoading(true);
    const department = deptName?.toLowerCase();
    try {
      let dashboardData = {};
      
      // Convert string dates to timestamps for backend
      const startTimestamp = filters.startDate ? new Date(filters.startDate).getTime() : undefined;
      const endTimestamp = filters.endDate ? new Date(filters.endDate).getTime() : undefined;

      switch (department) {
        case 'design':
          const [npd, products, revision] = await Promise.all([
            getNPDRegister(),
            getProductsDashboard(),
            getRevisionControl(),
          ]);
          dashboardData = { npd, products, revision };
          break;

        case 'manufacturing':
          const [oee, prodReport, inhouse] = await Promise.all([
            getOEEDashboard(startTimestamp, endTimestamp),
            getProductionReport(startTimestamp, endTimestamp),
            getInhouseDashboard(startTimestamp, endTimestamp),
          ]);
          dashboardData = { oee, prodReport, inhouse };
          break;

        case 'quality':
          const [custQual, incoming, audits, improvement] = await Promise.all([
            getCustomerQuality(startTimestamp, endTimestamp),
            getIncomingInspection(),
            getQualityAudits(),
            getContinuousImprovement(startTimestamp, endTimestamp),
          ]);
          dashboardData = { custQual, incoming, audits, improvement };
          break;

        case 'hr':
        case 'human resources':
          const [overhead, attendance] = await Promise.all([
            getEmployeeOverhead(),
            getEmployeeAttendance(startTimestamp, endTimestamp),
          ]);
          dashboardData = { overhead, attendance };
          break;

        case 'purchase':
          const [procurement, inward] = await Promise.all([
            getProcurementDashboard(startTimestamp, endTimestamp),
            getInwardDashboard(startTimestamp, endTimestamp),
          ]);
          dashboardData = { procurement, inward };
          break;

        case 'sales':
          const [salesCust, salesTrend, quotation, salesOrder, salesPay, salesTrail] = await Promise.all([
            getSalesCustomerCount(),
            getSalesTrend(startTimestamp, endTimestamp),
            getQuotationStatus(),
            getSalesOrderDetails(),
            getSalesPaymentAndDelivery(),
            getSalesTrailStatus(),
          ]);
          dashboardData = { salesCust, salesTrend, quotation, salesOrder, salesPay, salesTrail };
          break;

        default:
          dashboardData = {};
      }
      setData(dashboardData);
    } catch (error) {
      console.error(`Error fetching ${department} dashboard:`, error);
      toast({
        title: 'Error fetching dashboard data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (Content) {
      fetchData(Content);
    }
  }, [Content, fetchData]);

  const handleFilterApply = (filterValues) => {
    const newFilters = {
      startDate: filterValues.startDate,
      endDate: filterValues.endDate
    };
    setGlobalFilters(newFilters);
    fetchData(Content, newFilters);
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500" fontWeight="medium">Loading {Content} Dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  const renderDesignDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <StatCard title="Total Products" count={data.products?.data?.totalProducts || 0}>
        <VStack align="stretch" spacing={4} mt={4}>
          <HStack justify="space-between">
            <Text color="gray.600" fontSize="sm">Total BOMs</Text>
            <Badge colorScheme="blue" borderRadius="full" px={2}>{data.products?.data?.totalBOM || 0}</Badge>
          </HStack>
          <Box h="100px" bg="blue.50" borderRadius="md" p={3} display="flex" alignItems="center" justifyContent="center">
             <Text color="blue.600" fontWeight="bold">Product Portfolio</Text>
          </Box>
        </VStack>
      </StatCard>
      
      <StatCard title="NPD Register (Pending)" count={data.npd?.count || 0} minWidth="400px">
        <TableChart 
          headers={['PART', 'FROM', 'DUE']}
          data={(data.npd?.data || []).slice(0, 5)}
          keys={['part', 'from', 'due']}
        />
      </StatCard>

      <StatCard title="Revision Control (In Revision)" count={data.revision?.count || 0} minWidth="400px">
        <TableChart 
          headers={['PART NO', 'PART NAME', 'DUE DATE']}
          data={(data.revision?.data || []).slice(0, 5)}
          keys={['partNo', 'partName', 'dueDate']}
        />
      </StatCard>
    </SimpleGrid>
  );

  const renderManufacturingDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <StatCard 
        title="Average OEE" 
        count={`${data.oee?.data?.averageOEE || 0}%`}
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <GaugeChart 
          value={data.oee?.data?.averageOEE || 0} 
          max={100} 
          label="Overall Efficiency" 
          color={data.oee?.data?.averageOEE > 65 ? "#38A169" : data.oee?.data?.averageOEE > 45 ? "#ECC94B" : "#E53E3E"}
        />
      </StatCard>

      <StatCard title="OEE Trend" minWidth="450px">
        <AreaChart 
          data={data.prodReport?.data || []} 
          xAxisKey="date" 
          dataKey="oee" 
          height={200}
        />
      </StatCard>

      <StatCard title="In House Quality" minWidth="350px">
        <VStack spacing={6} align="stretch" mt={2}>
           <HStack justify="space-around">
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">{data.inhouse?.data?.rejectionRatio || 0}%</Text>
                <Text fontSize="xs" color="gray.500">Rejection Ratio</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">{data.inhouse?.data?.actionPending || 0}</Text>
                <Text fontSize="xs" color="gray.500">Action Pending</Text>
              </VStack>
           </HStack>
           <CircleChart 
             data={[
               { name: 'Rejection', value: data.inhouse?.data?.rejectionRatio || 0, color: '#E53E3E' },
               { name: 'Rework', value: (data.inhouse?.data?.reworkPending / 100) || 0, color: '#3182ce' }
             ]}
           />
        </VStack>
      </StatCard>
    </SimpleGrid>
  );

  const renderQualityDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <StatCard title="Customer Complaints" count={data.custQual?.data?.actionPending || 0}>
         <GaugeChart 
           value={data.custQual?.data?.rejectionRate || 0} 
           max={10} 
           label="Cust Rejection Rate" 
           color="#e53e3e"
         />
      </StatCard>

      <StatCard title="Incoming Inspection" count={data.incoming?.data?.pendingCount || 0}>
        <VStack align="center" justify="center" h="100%" spacing={3}>
           <Box boxSize="120px" borderRadius="full" border="10px solid" borderColor="blue.500" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">{data.incoming?.data?.pendingCount || 0}</Text>
           </Box>
           <Text color="gray.500" fontWeight="bold">Pending Inspections</Text>
        </VStack>
      </StatCard>

      <StatCard title="Continuous Improvement" count={data.improvement?.data?.improvementCount || 0}>
        <VStack align="stretch" spacing={4} mt={4}>
           <Box p={4} bg="green.50" borderRadius="lg" border="1px dashed" borderColor="green.200">
              <Text fontSize="sm" color="green.700">Records documented for quality improvement initiatives.</Text>
           </Box>
           <HStack justify="center">
              <Badge colorScheme="green" variant="subtle" fontSize="md" py={1} px={3} borderRadius="full">Active Initiatives</Badge>
           </HStack>
        </VStack>
      </StatCard>

      <StatCard title="Quality Audits (Pending)" count={data.audits?.data?.totalPending || 0} minWidth="600px">
         <TableChart 
           headers={['DEPARTMENT', 'NCs', 'RESPONSIBLE', 'DUE']}
           data={(data.audits?.data?.table || []).slice(0, 5)}
           keys={['department', 'noOfNC', 'responsible', 'due']}
         />
      </StatCard>
    </SimpleGrid>
  );

  const renderHRDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <StatCard title="Employee Strength" count={data.overhead?.data?.actualOverHead || 0}>
        <VStack align="center" justify="center" h="100%">
           <SimpleGrid columns={2} spacing={10} w="100%">
              <VStack bg="blue.50" p={5} borderRadius="xl">
                 <Text fontSize="3xl" fontWeight="bold" color="blue.700">{data.overhead?.data?.actualOverHead || 0}</Text>
                 <Text fontSize="xs" color="blue.500" fontWeight="bold">Total Active</Text>
              </VStack>
              <VStack bg="green.50" p={5} borderRadius="xl">
                 <Text fontSize="3xl" fontWeight="bold" color="green.700">100%</Text>
                 <Text fontSize="xs" color="green.500" fontWeight="bold">Retention Rate</Text>
              </VStack>
           </SimpleGrid>
        </VStack>
      </StatCard>

      <StatCard title="Department Distribution" minWidth="400px">
         <DonutChart 
           data={data.attendance?.data || []} 
           nameKey="label" 
           dataKey="value"
         />
      </StatCard>
    </SimpleGrid>
  );

  const renderPurchaseDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <StatCard title="Pending Procurements" count={data.procurement?.data?.totalPending || 0} minWidth="500px">
         <TableChart 
           headers={['ITEM', 'PO NO', 'QTY']}
           data={(data.procurement?.data?.pendingRecords || []).slice(0, 5).map(row => ({
             item: row.items.find(i => i.key === 'ITEM NAME')?.value || 'N/A',
             po: row.items.find(i => i.key === 'PO NO')?.value || 'N/A',
             qty: row.items.find(i => i.key === 'QTY')?.value || '0'
           }))}
           keys={['item', 'po', 'qty']}
         />
      </StatCard>

      <StatCard title="Open Inward Payments" count={data.inward?.data?.totalOpen || 0} minWidth="500px">
        <TableChart 
           headers={['VENDOR', 'ITEM', 'PO NO']}
           data={(data.inward?.data?.openRecords || []).slice(0, 5).map(row => ({
             vendor: row.items.find(i => i.key === 'VENDOR NAME')?.value || 'N/A',
             item: row.items.find(i => i.key === 'ITEM NAME')?.value || 'N/A',
             po: row.items.find(i => i.key === 'PO NO')?.value || 'N/A'
           }))}
           keys={['vendor', 'item', 'po']}
         />
      </StatCard>
    </SimpleGrid>
  );

  const renderSalesDashboard = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
       <StatCard title="Customer Count" count={data.salesCust?.data?.totalCustomers || 0}>
          <VStack h="100%" justify="center">
             <Box p={6} bg="orange.50" borderRadius="full">
                <Text fontSize="4xl" fontWeight="bold" color="orange.600">{data.salesCust?.data?.totalCustomers || 0}</Text>
             </Box>
             <Text color="gray.500" fontWeight="bold">Total Registered Customers</Text>
          </VStack>
       </StatCard>

       <StatCard title="Sales Trend" minWidth="500px">
          <AreaChart 
            data={data.salesTrend?.data || []}
            xAxisKey="month"
            dataKey="value"
            color="#E53E3E"
          />
       </StatCard>

       <StatCard title="Quotation Status" count={data.quotation?.count || 0}>
          <DonutChart 
            data={Object.entries(data.quotation?.data || {}).map(([name, value]) => ({ name, value }))}
          />
       </StatCard>
    </SimpleGrid>
  );

  const renderContent = () => {
    const department = Content?.toLowerCase();
    switch (department) {
      case 'design':
        return renderDesignDashboard();
      case 'manufacturing':
        return renderManufacturingDashboard();
      case 'quality':
        return renderQualityDashboard();
      case 'hr':
      case 'human resources':
        return renderHRDashboard();
      case 'purchase':
        return renderPurchaseDashboard();
      case 'sales':
        return renderSalesDashboard();
      default:
        return (
          <Box py={10} textAlign="center">
            <Text color="gray.500" fontSize="lg">Select a department to view its dashboard.</Text>
          </Box>
        );
    }
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
            <Box>
                <Heading size="lg" color="blue.700">{Content} Dashboard</Heading>
                <Text color="gray.500">Real-time analytics and performance metrics for the {Content} department.</Text>
            </Box>
        </HStack>
        {renderContent()}
      </VStack>
    </Box>
  );
};

export default DepartmentDashboard;