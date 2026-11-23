import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Select,
  Input,
  SimpleGrid,
  Spinner,
  Center,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";

import StatCard from "./StatCard";
import { getHrDepartmentDashboard } from "../../services/dashboard";
import { HR_INFO } from "../../utils/dashboardInfo";
import { toInputDate } from "../../utils/dateUtils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEPT_LABEL = (d) => (d === "HR" ? "HR" : d.charAt(0) + d.slice(1).toLowerCase());

// Safety calendar colours (same rule as the reference sheet)
const SAFETY_COLORS = {
  safe: { bg: "#8BD05B", label: "Safe — PPE 100% and no near miss" },
  ppe: { bg: "#FFFF33", label: "PPE below 100%" },
  nearMiss: { bg: "#FFBF1F", label: "Near miss reported" },
  none: { bg: "#EDF2F7", label: "No record" },
};

const Badge = ({ children, color = "#155f82" }) => (
  <Flex
    minW="76px"
    h="52px"
    px={3}
    borderRadius="full"
    bg={color}
    color="white"
    align="center"
    justify="center"
    fontWeight="black"
    fontSize="xl"
    boxShadow="md"
  >
    {children}
  </Flex>
);

const Tile = ({ label, value, sub }) => (
  <VStack
    flex="1 1 150px"
    border="2px solid"
    borderColor="green.300"
    borderRadius="2xl"
    p={4}
    spacing={2}
  >
    <Text fontSize="sm" fontWeight="semibold" color="gray.700" textAlign="center" textTransform="uppercase">
      {label}
    </Text>
    <Flex boxSize="72px" borderRadius="full" bg="#155f82" color="white" align="center" justify="center">
      <Text fontSize="2xl" fontWeight="black">
        {value ?? "—"}
      </Text>
    </Flex>
    {sub && (
      <Text fontSize="10px" color="gray.500" textAlign="center">
        {sub}
      </Text>
    )}
  </VStack>
);

const DeptSelect = ({ value, onChange, departments }) => (
  <Select size="sm" w="170px" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">All departments</option>
    {departments.map((d) => (
      <option key={d} value={d}>
        {DEPT_LABEL(d)}
      </option>
    ))}
  </Select>
);

const startOfYear = () => `${new Date().getFullYear()}-01-01`;

/** HR department dashboard: Employee Strength, Attendance Trend, Safety calendar, 5S. */
function HrDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState(() => ({
    department: "",
    attendanceDepartment: "",
    groupBy: "month",
    startDate: startOfYear(),
    endDate: toInputDate(),
    safetyMonth: toInputDate().slice(0, 7),
    fiveSYear: "",
    fiveSMonth: "",
  }));
  const filtersRef = useRef(filters);

  const load = useCallback(
    async (f, first = false) => {
      if (first) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await getHrDepartmentDashboard({
          department: f.department,
          attendanceDepartment: f.attendanceDepartment,
          groupBy: f.groupBy,
          startDate: f.startDate ? new Date(`${f.startDate}T00:00:00`).getTime() : undefined,
          endDate: f.endDate ? new Date(`${f.endDate}T23:59:59.999`).getTime() : undefined,
          safetyMonth: f.safetyMonth,
          fiveSYear: f.fiveSYear || undefined,
          fiveSMonth: f.fiveSMonth || undefined,
        });
        setData(res?.data || null);
      } catch (error) {
        toast({
          title: "Error loading HR dashboard",
          description: error?.response?.data?.message || error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(filtersRef.current, true);
  }, [load]);

  const update = (patch) => {
    const next = { ...filtersRef.current, ...patch };
    filtersRef.current = next;
    setFilters(next);
    load(next);
  };

  if (loading) {
    return (
      <Center h="240px">
        <Spinner color="blue.500" />
      </Center>
    );
  }

  const departments = data?.departments || [];
  const es = data?.employeeStrength || {};
  const att = data?.attendance || {};
  const safety = data?.safety || {};
  const five = data?.fiveS || {};
  const monthLabel = (ym) => {
    const [y, m] = String(ym || "").split("-").map(Number);
    return y && m ? `${MONTH_NAMES[m - 1]} ${y}` : ym;
  };

  return (
    <Flex wrap="wrap" gap={6}>
      {/* Employee Strength */}
      <StatCard
        title="Employee Strength"
        info={HR_INFO.employeeStrength}
        dashboardKey="hr.employeeStrength"
        minWidth={{ base: "100%", md: "420px" }}
        headerRight={
          <DeptSelect
            value={filters.department}
            departments={departments}
            onChange={(v) => update({ department: v })}
          />
        }
      >
        <Flex gap={4} wrap="wrap">
          <Tile
            label="No. of employees"
            value={es.employeeCount}
            sub={filters.department ? DEPT_LABEL(filters.department) : "Active employees, all departments"}
          />
          <Tile
            label="Standard overhead"
            value={es.standardOverhead}
            sub={
              es.overheadPeriod
                ? `Overhead plan ${new Date(es.overheadPeriod.from).toLocaleDateString("en-GB")} – ${
                    es.overheadPeriod.to ? new Date(es.overheadPeriod.to).toLocaleDateString("en-GB") : "…"
                  }`
                : "No Overhead plan entered yet"
            }
          />
        </Flex>
        {es.standardOverhead != null && es.employeeCount != null && (
          <Text fontSize="xs" color={es.employeeCount < es.standardOverhead ? "orange.600" : "green.600"} mt={3}>
            {es.employeeCount < es.standardOverhead
              ? `${es.standardOverhead - es.employeeCount} below the standard overhead`
              : es.employeeCount > es.standardOverhead
                ? `${es.employeeCount - es.standardOverhead} above the standard overhead`
                : "Exactly at the standard overhead"}
          </Text>
        )}
      </StatCard>

      {/* Attendance Trend */}
      <StatCard
        title="Attendance Trend"
        info={HR_INFO.attendanceTrend}
        dashboardKey="hr.attendanceTrend"
        minWidth={{ base: "100%", lg: "640px" }}
        headerRight={<Badge>{att.rate != null ? `${att.rate}%` : "—"}</Badge>}
      >
        <Flex gap={2} wrap="wrap" mb={4} align="center">
          <DeptSelect
            value={filters.attendanceDepartment}
            departments={departments}
            onChange={(v) => update({ attendanceDepartment: v })}
          />
          <Select size="sm" w="120px" value={filters.groupBy} onChange={(e) => update({ groupBy: e.target.value })}>
            <option value="day">Date wise</option>
            <option value="month">Month wise</option>
            <option value="year">Year wise</option>
          </Select>
          <Input size="sm" type="date" w="150px" value={filters.startDate} onChange={(e) => update({ startDate: e.target.value })} />
          <Text fontSize="sm" color="gray.500">to</Text>
          <Input size="sm" type="date" w="150px" value={filters.endDate} onChange={(e) => update({ endDate: e.target.value })} />
          {refreshing && <Spinner size="sm" color="blue.500" />}
        </Flex>
        {(att.trend || []).length ? (
          <Box h="230px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={att.trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" fontSize={10} />
                <YAxis fontSize={10} />
                <ChartTooltip contentStyle={{ fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="total" name="Total employees" stroke="#1c5d82" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="present" name="Present" stroke="#ed7d31" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Center h="200px">
            <Text color="gray.500" fontSize="sm">No attendance recorded for this period.</Text>
          </Center>
        )}
      </StatCard>

      {/* Safety Follow Ups calendar */}
      <StatCard
        title="Safety Follow Up"
        info={HR_INFO.safety}
        dashboardKey="hr.safety"
        minWidth={{ base: "100%", lg: "640px" }}
        headerRight={<Badge color="#155f82">{safety.safePct != null ? `${safety.safePct}%` : "—"}</Badge>}
      >
        <Flex gap={2} mb={4} align="center" wrap="wrap">
          <Input
            size="sm"
            type="month"
            w="170px"
            value={filters.safetyMonth}
            onChange={(e) => e.target.value && update({ safetyMonth: e.target.value })}
          />
          <Text fontSize="xs" color="gray.500">
            {safety.recordedDays || 0} day{safety.recordedDays === 1 ? "" : "s"} recorded in {monthLabel(safety.month)} ·{" "}
            {safety.safeDays || 0} safe
          </Text>
        </Flex>
        <SimpleGrid columns={10} spacing="2px" maxW="640px">
          {(safety.days || []).map((d) => {
            const c = SAFETY_COLORS[d.status] || SAFETY_COLORS.none;
            const tip =
              d.status === "none"
                ? `${d.day}: no record`
                : `${d.day}: PPE ${d.ppe ?? "—"}% · near miss ${d.nearMiss} · improvements ${d.improvements}${
                    d.remark ? ` · ${d.remark}` : ""
                  }`;
            return (
              <Tooltip key={d.day} label={tip} hasArrow fontSize="xs">
                <Flex
                  h="48px"
                  bg={c.bg}
                  align="center"
                  justify="center"
                  fontSize="xl"
                  fontWeight={d.status === "none" ? "normal" : "bold"}
                  color={d.status === "none" ? "gray.400" : "gray.900"}
                  cursor="default"
                >
                  {d.day}
                </Flex>
              </Tooltip>
            );
          })}
        </SimpleGrid>
        <HStack spacing={4} mt={3} flexWrap="wrap">
          {Object.entries(SAFETY_COLORS).map(([k, c]) => (
            <HStack key={k} spacing={1}>
              <Box boxSize="12px" bg={c.bg} border="1px solid" borderColor="gray.300" />
              <Text fontSize="10px" color="gray.600">
                {c.label}
              </Text>
            </HStack>
          ))}
        </HStack>
      </StatCard>

      {/* 5S */}
      <StatCard
        title="5S Score"
        info={HR_INFO.fiveS}
        dashboardKey="hr.fiveS"
        minWidth={{ base: "100%", lg: "560px" }}
        headerRight={<Badge>{five.pct != null ? `${five.pct}%` : "—"}</Badge>}
      >
        <Flex gap={2} mb={4} align="center" wrap="wrap">
          <Select size="sm" w="120px" placeholder="All years" value={filters.fiveSYear} onChange={(e) => update({ fiveSYear: e.target.value })}>
            {(five.years || []).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Select size="sm" w="130px" placeholder="All months" value={filters.fiveSMonth} onChange={(e) => update({ fiveSMonth: e.target.value })}>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </Flex>
        {(five.data || []).length ? (
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={five.data.map((r) => ({ ...r, department: DEPT_LABEL(r.department) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" fontSize={10} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis fontSize={10} domain={[0, five.target || 5]} allowDecimals={false} />
                <ChartTooltip contentStyle={{ fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="score" name="Score" fill="#2e86c1" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#ed7d31" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Center h="220px">
            <Text color="gray.500" fontSize="sm">No 5S scores recorded for this period.</Text>
          </Center>
        )}
      </StatCard>
    </Flex>
  );
}

export default HrDashboard;
