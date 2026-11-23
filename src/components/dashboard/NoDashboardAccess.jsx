import React from "react";
import { Center, Box, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { usePermissions } from "../../services/permissions";
import { DASHBOARD_GROUPS } from "../../utils/dashboardCatalog";

/**
 * Shown instead of a dashboard when the admin has configured this user's dashboards and none of
 * the cards in `groupId` ("main", "design", "quality", …) are ticked. Renders nothing otherwise.
 */
const NoDashboardAccess = ({ groupId, children }) => {
  const { isAdmin, dashboardConfigured, canSeeDashboard } = usePermissions();
  const group = DASHBOARD_GROUPS.find((g) => g.id === groupId);
  const blocked =
    !isAdmin && dashboardConfigured && group && !group.cards.some((c) => canSeeDashboard(c.key));

  if (!blocked) return children ?? null;

  return (
    <Center
      flexDirection="column"
      py={14}
      px={6}
      border="1px dashed"
      borderColor="gray.300"
      borderRadius="xl"
      bg="gray.50"
      textAlign="center"
    >
      <Box color="gray.400" mb={2}>
        <Icon icon="mdi:view-dashboard-outline" width="44" />
      </Box>
      <Text fontWeight="semibold" color="gray.700">
        No dashboards enabled for you here
      </Text>
      <Text fontSize="sm" color="gray.500" mt={1} maxW="440px">
        Your admin chooses which dashboard cards you can see. Ask an admin to enable the{" "}
        {group?.title} dashboards for your account.
      </Text>
    </Center>
  );
};

export default NoDashboardAccess;
