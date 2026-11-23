import React, { useMemo } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Heading,
  Text,
  Checkbox,
  SimpleGrid,
  Button,
  Badge,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import CardInfo from "./dashboard/CardInfo";
import { DASHBOARD_GROUPS, ALL_DASHBOARD_KEYS } from "../utils/dashboardCatalog";

/**
 * "Dashboard Access" section of the user permission pages.
 *
 * value       — the user's dashboardAccess array, or undefined when never configured
 * defaults    — what the user sees today under the old rules (pre-ticked while value is undefined)
 * onChange    — called with the new array of dashboard keys
 * accessLevel — admins always see everything, so the boxes are locked for them
 * departments — the user's department access (to warn when a department dashboard is ticked
 *               but the user can't open that department's page)
 */
const DashboardAccessPicker = ({ value, defaults = [], onChange, accessLevel, departments = [] }) => {
  const isAdminUser = String(accessLevel || "").toLowerCase() === "admin";
  const configured = Array.isArray(value);
  const selected = useMemo(
    () => new Set(isAdminUser ? ALL_DASHBOARD_KEYS : configured ? value : defaults),
    [isAdminUser, configured, value, defaults],
  );
  const deptSet = useMemo(
    () => new Set((departments || []).map((d) => String(d).toLowerCase())),
    [departments],
  );

  const emit = (set) => onChange(ALL_DASHBOARD_KEYS.filter((k) => set.has(k)));
  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    emit(next);
  };
  const setGroup = (group, on) => {
    const next = new Set(selected);
    group.cards.forEach((c) => (on ? next.add(c.key) : next.delete(c.key)));
    emit(next);
  };

  const mainGroup = DASHBOARD_GROUPS.find((g) => g.id === "main");
  const deptGroups = DASHBOARD_GROUPS.filter((g) => g.id !== "main");

  const GroupBox = ({ group }) => {
    const ticked = group.cards.filter((c) => selected.has(c.key)).length;
    const all = ticked === group.cards.length;
    const some = ticked > 0 && !all;
    const missingDept = group.legacyDept && ticked > 0 && !deptSet.has(group.legacyDept);
    return (
      <Box p={5} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
        <VStack align="stretch" spacing={3}>
          <Flex justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
            <Box>
              <HStack spacing={2}>
                <Heading size="xs" color="blue.600">
                  {group.title}
                </Heading>
                <Badge colorScheme={ticked ? "green" : "gray"} fontSize="10px">
                  {ticked} of {group.cards.length}
                </Badge>
              </HStack>
              <Text fontSize="11px" color="gray.500" mt={1}>
                {group.subtitle}
              </Text>
            </Box>
            <Checkbox
              size="sm"
              isChecked={all}
              isIndeterminate={some}
              isDisabled={isAdminUser}
              onChange={(e) => setGroup(group, e.target.checked)}
            >
              Select all {group.title}
            </Checkbox>
          </Flex>
          {missingDept && (
            <Text fontSize="11px" color="orange.600">
              This user also needs access to the {group.title} department (Departmental Scope above) to open this
              dashboard page.
            </Text>
          )}
          <SimpleGrid columns={{ base: 1, md: 2, lg: group.id === "main" ? 3 : 2 }} spacing={2}>
            {group.cards.map((card) => (
              <HStack key={card.key} spacing={1} align="center">
                <Checkbox
                  size="sm"
                  colorScheme="green"
                  isChecked={selected.has(card.key)}
                  isDisabled={isAdminUser}
                  onChange={() => toggle(card.key)}
                >
                  <Text fontSize="xs" fontWeight="600">
                    {card.title}
                  </Text>
                </Checkbox>
                <CardInfo title={`${group.title} › ${card.title}`} info={card.info} />
              </HStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={5}>
      <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
            Dashboard Access
          </Heading>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Tick the dashboard cards this user can see. Hover or click the (i) next to a card to see what it shows.
          </Text>
        </Box>
        {!isAdminUser && (
          <HStack spacing={2}>
            <Button size="xs" variant="outline" onClick={() => emit(new Set(ALL_DASHBOARD_KEYS))}>
              Select all
            </Button>
            <Button size="xs" variant="outline" onClick={() => emit(new Set())}>
              Clear all
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => emit(new Set(defaults))}
              title="Tick what this user would see from their department and process access"
            >
              Reset to default
            </Button>
          </HStack>
        )}
      </Flex>

      {isAdminUser ? (
        <Alert status="info" borderRadius="lg" fontSize="sm">
          <AlertIcon />
          Admins always see every dashboard.
        </Alert>
      ) : !configured ? (
        <Alert status="info" borderRadius="lg" fontSize="sm">
          <AlertIcon />
          Not customised yet — the ticked cards are what this user sees today (from their department and process
          access). Change any box to set this user's dashboards exactly.
        </Alert>
      ) : null}

      <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
        Main Dashboard
      </Text>
      <GroupBox group={mainGroup} />

      <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" pt={2}>
        Department Dashboards
      </Text>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        {deptGroups.map((g) => (
          <GroupBox key={g.id} group={g} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default DashboardAccessPicker;
