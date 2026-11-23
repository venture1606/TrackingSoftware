import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Select,
  Input,
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Center,
  useToast,
  Flex,
} from "@chakra-ui/react";
import {
  getDesignDashboard,
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
  getSalesDashboard,
  getSettingsDashboard,
  getCalibrationDueDashboard,
  getProcessControlPlanDashboard,
  getCertificateRenewalDashboard,
  getDashboardStock,
} from "../services/dashboard";

// Import Dashboard Components
import StatCard from "../components/dashboard/StatCard";
import InstrumentStatusBody from "../components/dashboard/InstrumentStatusBody";
import AreaChart from "../components/dashboard/AreaChart";
import DonutChart from "../components/dashboard/DonutChart";
import GaugeChart from "../components/dashboard/GaugeChart";
import TableChart from "../components/dashboard/TableChart";
import LineChart from "../components/dashboard/LineChart";
import BarChart from "../components/dashboard/BarChart";
import DashboardCardFilter from "../components/dashboard/DashboardCardFilter";
import { formatEpochDate, toDayRange, toInputDate, last30Days } from "../utils/dateUtils";
import { DESIGN_INFO, SALES_INFO, MANUFACTURING_INFO, QUALITY_INFO, HR_INFO, PURCHASE_INFO, STOCK_INFO } from "../utils/dashboardInfo";

const DepartmentDashboard = ({ Content }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const toast = useToast();

  // PER-CARD DATE RANGES: { [cardKey]: { startDate, endDate } } ("YYYY-MM-DD").
  // A card without an entry uses the default: the last 30 days (both days included).
  const [cardRanges, setCardRanges] = useState({});

  // SALES TREND FILTERS (group by day / month / year, date range, ENQ BY)
  const [salesTrendFilters, setSalesTrendFilters] = useState(() => ({
    groupBy: "month",
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: toInputDate(),
    enqBy: "",
  }));
  const salesTrendFiltersRef = useRef(salesTrendFilters);
  const [trendLoading, setTrendLoading] = useState(false);

  const salesTrendParams = (f) => ({
    groupBy: f.groupBy,
    startDate: f.startDate ? new Date(`${f.startDate}T00:00:00`).getTime() : undefined,
    endDate: f.endDate ? new Date(`${f.endDate}T23:59:59.999`).getTime() : undefined,
    enqBy: f.enqBy || undefined,
  });

  const updateSalesTrendFilter = async (patch) => {
    const next = { ...salesTrendFiltersRef.current, ...patch };
    salesTrendFiltersRef.current = next;
    setSalesTrendFilters(next);
    setTrendLoading(true);
    try {
      const res = await getSalesDashboard(salesTrendParams(next));
      setData((prev) => ({
        ...prev,
        sales: { ...(prev.sales || {}), salesTrend: res?.data?.salesTrend },
      }));
    } catch (error) {
      toast({
        title: "Error fetching sales trend",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchData = useCallback(
    async (deptName) => {
      setLoading(true);
      const department = deptName?.toLowerCase();
      try {
        let dashboardData = {};

        // Initial load: every date-aware card starts on the default range (last 30 days)
        const def = last30Days();
        const { startTimestamp, endTimestamp } = toDayRange(def.startDate, def.endDate);

        switch (department) {
          case "design":
            const design = await getDesignDashboard();
            dashboardData = { design: design?.data || {} };
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
            const sales = await getSalesDashboard(
              salesTrendParams(salesTrendFiltersRef.current),
            );
            dashboardData = { sales: sales?.data || {} };
            break;

          case "stock":
          case "store":
          case "stores":
            const stock = await getDashboardStock();
            dashboardData = { stock: stock?.data || stock || {} };
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
      setCardRanges({});
      fetchData(Content);
    }
  }, [Content, fetchData]);

  // Re-fetch ONE card for its own date range (Clear → back to the last 30 days)
  const CARD_FETCHERS = {
    oee: [getOEEDashboard, "oee"],
    oeeTrend: [getProductionReport, "prodReport"],
    rejection: [getInhouseDashboard, "inhouse"],
    customerComplaints: [getCustomerQuality, "custQual"],
    improvement: [getContinuousImprovement, "improvement"],
    departmentDistribution: [getEmployeeAttendance, "attendance"],
    procurement: [getProcurementDashboard, "procurement"],
    inward: [getInwardDashboard, "inward"],
  };

  const applyCardRange = (cardKey) => async ({ startDate, endDate }) => {
    const custom = startDate || endDate ? { startDate, endDate } : null;
    setCardRanges((prev) => {
      const next = { ...prev };
      if (custom) next[cardKey] = custom;
      else delete next[cardKey];
      return next;
    });
    const range = custom || last30Days();
    const { startTimestamp, endTimestamp } = toDayRange(range.startDate, range.endDate);
    const [fetcher, slot] = CARD_FETCHERS[cardKey];
    try {
      const res = await fetcher(startTimestamp, endTimestamp);
      setData((prev) => ({ ...prev, [slot]: res }));
    } catch (error) {
      toast({
        title: "Error applying date filter",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cardFilter = (cardKey) => (
    <DashboardCardFilter
      onApply={applyCardRange(cardKey)}
      value={cardRanges[cardKey]}
      defaultLabel="the last 30 days"
    />
  );

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

  const renderDesignDashboard = () => {
    const design = data.design || {};
    const counts = design.productCounts || {};
    const success = design.productSuccess || {};
    const avg = Number(success.avgSuccessRate) || 0;
    const revision = design.revision || {};
    const npd = design.npd || {};

    const CountTile = ({ label, value, source }) => (
      <VStack
        flex="1 1 140px"
        bg="blue.50"
        border="1px solid"
        borderColor="blue.100"
        borderRadius="xl"
        p={4}
        spacing={2}
      >
        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" textAlign="center">
          {label}
        </Text>
        <Text fontSize="4xl" fontWeight="black" color="blue.700" lineHeight={1}>
          {value ?? 0}
        </Text>
        <Text fontSize="10px" color="gray.500" textAlign="center">
          {source}
        </Text>
      </VStack>
    );

    return (
      <Flex wrap="wrap" gap={6}>
        <StatCard title="Products" info={DESIGN_INFO.products} minWidth={{ base: "100%", md: "420px" }}>
          <Flex gap={4} wrap="wrap" align="stretch" h="100%">
            <CountTile label="Count of Series" value={counts.seriesCount} source="Product List · SERIES" />
            <CountTile label="Count of Main Product" value={counts.mainProductCount} source="Product List · PART NO" />
            <CountTile label="Count of Sub Product" value={counts.subProductCount} source="Products · PART NO" />
          </Flex>
        </StatCard>

        <StatCard
          title="Product Success Rate"
          info={DESIGN_INFO.productSuccess}
          count={success.totalRecords || 0}
          minWidth={{ base: "100%", lg: "600px" }}
        >
          <Flex gap={4} direction={{ base: "column", md: "row" }} align="center">
            <VStack minW="200px" spacing={0}>
              <DonutChart
                data={[
                  { name: "Success %", value: avg },
                  { name: "Returned %", value: Number((100 - avg).toFixed(2)) },
                ]}
                height={180}
              />
              <Text fontSize="2xl" fontWeight="black" color="green.600">
                {avg}%
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="gray.500">
                Average success rate
              </Text>
            </VStack>
            <Box flex="1" w="100%">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                LOWEST 5 SUCCESS RATES
              </Text>
              <TableChart
                headers={["SERIES", "PART NO", "PART NAME", "QTY SOLD", "QTY RETURNED", "SUCCESS RATE"]}
                data={(success.lowest || []).map((r) => ({
                  ...r,
                  successRate: `${r.successRate}%`,
                }))}
                keys={["series", "partNo", "partName", "qtySold", "qtyReturned", "successRate"]}
              />
            </Box>
          </Flex>
        </StatCard>

        <StatCard
          title="Revision Control (In Revision)"
          info={DESIGN_INFO.revision}
          count={revision.count || 0}
          minWidth={{ base: "100%", lg: "500px" }}
        >
          {(revision.rows || []).length ? (
            <TableChart
              headers={["PART NO", "PROBLEM DESCRIPTION", "ENTERED", "DUE"]}
              data={(revision.rows || []).map((r) => ({
                ...r,
                date: formatEpochDate(r.date),
              }))}
              keys={["partNo", "problemDescription", "date", "due"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">No parts in revision.</Text>
            </Center>
          )}
        </StatCard>

        <StatCard
          title="NPD Register (Pending)"
          info={DESIGN_INFO.npd}
          count={npd.count || 0}
          minWidth={{ base: "100%", lg: "600px" }}
        >
          <TableChart
            headers={["FROM", "TARGET DATE", "PART", "PROTO", "VALIDATION", "MASTER", "DUE"]}
            data={(npd.rows || []).map((r) => ({
              ...r,
              targetDate: r.targetDate ? formatEpochDate(r.targetDate) : "-",
            }))}
            keys={["from", "targetDate", "part", "proto", "validation", "master", "due"]}
          />
        </StatCard>
      </Flex>
    );
  };

  const renderManufacturingDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Average OEE"
            info={MANUFACTURING_INFO.averageOEE}
        count={`${data.oee?.data?.averageOEE || 0}%`}
        minWidth={{ base: "100%", md: "300px" }}
        headerRight={cardFilter("oee")}
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

      <StatCard title="OEE Trend"
            info={MANUFACTURING_INFO.oeeTrend}
            headerRight={cardFilter("oeeTrend")} minWidth={{ base: "100%", lg: "450px" }}>
        <AreaChart
          data={data.prodReport?.data || []}
          xAxisKey="date"
          dataKey="oee"
          height={200}
        />
      </StatCard>

      <StatCard
        title="Rejection"
            info={MANUFACTURING_INFO.rejection}
        minWidth={{ base: "100%", md: "340px" }}
        headerRight={cardFilter("rejection")}
      >
        <Flex 
          justify="space-around" 
          align="center" 
          py={4} 
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
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
        </Flex>
      </StatCard>

      <StatCard
        title="Rework Status"
            info={MANUFACTURING_INFO.rework}
        minWidth={{ base: "100%", sm: "200px" }}
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
            info={MANUFACTURING_INFO.settings}
        count={data.settings?.data?.noOfSettings || 0}
        minWidth={{ base: "100%", md: "350px" }}
      >
        <Flex 
          justify="space-around" 
          align="center" 
          py={4} 
          w="100%"
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
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
        </Flex>
      </StatCard>
      
    </Flex>
  );

  const renderQualityDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Customer Complaints"
            info={QUALITY_INFO.customerComplaints}
        minWidth={{ base: "100%", md: "300px" }}
        headerRight={cardFilter("customerComplaints")}
      >
        <Flex 
          w="100%" 
          h="100%" 
          justify="space-around" 
          align="center" 
          py={4}
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
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
        </Flex>
      </StatCard>

      <StatCard
        title="Incoming Inspection"
            info={QUALITY_INFO.incomingInspection}
        count={data.incoming?.data?.pendingCount || 0}
        minWidth={{ base: "100%", md: "300px" }}
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
            info={QUALITY_INFO.continuousImprovement}
        minWidth={{ base: "100%", md: "300px" }}
        headerRight={cardFilter("improvement")}
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
            info={QUALITY_INFO.qualityAudits}
        count={data.audits?.data?.totalPending || 0}
        minWidth={{ base: "100%", lg: "600px" }}
      >
        <TableChart
          headers={["DEPARTMENT", "NCs", "RESPONSIBLE", "DUE"]}
          data={(data.audits?.data?.table || []).slice(0, 5)}
          keys={["department", "noOfNC", "responsible", "due"]}
        />
      </StatCard>

      <StatCard
        title="Instrument Status"
            info={QUALITY_INFO.instruments}
        count={data.calibration?.data?.totalFiltered || 0}
        minWidth={{ base: "100%", md: "400px" }}
      >
        <InstrumentStatusBody data={data.calibration?.data} />
      </StatCard>
      <StatCard
        title="Process Control Plan"
            info={QUALITY_INFO.processControlPlan}
        count={data.pcp?.data?.totalRecords || 0}
        minWidth={{ base: "100%", md: "400px" }}
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
                 return {
                   name: items.find(i => i.key.includes("INSTRUMENT") || i.key.includes("NAME") || i.key.includes("PART"))?.value || items[0]?.value || "-",
                   date: formatEpochDate(items.find(i => i.key === "DATE")?.value),
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
            info={QUALITY_INFO.certificates}
        count={(data.certs?.data || []).filter(c => c.isDue).length}
        minWidth={{ base: "100%", lg: "600px" }}
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
                 return {
                   ...c,
                   dueDate: formatEpochDate(c.dueDate),
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
            info={HR_INFO.employeeStrength}
        count={data.overhead?.data?.actualOverHead || 0}
        minWidth={{ base: "100%", md: "350px" }}
      >
        <VStack align="center" justify="center" h="100%">
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={10} w="100%">
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
                {data.overhead?.data?.retentionRate != null
                  ? `${data.overhead.data.retentionRate}%`
                  : "—"}
              </Text>
              <Text fontSize="xs" color="green.500" fontWeight="bold">
                Retention Rate (12 months)
              </Text>
              {data.overhead?.data?.retentionBase > 0 && (
                <Text fontSize="10px" color="gray.500" textAlign="center">
                  {data.overhead.data.leftInLast12Months} of {data.overhead.data.retentionBase} left
                </Text>
              )}
            </VStack>
          </SimpleGrid>
        </VStack>
      </StatCard>

      <StatCard title="Department Distribution"
            info={HR_INFO.departmentDistribution}
            headerRight={cardFilter("departmentDistribution")} minWidth={{ base: "100%", md: "400px" }}>
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
            info={PURCHASE_INFO.pendingProcurements}
        count={data.procurement?.data?.totalPending || 0}
        minWidth={{ base: "100%", lg: "500px" }}
        headerRight={cardFilter("procurement")}
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
            const leadTime = Number(items.find((i) => i.key === "LEAD TIME")?.value) || 0;

            // Calculate Due
            let due = "-";
            if (dateVal && !isNaN(dateVal)) {
              const deliveryDate = Number(dateVal) + (leadTime * 24 * 60 * 60 * 1000);
              const diffDays = Math.ceil(
                (deliveryDate - Date.now()) / (1000 * 60 * 60 * 24),
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
            info={PURCHASE_INFO.inwardPayments}
        count={data.inward?.data?.totalOpen || 0}
        minWidth={{ base: "100%", lg: "500px" }}
        headerRight={cardFilter("inward")}
      >
        <TableChart
          headers={["VENDOR", "INVOICE", "VALUE", "PAYMENT DATE", "DUE"]}
          data={(data.inward?.data?.openRecords || []).map((row) => {
            const items = row.items;
            const dateVal = items.find((i) => i.key === "DELIVERY DATE")?.value;
            const creditPeriod = Number(items.find((i) => i.key === "CREDIT PERIOD")?.value) || 0;

            let due = "-";
            if (dateVal && !isNaN(dateVal)) {
              const dueDate = Number(dateVal) + (creditPeriod * 24 * 60 * 60 * 1000);
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

  const renderSalesDashboard = () => {
    const sales = data.sales || {};
    const quotation = sales.quotation || {};
    const trend = sales.salesTrend || {};
    const trendData = trend.data || [];
    const pendingOrders = sales.pendingOrders || {};
    const pendingPayments = sales.pendingPayments || {};
    const money = (n) =>
      Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

    const BigCount = ({ label, value, color = "blue" }) => (
      <VStack
        flex="1 1 140px"
        bg={`${color}.50`}
        border="1px solid"
        borderColor={`${color}.100`}
        borderRadius="xl"
        p={4}
        spacing={2}
        justify="center"
      >
        <Text fontSize="xs" fontWeight="bold" color={`${color}.600`} textTransform="uppercase" textAlign="center">
          {label}
        </Text>
        <Text fontSize="4xl" fontWeight="black" color={`${color}.700`} lineHeight={1}>
          {value ?? 0}
        </Text>
      </VStack>
    );

    return (
      <Flex wrap="wrap" gap={6}>
        <StatCard title="Customer Count" info={SALES_INFO.customerCount} minWidth={{ base: "100%", md: "240px" }}>
          <Flex h="100%" align="stretch">
            <BigCount label="Count of Customers" value={sales.customerCount} color="orange" />
          </Flex>
        </StatCard>

        <StatCard title="Sales Trend (Dockets)" info={SALES_INFO.salesTrend} minWidth={{ base: "100%", lg: "640px" }}>
          <Flex gap={2} wrap="wrap" mb={4} align="center">
            <Select
              size="sm"
              w="120px"
              value={salesTrendFilters.groupBy}
              onChange={(e) => updateSalesTrendFilter({ groupBy: e.target.value })}
            >
              <option value="day">Date wise</option>
              <option value="month">Month wise</option>
              <option value="year">Year wise</option>
            </Select>
            <Input
              size="sm"
              type="date"
              w="150px"
              value={salesTrendFilters.startDate}
              onChange={(e) => updateSalesTrendFilter({ startDate: e.target.value })}
            />
            <Text fontSize="sm" color="gray.500">to</Text>
            <Input
              size="sm"
              type="date"
              w="150px"
              value={salesTrendFilters.endDate}
              onChange={(e) => updateSalesTrendFilter({ endDate: e.target.value })}
            />
            <Select
              size="sm"
              w="150px"
              placeholder="All ENQ BY"
              value={salesTrendFilters.enqBy}
              onChange={(e) => updateSalesTrendFilter({ enqBy: e.target.value })}
            >
              {(trend.enqByOptions || []).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            {trendLoading && <Spinner size="sm" color="blue.500" />}
          </Flex>
          {trendData.length ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="red.500" mb={1}>
                  VALUE
                </Text>
                <LineChart data={trendData} xAxisKey="period" dataKey="value" height={200} />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="red.500" mb={1}>
                  DELIVERY QTY
                </Text>
                <BarChart
                  data={trendData}
                  xAxisKey="period"
                  dataKeys={[{ key: "deliveryQty", name: "Delivery Qty", color: "#3182ce" }]}
                  height={200}
                />
              </Box>
            </SimpleGrid>
          ) : (
            <Center h="200px">
              <Text color="gray.500" fontSize="sm">
                No dockets delivered in this period.
              </Text>
            </Center>
          )}
        </StatCard>

        <StatCard title="Quote / Order Status" info={SALES_INFO.quotation} minWidth={{ base: "100%", md: "340px" }}>
          <Flex gap={4} wrap="wrap" h="100%" align="stretch">
            <BigCount label="Waiting for Order" value={quotation.waitingForOrder} color="green" />
            <BigCount label="Waiting for Quote" value={quotation.waitingForQuote} color="purple" />
          </Flex>
        </StatCard>

        <StatCard
          title="Pending Order"
          info={SALES_INFO.pendingOrders}
          count={pendingOrders.count || 0}
          minWidth={{ base: "100%", lg: "600px" }}
        >
          <TableChart
            headers={["CUSTOMER", "PART NAME", "PART NUMBER", "PENDING QTY", "PENDING QTY VALUE", "DUE"]}
            data={(pendingOrders.rows || []).map((r) => ({
              ...r,
              pendingValue: money(r.pendingValue),
              due: r.leadTimeMissing && r.dueDate ? `${r.due} (no lead time)` : r.due,
            }))}
            keys={["customer", "partName", "partNo", "pendingQty", "pendingValue", "due"]}
          />
        </StatCard>

        <StatCard
          title="Pending Payment"
          info={SALES_INFO.pendingPayments}
          count={pendingPayments.count || 0}
          minWidth={{ base: "100%", lg: "600px" }}
        >
          {(pendingPayments.rows || []).length ? (
            <TableChart
              headers={["CUSTOMER", "PART NUMBER", "VALUE", "CREDIT PERIOD", "DUE"]}
              data={(pendingPayments.rows || []).map((r) => ({
                ...r,
                value: money(r.value),
                creditPeriod: `${r.creditPeriod} days`,
              }))}
              keys={["customer", "partNo", "value", "creditPeriod", "due"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">No open payments.</Text>
            </Center>
          )}
        </StatCard>
      </Flex>
    );
  };

  const renderStockDashboard = () => (
    <Flex wrap="wrap" gap={6}>
      <StatCard
        title="Stock Data (Finished Goods)"
            info={STOCK_INFO.finishedGoods}
        count={data.stock?.totalStockQty || 0}
        minWidth={{ base: "100%", lg: "600px" }}
      >
        <TableChart
          headers={["ITEM CODE", "ITEM NAME", "STOCK"]}
          data={(data.stock?.data || []).map((row) => ({
            itemCode: row.items?.find((i) => i.key === "ITEM CODE")?.value || "-",
            itemName: row.items?.find((i) => i.key === "ITEM NAME")?.value || "-",
            stockCount: row.items?.find((i) => i.key === "STOCK")?.value || "0",
          }))}
          keys={["itemCode", "itemName", "stockCount"]}
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
      case "stock":
      case "store":
      case "stores":
        return renderStockDashboard();
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
            <Heading size={{ base: "md", md: "lg" }} color="blue.700">
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
