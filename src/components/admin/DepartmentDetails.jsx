import React, { useMemo } from 'react';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';

import { useDepartments } from '../../services/Department';
import AdminTableView from '../../hooks/AdminTableView';

const DepartmentDetails = () => {
  const { data: departments, isLoading } = useDepartments();

  const formattedDepartments = useMemo(() => {
    if (!Array.isArray(departments) || departments.length === 0) return [];
    return departments.map((department) => ({
      id: department._id,
      name: department.name || "-",
      process: department.process?.length ? department.process : ["-"],
      updatedBy: department.updatedBy?.userName || "-",
      createdAt: department.createdAt ? new Date(department.createdAt).toLocaleString() : "-",
      updatedAt: department.updatedAt ? new Date(department.updatedAt).toLocaleString() : "-",
    }));
  }, [departments]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!formattedDepartments.length) {
    return <Text p={4}>No department found.</Text>;
  }

  return (
    <Box w="100%">
      <AdminTableView DetailsArray={formattedDepartments} TableContent={'department'} />
    </Box>
  );
};

export default DepartmentDetails;
