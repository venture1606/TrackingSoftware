import React from 'react';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';

import { useAllProcesses } from '../../services/Process';
import AdminTableView from '../../hooks/AdminTableView';

const ProcessDetails = () => {
  const { data: allProcesses, isLoading } = useAllProcesses();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!allProcesses || allProcesses.length === 0) {
    return <Text p={4}>No process found.</Text>;
  }

  return (
    <Box w="100%">
      <AdminTableView DetailsArray={allProcesses} TableContent={'process'} />
    </Box>
  );
};

export default ProcessDetails;
