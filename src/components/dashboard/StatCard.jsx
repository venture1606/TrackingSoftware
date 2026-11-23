import React from "react";
import { Box, Heading, Badge, Flex } from "@chakra-ui/react";
import CardInfo from "./CardInfo";
import { usePermissions } from "../../services/permissions";

const StatCard = ({ dashboardKey, ...props }) => {
  // dashboardKey: the card's key in utils/dashboardCatalog.js — hidden when the admin hasn't
  // given this user access to it (User permissions › Dashboard Access)
  const { canSeeDashboard } = usePermissions();
  if (dashboardKey && !canSeeDashboard(dashboardKey)) return null;
  return <StatCardBody {...props} />;
};

const StatCardBody = ({
  title,
  count,
  children,
  minH = "300px",
  headerRight,
  minWidth = "300px",
  info, // optional: explanation shown via the (i) icon — see CardInfo.jsx
}) => (
  <Box
    bg="white"
    borderRadius="xl"
    boxShadow="sm"
    border="1px solid"
    borderColor="gray.100"
    p={5}
    minH={minH}
    minW={minWidth}
    flex="1 1 auto"
    display="flex"
    flexDirection="column"
  >
    <Box
      borderBottom="2px solid"
      borderColor="blue.500"
      pb={2}
      mb={4}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Flex align="center" gap={2}>
        <Heading
          size="xs"
          color="blue.700"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Heading>
        <CardInfo title={title} info={info} />
        {count !== undefined && count !== null && (
          <Badge
            colorScheme="pink"
            variant="solid"
            borderRadius="full"
            px={2}
            fontSize="1rem"
          >
            {count}
          </Badge>
        )}
      </Flex>
      {headerRight && <Box>{headerRight}</Box>}
    </Box>
    <Box flex="1">{children}</Box>
  </Box>
);

export default StatCard;
