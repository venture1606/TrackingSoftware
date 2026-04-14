import React, { useEffect, useState, useCallback } from "react";
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
  Flex,
} from "@chakra-ui/react";
import {
  getNPDRegister,
  getProductsDashboard,
  getRevisionControl,
  getProductSuccess,
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
  getMainDockets,
  getSettingsDashboard,
  getCalibrationDueDashboard,
  getProcessControlPlanDashboard,
  getCertificateRenewalDashboard,
} from "../services/dashboard";

// Import Dashboard Components
import StatCard from "../components/dashboard/StatCard";
import BarChart from "../components/dashboard/BarChart";
import AreaChart from "../components/dashboard/AreaChart";
import CircleChart from "../components/dashboard/CircleChart";
import DonutChart from "../components/dashboard/DonutChart";
import GaugeChart from "../components/dashboard/GaugeChart";
import TableChart from "../components/dashboard/TableChart";
import DashboardCardFilter from "../components/dashboard/DashboardCardFilter";

const DepartmentDashboard = ({ Content }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const toast = useToast();

  // DASHBOARD FILTERS STATE
  const [globalFilters, setGlobalFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = useCallback(
    async (deptName, filters = globalFilters) => {
      setLoading(true);
      const department = deptName?.toLowerCase();
      try {
        let dashboardData = {};

        // Convert string dates to timestamps for backend
        const startTimestamp = filters.startDate
          ? new Date(filters.startDate).getTime()
          : undefined;
        const endTimestamp = filters.endDate
          ? new Date(filters.endDate).getTime()
          : undefined;

        switch (department) {
          case "design":
            const [npd, products, revision, productSuccess] = await Promise.all([
              getNPDRegister(),
              getProductsDashboard(),
              getRevisionControl(),
              getProductSuccess(),
            ]);
            dashboardData = { npd, products, revision, productSuccess };
            break;

          case "manufacturing":
            const [oee, prodReport, inhouse, settings] = await Promise.all([
              getOEEDashboard(startTimestamp, endTimestamp),
              getProductionReport(startTimestamp, endTimestamp),
              getInhouseDashboard(startTimestamp, endTimestamp),
              getSettingsDashboard(startTimestamp, endTimestamp),
            ]);
            dashboardData = { oee, prodReport, inhouse, settings };
            break;

          case "quality":
            const [
              custQual,
              incoming,
              audits,
              improvement,
              calibration,
              pcp,
              certs,
            ] = await Promise.all([
              getCustomerQuality(startTimestamp, endTimestamp),
              getIncomingInspection(),
              getQualityAudits(),
              getContinuousImprovement(startTimestamp, endTimestamp),
              getCalibrationDueDashboard(),
              getProcessControlPlanDashboard(),
              getCertificateRenewalDashboard(),
            ]);
            dashboardData = {
              custQual,
              incoming,
              audits,
              improvement,
              calibration,
              pcp,
              certs,
            };
            break;

          case "hr":
          case "human resources":
            const [overhead, attendance] = await Promise.all([
              getEmployeeOverhead(),
              getEmployeeAttendance(startTimestamp, endTimestamp),
            ]);
            dashboardData = { overhead, attendance };
            break;

          case "purchase":
            const [procurement, inward] = await Promise.all([
              getProcurementDashboard(startTimestamp, endTimestamp),
              getInwardDashboard(startTimestamp, endTimestamp),
            ]);
            dashboardData = { procurement, inward };
            break;

          case "sales":
            const [
              salesCust,
              salesTrend,
              quotation,
              salesOrder,
              salesPay,
              salesTrail,
              dockets,
            ] = await Promise.all([
              getSalesCustomerCount(),
              getSalesTrend(startTimestamp, endTimestamp),
              getQuotationStatus(),
              getSalesOrderDetails(),
              getSalesPaymentAndDelivery(),
              getSalesTrailStatus(),
              getMainDockets(startTimestamp, endTimestamp),
            ]);
            dashboardData = {
              salesCust,
              salesTrend,
              quotation,
              salesOrder,
              salesPay,
              salesTrail,
              dockets,
            };
            break;

          default:
            dashboardData = {};
        }
        setData(dashboardData);
      } catch (error) {
        console.error(`Error fetching ${department} dashboard:`, error);
        toast({
          title: "Error fetching dashboard data",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (Content) {
      fetchData(Content);
    }
  }, [Content, fetchData]);

  const handleFilterApply = (filterValues) => {
    const newFilters = {
      startDate: filterValues.startDate,
      endDate: filterValues.endDate,
    };
    setGlobalFilters(newFilters);
    fetchData(Content, newFilters);
  };

  if (loading) {
    return (
      <Center h="100%" w="100%" bg="white" borderRadius="xl">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
          <Text color="gray.500" fontWeight="medium">
            Loading {Content} Dashboard...
          </Text>
        </VStack>
      </Center>
    );
  }

  const renderDesignDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Product Success Rate"
        count={`${((data.productSuccess?.data?.avgSuccessRate || 0) * 100).toFixed(2)}%`}
        minWidth="300px"
      >
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
              {((data.productSuccess?.data?.avgSuccessRate || 0) * 100).toFixed(1)}%
            </Text>
          </Box>
          <Text color="gray.500" fontWeight="bold" mt={2} fontSize="xs">
            Average Performance
          </Text>
        </VStack>
      </StatCard>

      <StatCard title="Total Products" count={data.products?.data?.totalProducts || 0} minWidth="300px">
        <VStack align="stretch" spacing={4} mt={4}>
          <HStack justify="space-between">
            <Text color="gray.600" fontSize="sm">
              Total BOMs
            </Text>
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              {data.products?.data?.totalBOM || 0}
            </Badge>
          </HStack>
          <Box
            h="100px"
            bg="blue.50"
            borderRadius="md"
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="blue.600" fontWeight="bold">
              Product Portfolio
            </Text>
          </Box>
        </VStack>
      </StatCard>

      <StatCard
        title="NPD Register (Pending)"
        count={data.npd?.count || 0}
        minWidth="400px"
      >
        <TableChart
          headers={["PART", "FROM", "DUE"]}
          data={(data.npd?.data || []).slice(0, 5)}
          keys={["part", "from", "due"]}
        />
      </StatCard>

      <StatCard
        title="Process Success"
        count={data.productSuccess?.data?.totalOpen || 0}
        minWidth="500px"
      >
        <TableChart
          headers={["PART NO", "SOLD", "RET", "SUC %"]}
          data={(data.productSuccess?.data?.openRecords || []).map((row) => {
            const items = row.items;
            const successRate =
              items.find((i) => i.key === "SUCCESS RATE")?.value || 0;
            return {
              partNo: items.find((i) => i.key === "PART NO")?.value || "-",
              sold: items.find((i) => i.key === "QTY SOLD")?.value || "0",
              returned: items.find((i) => i.key === "QTY RETURNED")?.value || "0",
              success: (Number(successRate) * 100).toFixed(1) + "%",
            };
          })}
          keys={["partNo", "sold", "returned", "success"]}
        />
      </StatCard>

      <StatCard
        title="Revision Control (In Revision)"
        count={data.revision?.count || 0}
        minWidth="400px"
      >
        <TableChart
          headers={["PART NO", "PART NAME", "DUE DATE"]}
          data={(data.revision?.data || []).slice(0, 5)}
          keys={["partNo", "partName", "dueDate"]}
        />
      </StatCard>
    </Flex>
  );

  const renderManufacturingDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Average OEE"
        count={`${data.oee?.data?.averageOEE || 0}%`}
        minWidth="300px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <GaugeChart
          value={data.oee?.data?.averageOEE || 0}
          max={100}
          label="Overall Efficiency"
          color={
            data.oee?.data?.averageOEE > 65
              ? "#38A169"
              : data.oee?.data?.averageOEE > 45
                ? "#ECC94B"
                : "#E53E3E"
          }
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

      <StatCard
        title="In House Rejection & Action"
        minWidth="340px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <HStack justify="space-around" align="center" py={4}>
          <VStack bg="red.50" p={4} borderRadius="xl" minW="130px" spacing={1}>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color="red.600"
              lineHeight={1}
            >
              {data.inhouse?.data?.rejectionRatio || 0}%
            </Text>
            <Text
              fontSize="11px"
              fontWeight="bold"
              color="red.400"
              textTransform="uppercase"
              textAlign="center"
            >
              Rejection
              <br />
              Ratio
            </Text>
          </VStack>
          <VStack
            bg="orange.50"
            p={4}
            borderRadius="xl"
            minW="130px"
            spacing={1}
          >
            <Text
              fontSize="3xl"
              fontWeight="black"
              color="orange.600"
              lineHeight={1}
            >
              {data.inhouse?.data?.actionPending || 0}
            </Text>
            <Text
              fontSize="11px"
              fontWeight="bold"
              color="orange.400"
              textTransform="uppercase"
              textAlign="center"
            >
              Action
              <br />
              Pending
            </Text>
          </VStack>
        </HStack>
      </StatCard>

      <StatCard
        title="In House Rework Status"
        minWidth="200px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <VStack justify="center" h="100%" py={2}>
          <Box
            bg="blue.50"
            p={5}
            borderRadius="2xl"
            textAlign="center"
            minW="140px"
          >
            <Text
              fontSize="4xl"
              fontWeight="black"
              color="blue.600"
              lineHeight={1}
            >
              {data.inhouse?.data?.reworkPending || 0}
            </Text>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="blue.400"
              mt={2}
              textTransform="uppercase"
            >
              Rework Pending
            </Text>
          </Box>
        </VStack>
      </StatCard>
      <StatCard
        title="Settings Performance"
        count={data.settings?.data?.noOfSettings || 0}
        minWidth="350px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <HStack justify="space-around" align="center" py={4} w="100%">
          <VStack bg="purple.50" p={4} borderRadius="xl" minW="135px" spacing={1}>
            <Text fontSize="2xl" fontWeight="black" color="purple.600">
              {data.settings?.data?.averageSettingTime || 0}
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="purple.400" textTransform="uppercase" textAlign="center">
              Avg Setting<br />Time (min)
            </Text>
          </VStack>
          <VStack bg="teal.50" p={4} borderRadius="xl" minW="135px" spacing={1}>
            <Text fontSize="2xl" fontWeight="black" color="teal.600">
              {data.settings?.data?.avgSetupLoss || 0}
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="teal.400" textTransform="uppercase" textAlign="center">
              Avg Setup<br />Loss (qty)
            </Text>
          </VStack>
        </HStack>
      </StatCard>
      
    </Flex>
  );

  const renderQualityDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Customer Complaints"
        minWidth="300px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <HStack w="100%" h="100%" justify="space-around" align="center" py={4}>
          <VStack bg="red.50" p={4} borderRadius="xl" minW="110px" spacing={1}>
            <Text
              fontSize="3xl"
              fontWeight="black"
              color="red.600"
              lineHeight={1}
            >
              {data.custQual?.data?.rejectionRate || 0}%
            </Text>
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="red.400"
              textTransform="uppercase"
              textAlign="center"
            >
              Rejection
              <br />
              Rate
            </Text>
          </VStack>
          <VStack
            bg="orange.50"
            p={4}
            borderRadius="xl"
            minW="110px"
            spacing={1}
          >
            <Text
              fontSize="3xl"
              fontWeight="black"
              color="orange.600"
              lineHeight={1}
            >
              {data.custQual?.data?.actionPending || 0}
            </Text>
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="orange.400"
              textTransform="uppercase"
              textAlign="center"
            >
              Action
              <br />
              Pending
            </Text>
          </VStack>
        </HStack>
      </StatCard>

      <StatCard
        title="Incoming Inspection"
        count={data.incoming?.data?.pendingCount || 0}
        minWidth="300px"
      >
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
              {data.incoming?.data?.pendingCount || 0}
            </Text>
          </Box>
          <Text color="gray.500" fontWeight="bold">
            Pending Inspections
          </Text>
        </VStack>
      </StatCard>

      <StatCard
        title="Continuous Improvement"
        minWidth="300px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <VStack justify="center" h="100%" py={4}>
          <Box
            bg="green.50"
            p={6}
            borderRadius="2xl"
            textAlign="center"
            minW="200px"
          >
            <Text
              fontSize="4xl"
              fontWeight="black"
              color="green.600"
              lineHeight={1}
            >
              {data.improvement?.data?.improvementCount || 0}
            </Text>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="green.400"
              mt={2}
              textTransform="uppercase"
            >
              Improvement Initiatives
            </Text>
          </Box>
        </VStack>
      </StatCard>

      <StatCard
        title="Quality Audits (Pending)"
        count={data.audits?.data?.totalPending || 0}
        minWidth="600px"
      >
        <TableChart
          headers={["DEPARTMENT", "NCs", "RESPONSIBLE", "DUE"]}
          data={(data.audits?.data?.table || []).slice(0, 5)}
          keys={["department", "noOfNC", "responsible", "due"]}
        />
      </StatCard>

      <StatCard
        title="Calibration Due Status"
        count={data.calibration?.data?.totalFiltered || 0}
        minWidth="400px"
      >
        <VStack spacing={4} align="stretch" w="100%">
          <HStack spacing={4} justify="start" pb={2}>
            <Box bg="green.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="green.100" minW="100px">
              <Text fontSize="xs" fontWeight="bold" color="green.600">DONE</Text>
              <Text fontSize="2xl" fontWeight="black" color="green.700" lineHeight={1}>
                {data.calibration?.data?.doneCount || 0}
              </Text>
            </Box>
            <Box bg="red.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="red.100" minW="100px">
              <Text fontSize="xs" fontWeight="bold" color="red.600">DUE</Text>
              <Text fontSize="2xl" fontWeight="black" color="red.700" lineHeight={1}>
                {data.calibration?.data?.dueCount || 0}
              </Text>
            </Box>
          </HStack>

          <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
             <TableChart
               headers={["INSTRUMENT", "LAST DATE", "DUE DATE"]}
               data={(data.calibration?.data?.openRecords || []).slice(0, 5).map(row => {
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
      </StatCard>
      <StatCard
        title="Process Control Plan"
        count={data.pcp?.data?.totalRecords || 0}
        minWidth="400px"
      >
        <VStack spacing={4} align="stretch" w="100%">
          <HStack spacing={4} justify="start" pb={2}>
             <Box bg="orange.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="orange.100" minW="150px">
                <Text fontSize="xs" fontWeight="bold" color="orange.600">PENDING UPLOADS</Text>
                <Text fontSize="2xl" fontWeight="black" color="orange.700" lineHeight={1}>
                  {data.pcp?.data?.pendingCount || 0}
                </Text>
             </Box>
             <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400">TOTAL RECORDS</Text>
                <Text fontSize="md" fontWeight="bold" color="gray.600">
                  {data.pcp?.data?.totalRecords || 0}
                </Text>
             </VStack>
          </HStack>

          <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
             <TableChart
               headers={["NAME", "DATE", "REV NO"]}
               data={(data.pcp?.data?.pendingRecords || []).slice(0, 5).map(row => {
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
      </StatCard>
      <StatCard
        title="Certificate Renewal Status"
        count={(data.certs?.data || []).filter(c => c.isDue).length}
        minWidth="600px"
      >
        <VStack spacing={4} align="stretch" w="100%">
          <HStack spacing={4} justify="start" pb={2}>
             <Box bg="purple.50" px={4} py={2} borderRadius="lg" border="1px solid" borderColor="purple.100" minW="150px">
                <Text fontSize="xs" fontWeight="bold" color="purple.600">ACTION REQUIRED</Text>
                <Text fontSize="2xl" fontWeight="black" color="purple.700" lineHeight={1}>
                  {(data.certs?.data || []).filter(c => c.isDue).length}
                </Text>
             </Box>
          </HStack>

          <Box overflowX="auto" borderTop="1px solid" borderColor="gray.100" pt={4}>
             <TableChart
               headers={["CERTIFICATE NAME", "DEPT", "DUE DATE", "REMINDER"]}
               data={(data.certs?.data || []).slice(0, 5).map(c => {
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
      </StatCard>
    </Flex>
  );

  const renderHRDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Employee Strength"
        count={data.overhead?.data?.actualOverHead || 0}
        minWidth="350px"
      >
        <VStack align="center" justify="center" h="100%">
          <SimpleGrid columns={2} spacing={10} w="100%">
            <VStack bg="blue.50" p={5} borderRadius="xl">
              <Text fontSize="3xl" fontWeight="bold" color="blue.700">
                {data.overhead?.data?.actualOverHead || 0}
              </Text>
              <Text fontSize="xs" color="blue.500" fontWeight="bold">
                Total Active
              </Text>
            </VStack>
            <VStack bg="green.50" p={5} borderRadius="xl">
              <Text fontSize="3xl" fontWeight="bold" color="green.700">
                100%
              </Text>
              <Text fontSize="xs" color="green.500" fontWeight="bold">
                Retention Rate
              </Text>
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
    </Flex>
  );

  const renderPurchaseDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Pending Procurements"
        count={data.procurement?.data?.totalPending || 0}
        minWidth="500px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <TableChart
          headers={[
            "PO NUMBER",
            "ITEM NAME",
            "VENDOR",
            "QTY",
            "SUPPLY DATE",
            "DUE",
          ]}
          data={(data.procurement?.data?.pendingRecords || []).map((row) => {
            const items = row.items;
            const dateVal = items.find((i) => i.key === "DATE")?.value;

            // Calculate Due
            let due = "-";
            if (dateVal && !isNaN(dateVal)) {
              const diffDays = Math.ceil(
                (Number(dateVal) - Date.now()) / (1000 * 60 * 60 * 24),
              );
              due =
                diffDays > 0
                  ? `${diffDays} days`
                  : diffDays < 0
                    ? `${Math.abs(diffDays)} days ago`
                    : "Today";
            }

            return {
              po: items.find((i) => i.key === "PO NO")?.value || "-",
              item: items.find((i) => i.key === "ITEM NAME")?.value || "-",
              vendor: items.find((i) => i.key === "VENDOR-NAME")?.value || "-",
              qty: items.find((i) => i.key === "QTY")?.value || "0",
              supplyDate:
                dateVal && !isNaN(dateVal)
                  ? new Date(Number(dateVal)).toLocaleDateString()
                  : "-",
              due,
            };
          })}
          keys={["po", "item", "vendor", "qty", "supplyDate", "due"]}
        />
      </StatCard>

      <StatCard
        title="Open Inward Payments"
        count={data.inward?.data?.totalOpen || 0}
        minWidth="500px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <TableChart
          headers={["VENDOR", "INVOICE", "VALUE", "PAYMENT DATE", "DUE"]}
          data={(data.inward?.data?.openRecords || []).map((row) => {
            const items = row.items;
            const dateVal = items.find((i) => i.key === "DELIVERY DATE")?.value;

            let due = "-";
            if (dateVal && !isNaN(dateVal)) {
              const diffDays = Math.ceil(
                (Number(dateVal) - Date.now()) / (1000 * 60 * 60 * 24),
              );
              due =
                diffDays > 0
                  ? `${diffDays} days`
                  : diffDays < 0
                    ? `${Math.abs(diffDays)} days ago`
                    : "Today";
            }

            return {
              vendor: items.find((i) => i.key === "VENDOR NAME")?.value || "-",
              invoice: items.find((i) => i.key === "INVOICE NO")?.value || "-",
              value: items.find((i) => i.key === "VALUE")?.value || "-",
              paymentDate:
                dateVal && !isNaN(dateVal)
                  ? new Date(Number(dateVal)).toLocaleDateString()
                  : "-",
              due,
            };
          })}
          keys={["vendor", "invoice", "value", "paymentDate", "due"]}
        />
      </StatCard>
    </Flex>
  );

  const renderSalesDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Customer Count"
        count={data.salesCust?.data?.totalCustomers || 0}
        minWidth="300px"
      >
        <VStack h="100%" justify="center">
          <Box p={6} bg="orange.50" borderRadius="full">
            <Text fontSize="4xl" fontWeight="bold" color="orange.600">
              {data.salesCust?.data?.totalCustomers || 0}
            </Text>
          </Box>
          <Text color="gray.500" fontWeight="bold">
            Total Registered Customers
          </Text>
        </VStack>
      </StatCard>

      <StatCard title="Sales Trend" minWidth="300px">
        <AreaChart
          data={data.salesTrend?.data || []}
          xAxisKey="month"
          dataKey="value"
          color="#E53E3E"
        />
      </StatCard>

      <StatCard
        title="Customer Payment Status"
        count={data.dockets?.data?.totalOpen || 0}
        minWidth="500px"
        headerRight={<DashboardCardFilter onApply={handleFilterApply} />}
      >
        <TableChart
          headers={["CUSTOMER NAME", "INVOICE", "VALUE", "PAYMENT DATE", "DUE"]}
          data={(data.dockets?.data?.openRecords || []).map((row) => {
            const items = row.items;
            const dateVal = items.find((i) => i.key === "DELIVERY DATE")?.value;

            let due = "-";
            if (dateVal && !isNaN(dateVal)) {
              // Add 2 more days to Delivery Date for due calculation
              const dueDate = Number(dateVal) + 2 * 24 * 60 * 60 * 1000;
              const diffDays = Math.ceil(
                (dueDate - Date.now()) / (1000 * 60 * 60 * 24),
              );
              due =
                diffDays > 0
                  ? `${diffDays} days`
                  : diffDays < 0
                    ? `${Math.abs(diffDays)} days ago`
                    : "Today";
            }

            return {
              vendor: items.find((i) => i.key === "CUSTOMER NAME")?.value || "-",
              invoice: items.find((i) => i.key === "INVOICE NO")?.value || "-",
              value: items.find((i) => i.key === "VALUE")?.value || "-",
              date:
                dateVal && !isNaN(dateVal)
                  ? new Date(Number(dateVal)).toLocaleDateString()
                  : "-",
              due,
            };
          })}
          keys={["vendor", "invoice", "value", "date", "due"]}
        />
      </StatCard>

      <StatCard
        title="Quotation Status"
        count={data.quotation?.count || 0}
        minWidth="300px"
      >
        <DonutChart
          data={Object.entries(data.quotation?.data || {}).map(
            ([name, value]) => ({ name, value }),
          )}
        />
      </StatCard>
    </Flex>
  );

  const renderContent = () => {
    const department = Content?.toLowerCase();
    switch (department) {
      case "design":
        return renderDesignDashboard();
      case "manufacturing":
        return renderManufacturingDashboard();
      case "quality":
        return renderQualityDashboard();
      case "hr":
      case "human resources":
        return renderHRDashboard();
      case "purchase":
        return renderPurchaseDashboard();
      case "sales":
        return renderSalesDashboard();
      default:
        return (
          <Box py={10} textAlign="center">
            <Text color="gray.500" fontSize="lg">
              Select a department to view its dashboard.
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" color="blue.700">
              {Content} Dashboard
            </Heading>
            <Text color="gray.500">
              Real-time analytics and performance metrics for the {Content}{" "}
              department.
            </Text>
          </Box>
        </HStack>
        {renderContent()}
      </VStack>
    </Box>
  );
};

export default DepartmentDashboard;
