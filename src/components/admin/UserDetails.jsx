import React, { useMemo } from 'react';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';

import { useAllUsers } from '../../services/Auth';
import AdminTableView from '../../hooks/AdminTableView';

const UserDetails = () => {
  const { data: allUsers, isLoading } = useAllUsers();

  const formattedUsers = useMemo(() => {
    if (!Array.isArray(allUsers) || allUsers.length === 0) return [];
    return allUsers.map((user, index) => [
      { key: "SL.NO", value: index + 1 || "-" },
      { key: "USER NAME", value: user.userName || "-" },
      { key: "EMPLOYEE ID", value: user.employeeId || "-" },
      { key: "ROLE", value: user.role || "-" },
      { key: "EMAIL", value: user.email || "-" },
      { key: "ACCESS", value: user.access?.length ? user.access.join(", ") : "-" },
      { key: "DATE", value: user.date ? new Date(user.date).toLocaleDateString() : "-" },
    ]);
  }, [allUsers]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!formattedUsers.length) {
    return <Text p={4}>No users found.</Text>;
  }

  return (
    <Box w="100%">
      <AdminTableView DetailsArray={formattedUsers} TableContent={'users'} />
    </Box>
  );
};

export default UserDetails;
