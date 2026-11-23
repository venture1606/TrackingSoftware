import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Select,
  Input,
  InputGroup,
  InputRightElement,
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
  getEmployeeOverhead,
  getEmployeeAttendance,
  getPurchaseDepartmentDashboard,
  getSalesDashboard,
  getQualityDepartmentDashboard,
  getSettingsDashboard,
  getStoreDashboard,
  searchStoreStock,
} from "../services/dashboard";

// Import Dashboard Components
import { SearchIcon } from "@chakra-ui/icons";
import StatCard from "../components/dashboard/StatCard";
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

  // QUALITY FILTERS — rejection trend (month/year + period for the overall %), CI year/month
  const DEFAULT_QUALITY_FILTERS = { trendBy: "month", period: "", ciYear: "", ciMonth: "" };
  const [qualityFilters, setQualityFilters] = useState(DEFAULT_QUALITY_FILTERS);
  const qualityFiltersRef = useRef(DEFAULT_QUALITY_FILTERS);
  const [qualityLoading, setQualityLoading] = useState(false);

  const updateQualityFilter = async (patch) => {
    const next = { ...qualityFiltersRef.current, ...patch };
    qualityFiltersRef.current = next;
    setQualityFilters(next);
    setQualityLoading(true);
    try {
      const res = await getQualityDepartmentDashboard(next);
      setData((prev) => ({ ...prev, quality: res?.data || {} }));
    } catch (error) {
      toast({
        title: "Error filtering quality dashboard",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setQualityLoading(false);
    }
  };

  // PURCHASE FILTERS — Procurement Detail: vendor / itemName / partNo; Supplier Payment: supplier
  const [purchaseFilters, setPurchaseFilters] = useState({
    vendor: "",
    itemName: "",
    partNo: "",
    supplier: "",
  });
  const purchaseFiltersRef = useRef(purchaseFilters);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const updatePurchaseFilter = async (patch) => {
    const next = { ...purchaseFiltersRef.current, ...patch };
    purchaseFiltersRef.current = next;
    setPurchaseFilters(next);
    setPurchaseLoading(true);
    try {
      const res = await getPurchaseDepartmentDashboard(next);
      setData((prev) => ({ ...prev, purchase: res?.data || {} }));
    } catch (error) {
      toast({
        title: "Error filtering purchase dashboard",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  // STORE STOCK SEARCH (debounced, searches ITEM CODE / ITEM NAME across all stock)
  const [stockQuery, setStockQuery] = useState("");
  const [stockSearch, setStockSearch] = useState({ loading: false, total: 0, rows: [], query: "" });
  useEffect(() => {
    const q = stockQuery.trim();
    if (!q) {
      setStockSearch({ loading: false, total: 0, rows: [], query: "" });
      return undefined;
    }
    setStockSearch((prev) => ({ ...prev, loading: true }));
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await searchStoreStock(q, 50);
        if (!cancelled) {
          setStockSearch({
            loading: false,
            total: res?.data?.total || 0,
            rows: res?.data?.rows || [],
            query: q,
          });
        }
      } catch (error) {
        if (!cancelled) setStockSearch({ loading: false, total: 0, rows: [], query: q, error: error.message });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stockQuery]);

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
            const quality = await getQualityDepartmentDashboard(
              qualityFiltersRef.current,
            );
            dashboardData = { quality: quality?.data || {} };
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
            const purchase = await getPurchaseDepartmentDashboard(
              purchaseFiltersRef.current,
            );
            dashboardData = { purchase: purchase?.data || {} };
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
            const store = await getStoreDashboard();
            dashboardData = { store: store?.data || {} };
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
      purchaseFiltersRef.current = { vendor: "", itemName: "", partNo: "", supplier: "" };
      setPurchaseFilters(purchaseFiltersRef.current);
      setStockQuery("");
      qualityFiltersRef.current = { trendBy: "month", period: "", ciYear: "", ciMonth: "" };
      setQualityFilters(qualityFiltersRef.current);
      fetchData(Content);
    }
  }, [Content, fetchData]);

  // Re-fetch ONE card for its own date range (Clear → back to the last 30 days)
  const CARD_FETCHERS = {
    oee: [getOEEDashboard, "oee"],
    oeeTrend: [getProductionReport, "prodReport"],
    rejection: [getInhouseDashboard, "inhouse"],
    departmentDistribution: [getEmployeeAttendance, "attendance"],
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

  const renderQualityDashboard = () => {
    const q = data.quality || {};
    const rej = q.customerRejection || {};
    const ci = q.continuousImprovement || {};
    const audits = q.qualityAudits || {};
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pct = (v) => (v === null || v === undefined ? "—" : `${v}%`);

    // Big circular number used by the single-number cards
    const BigNumber = ({ value, label, sub, color = "blue" }) => (
      <VStack h="100%" justify="center" spacing={3} py={2}>
        <Box
          boxSize="110px"
          borderRadius="full"
          bg={`${color}.700`}
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
        >
          <Text fontSize="3xl" fontWeight="black">
            {value ?? 0}
          </Text>
        </Box>
        <Text fontSize="sm" fontWeight="bold" color={`${color}.700`} textTransform="uppercase" textAlign="center">
          {label}
        </Text>
        {sub && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {sub}
          </Text>
        )}
      </VStack>
    );

    return (
      <Flex wrap="wrap" gap={6}>
        <StatCard
          title="Customer Rejection Rate"
          info={QUALITY_INFO.customerRejection}
          minWidth={{ base: "100%", xl: "760px" }}
        >
          <Flex gap={2} wrap="wrap" mb={4} align="center">
            <Select
              size="sm"
              w="130px"
              value={qualityFilters.trendBy}
              onChange={(e) => updateQualityFilter({ trendBy: e.target.value, period: "" })}
            >
              <option value="month">Month wise</option>
              <option value="year">Year wise</option>
            </Select>
            <Select
              size="sm"
              w="150px"
              value={rej.period || ""}
              onChange={(e) => updateQualityFilter({ period: e.target.value })}
            >
              {(rej.periodOptions || []).map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
              <option value="all">All time</option>
            </Select>
            {qualityLoading && <Spinner size="sm" color="blue.500" />}
          </Flex>
          <Flex gap={6} direction={{ base: "column", lg: "row" }} align="stretch">
            <Box flex="2" minW={0}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                REJECTION % TREND (FAILED QTY ÷ DELIVERED QTY)
              </Text>
              {(rej.trend || []).length ? (
                <LineChart data={rej.trend} xAxisKey="period" dataKey="rate" height={200} />
              ) : (
                <Center h="200px">
                  <Text color="gray.500" fontSize="sm">No complaints or deliveries recorded yet.</Text>
                </Center>
              )}
            </Box>
            <VStack flex="1" spacing={4} justify="center">
              <VStack bg="orange.50" borderRadius="xl" p={4} w="100%" spacing={1}>
                <Text fontSize="10px" fontWeight="bold" color="orange.600" textTransform="uppercase">
                  Open complaints (CCR status)
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="orange.700" lineHeight={1}>
                  {rej.openComplaints || 0}
                </Text>
              </VStack>
              <VStack bg="blue.50" borderRadius="xl" p={4} w="100%" spacing={1}>
                <Text fontSize="10px" fontWeight="bold" color="blue.600" textTransform="uppercase" textAlign="center">
                  Overall rejection %
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="blue.700" lineHeight={1}>
                  {pct(rej.overall?.rate)}
                </Text>
                <Text fontSize="10px" color="gray.500" textAlign="center">
                  {rej.overall?.failedQty || 0} failed of {rej.overall?.deliveredQty || 0} delivered
                </Text>
              </VStack>
            </VStack>
          </Flex>
        </StatCard>

        <StatCard
          title="Continuous Improvement"
          info={QUALITY_INFO.improvementByDepartment}
          count={ci.total || 0}
          minWidth={{ base: "100%", lg: "460px" }}
        >
          <Flex gap={2} wrap="wrap" mb={4} align="center">
            <Select
              size="sm"
              w="120px"
              placeholder="All years"
              value={qualityFilters.ciYear}
              onChange={(e) => updateQualityFilter({ ciYear: e.target.value })}
            >
              {(ci.years || []).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Select
              size="sm"
              w="130px"
              placeholder="All months"
              value={qualityFilters.ciMonth}
              onChange={(e) => updateQualityFilter({ ciMonth: e.target.value })}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </Flex>
          {(ci.data || []).length ? (
            <BarChart
              data={ci.data}
              xAxisKey="department"
              dataKeys={[{ key: "count", name: "Improvements", color: "#3182ce" }]}
              height={220}
            />
          ) : (
            <Center h="220px">
              <Text color="gray.500" fontSize="sm">No improvements in this period.</Text>
            </Center>
          )}
        </StatCard>

        <StatCard
          title="Incoming Inspection"
          info={QUALITY_INFO.incomingInspection}
          minWidth={{ base: "100%", md: "260px" }}
        >
          <BigNumber value={q.incomingInspection?.pendingCount} label="Inspection pending" color="blue" />
        </StatCard>

        <StatCard
          title="Quality Audit Pending"
          info={QUALITY_INFO.qualityAuditPending}
          count={audits.pendingCount || 0}
          minWidth={{ base: "100%", lg: "560px" }}
        >
          {(audits.rows || []).length ? (
            <TableChart
              headers={["DEPARTMENT", "NC", "RESPONSIBLE", "DUE"]}
              data={audits.rows}
              keys={["department", "nc", "responsible", "due"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">No open audits.</Text>
            </Center>
          )}
        </StatCard>

        <StatCard
          title="Instruments Pending"
          info={QUALITY_INFO.instrumentsPending}
          minWidth={{ base: "100%", md: "260px" }}
        >
          <BigNumber
            value={q.instruments?.pendingCount}
            label="Instruments pending"
            sub={`${q.instruments?.overdue || 0} overdue · ${q.instruments?.dueSoon || 0} due in ${q.instruments?.dueSoonDays || 10} days`}
            color="red"
          />
        </StatCard>

        <StatCard
          title="Certificate Renewal"
          info={QUALITY_INFO.certificateRenewalPending}
          minWidth={{ base: "100%", md: "260px" }}
        >
          <BigNumber
            value={q.certificates?.pendingCount}
            label="Renewal pending"
            sub={`${q.certificates?.overdue || 0} already expired`}
            color="purple"
          />
        </StatCard>

        <StatCard
          title="Process Control Plan"
          info={QUALITY_INFO.pcpRenewalPending}
          minWidth={{ base: "100%", md: "320px" }}
        >
          <BigNumber
            value={q.processControlPlan?.pendingCount}
            label="Renewal pending"
            sub="Products whose revisions and control-plan entries don't match"
            color="teal"
          />
          {(q.processControlPlan?.rows || []).length > 0 && (
            <Box mt={2}>
              <TableChart
                headers={["PART NO", "REVISIONS", "PCP ENTRIES", "MISSING"]}
                data={q.processControlPlan.rows.slice(0, 5).map((r) => ({
                  ...r,
                  missing: r.missing > 0 ? r.missing : `${-r.missing} extra`,
                }))}
                keys={["partNo", "revisions", "pcpEntries", "missing"]}
              />
            </Box>
          )}
        </StatCard>
      </Flex>
    );
  };

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

  const renderPurchaseDashboard = () => {
    const purchase = data.purchase || {};
    const proc = purchase.procurement || {};
    const pay = purchase.supplierPayment || {};
    const money = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

    const FilterSelect = ({ placeholder, value, options = [], onChange }) => (
      <Select size="sm" w="160px" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    );

    const Tile = ({ label, value, color }) => (
      <VStack
        flex="1 1 150px"
        bg={`${color}.50`}
        border="1px solid"
        borderColor={`${color}.100`}
        borderRadius="xl"
        p={3}
        spacing={1}
      >
        <Text fontSize="10px" fontWeight="bold" color={`${color}.600`} textTransform="uppercase" textAlign="center">
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="black" color={`${color}.700`} lineHeight={1}>
          {value}
        </Text>
      </VStack>
    );

    const anyProcFilter = purchaseFilters.vendor || purchaseFilters.itemName || purchaseFilters.partNo;

    return (
      <Flex wrap="wrap" gap={6}>
        <StatCard
          title="Procurement Detail"
          info={PURCHASE_INFO.procurementDetail}
          count={proc.pendingCount || 0}
          minWidth={{ base: "100%", lg: "640px" }}
        >
          <Flex gap={2} wrap="wrap" mb={3} align="center">
            <FilterSelect
              placeholder="All vendors"
              value={purchaseFilters.vendor}
              options={proc.options?.vendor}
              onChange={(v) => updatePurchaseFilter({ vendor: v })}
            />
            <FilterSelect
              placeholder="All item names"
              value={purchaseFilters.itemName}
              options={proc.options?.itemName}
              onChange={(v) => updatePurchaseFilter({ itemName: v })}
            />
            <FilterSelect
              placeholder="All part nos"
              value={purchaseFilters.partNo}
              options={proc.options?.partNo}
              onChange={(v) => updatePurchaseFilter({ partNo: v })}
            />
            {anyProcFilter && (
              <Text
                as="button"
                fontSize="xs"
                color="blue.600"
                onClick={() => updatePurchaseFilter({ vendor: "", itemName: "", partNo: "" })}
              >
                Clear filters
              </Text>
            )}
            {purchaseLoading && <Spinner size="sm" color="blue.500" />}
          </Flex>
          <Flex gap={3} wrap="wrap" mb={4}>
            <Tile label="Total no. of pending" value={proc.pendingCount || 0} color="orange" />
            <Tile label="Total pending qty" value={money(proc.totalPendingQty)} color="blue" />
          </Flex>
          {(proc.rows || []).length ? (
            <TableChart
              headers={["VENDOR NAME", "PART NO", "ITEM NAME", "GRADE", "PENDING QTY", "PENDING QTY VALUE", "DUE"]}
              data={(proc.rows || []).map((r) => ({
                ...r,
                vendor: r.vendor || "-",
                partNo: r.partNo || "-",
                itemName: r.itemName || "-",
                grade: r.grade || "-",
                pendingQty: money(r.pendingQty),
                pendingValue: money(r.pendingValue),
                due: r.leadTimeMissing && r.dueDate ? `${r.due} (no lead time)` : r.due,
              }))}
              keys={["vendor", "partNo", "itemName", "grade", "pendingQty", "pendingValue", "due"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">
                {anyProcFilter ? "No pending procurement matches these filters." : "Nothing pending — all procurement is received."}
              </Text>
            </Center>
          )}
        </StatCard>

        <StatCard
          title="Supplier Payment"
          info={PURCHASE_INFO.supplierPayment}
          count={pay.openCount || 0}
          minWidth={{ base: "100%", lg: "560px" }}
        >
          <Flex gap={2} wrap="wrap" mb={3} align="center">
            <FilterSelect
              placeholder="All vendors"
              value={purchaseFilters.supplier}
              options={pay.options?.supplier}
              onChange={(v) => updatePurchaseFilter({ supplier: v })}
            />
            {purchaseLoading && <Spinner size="sm" color="blue.500" />}
          </Flex>
          <Flex gap={3} wrap="wrap" mb={4}>
            <Tile label="Total sum of value" value={money(pay.totalValue)} color="red" />
            <Tile label="Total no. of suppliers" value={pay.supplierCount || 0} color="purple" />
          </Flex>
          {pay.withoutSupplier > 0 && !purchaseFilters.supplier && (
            <Text fontSize="xs" color="gray.500" mb={2}>
              {pay.withoutSupplier} open invoice{pay.withoutSupplier === 1 ? " has" : "s have"} no vendor name (shown as “-”).
            </Text>
          )}
          {(pay.rows || []).length ? (
            <TableChart
              headers={["VENDOR", "ITEM NAME", "VALUE", "CREDIT PERIOD", "DUE"]}
              data={(pay.rows || []).map((r) => ({
                ...r,
                vendor: r.vendor || "-",
                itemName: r.itemName || "-",
                value: money(r.value),
                creditPeriod: r.creditPeriodMissing ? "-" : `${r.creditPeriod} days`,
              }))}
              keys={["vendor", "itemName", "value", "creditPeriod", "due"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">No open supplier payments.</Text>
            </Center>
          )}
        </StatCard>
      </Flex>
    );
  };

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

  const renderStockDashboard = () => {
    const fg = data.store?.finishedGoods || {};
    const qty = (n) => {
      const v = Number(n || 0);
      const text = v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
      // Negative stock means more went OUT than came IN — flag it in red
      return v < 0 ? <Text as="span" color="red.500" fontWeight="bold">{text}</Text> : text;
    };

    return (
      <Flex wrap="wrap" gap={6}>
        <StatCard
          title="Stock Data (Finished Goods)"
          info={STOCK_INFO.finishedGoods}
          count={fg.itemCount || 0}
          minWidth={{ base: "100%", lg: "600px" }}
        >
          {(fg.rows || []).length ? (
            <TableChart
              headers={["ITEM CODE", "ITEM NAME", "IN", "OUT", "STOCK"]}
              data={(fg.rows || []).map((r) => ({
                itemCode: r.itemCode || "-",
                itemName: r.itemName || "-",
                in: qty(r.in),
                out: qty(r.out),
                stock: qty(r.stock),
              }))}
              keys={["itemCode", "itemName", "in", "out", "stock"]}
            />
          ) : (
            <Center h="120px">
              <Text color="gray.500" fontSize="sm">No finished-good items in Stock Data.</Text>
            </Center>
          )}
        </StatCard>

        <StatCard
          title="Stock Search"
          info={STOCK_INFO.stockSearch}
          minWidth={{ base: "100%", lg: "480px" }}
        >
          <InputGroup size="md" mb={4}>
            <Input
              placeholder="Type an item code or item name…"
              value={stockQuery}
              onChange={(e) => setStockQuery(e.target.value)}
              borderRadius="full"
            />
            <InputRightElement>
              {stockSearch.loading ? <Spinner size="sm" color="blue.500" /> : <SearchIcon color="gray.400" />}
            </InputRightElement>
          </InputGroup>
          {!stockQuery.trim() ? (
            <Center h="100px">
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Search any item (raw material, seal, spring, finished good…) to see its stock quantity.
              </Text>
            </Center>
          ) : stockSearch.error ? (
            <Text color="red.500" fontSize="sm">{stockSearch.error}</Text>
          ) : !stockSearch.loading && stockSearch.query && !stockSearch.rows.length ? (
            <Center h="100px">
              <Text color="gray.500" fontSize="sm">No item matches “{stockSearch.query}”.</Text>
            </Center>
          ) : (
            <>
              <TableChart
                headers={["ITEM", "STOCK QTY"]}
                data={stockSearch.rows.map((r) => ({
                  item: `${r.itemCode || "-"} · ${r.itemName || "-"}${r.itemCategory ? ` (${r.itemCategory})` : ""}`,
                  stock: qty(r.stock),
                }))}
                keys={["item", "stock"]}
              />
              {stockSearch.total > stockSearch.rows.length && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Showing {stockSearch.rows.length} of {stockSearch.total} matches — type more to narrow down.
                </Text>
              )}
            </>
          )}
        </StatCard>
      </Flex>
    );
  };

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
