import React from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Badge, 
    Divider, 
    Flex, 
    Icon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import { useProcessRowHistory, useProcessHistory } from '../services/Process';
import Loading from '../hooks/Loading';

const HistoryCompo = ({ type, processId, rowDataId }) => {
    // We want to fetch row-specific history if both type === 'history' and rowDataId is defined.
    // Otherwise fallback to process wide history. Since hooks must be at top-level we can use
    // the built-in queryKey enabling features of useQuery.
    const isRowHistory = type === 'history' && !!rowDataId && !!processId;
    const isProcessHistory = type === 'history' && !rowDataId && !!processId;

    const { data: processHistoryData, isLoading: loadingProcess } = useProcessHistory(isProcessHistory ? processId : null);
    const { data: rowHistoryData, isLoading: loadingRow } = useProcessRowHistory(isRowHistory ? processId : null, isRowHistory ? rowDataId : null);

    const isLoading = loadingProcess || loadingRow;
    const historyData = isRowHistory ? rowHistoryData : processHistoryData;

    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Loading />
            </Flex>
        );
    }

    if (!historyData || historyData.length === 0) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Text color="gray.500">No history records found.</Text>
            </Flex>
        );
    }

    // Helper function to render item changes elegantly
    const renderChanges = (changes) => {
        if (!changes || !Array.isArray(changes) || changes.length === 0) {
            return <Text fontSize="sm" color="gray.500">No specific field changes recorded.</Text>;
        }

        return (
            <Table variant="simple" size="sm" mt={2}>
                <Thead>
                    <Tr>
                        <Th>Field</Th>
                        <Th>Old Value</Th>
                        <Th>New Value</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {changes.map((change, idx) => (
                        <Tr key={idx}>
                            <Td fontWeight="medium" fontSize="xs">{change.key}</Td>
                            <Td color="red.500" fontSize="xs">
                                {change.oldValue ? String(change.oldValue) : "-"}
                            </Td>
                            <Td color="green.500" fontSize="xs">
                                {change.newValue ? String(change.newValue) : "-"}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        );
    };

    return (
        <VStack spacing={4} align="stretch" p={4}>
            {historyData.map((record, index) => (
                <Box 
                    key={record._id || index} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    boxShadow="sm"
                    bg="white"
                >
                    <Flex justify="space-between" align="center" mb={3}>
                        <HStack spacing={3}>
                            <Badge 
                                colorScheme={
                                    record.action === 'CREATE' ? 'green' 
                                    : record.action === 'UPDATE' ? 'blue' 
                                    : 'red'
                                }
                            >
                                {record.action}
                            </Badge>
                            <Text fontWeight="bold" fontSize="md">
                                {record.changedBy?.userName || 'System/Unknown'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                ({record.changedBy?.email || 'N/A'})
                            </Text>
                        </HStack>
                        <HStack spacing={1} color="gray.500">
                            <Icon as={TimeIcon} w={3} h={3} />
                            <Text fontSize="xs">
                                {new Date(record.timestamp).toLocaleString()}
                            </Text>
                        </HStack>
                    </Flex>
                    
                    <Divider mb={3} />
                    
                    <Box>
                        {record.action === 'UPDATE' ? (
                            renderChanges(record.changes)
                        ) : record.action === 'CREATE' ? (
                            <Text fontSize="sm" color="green.600">New record was created natively or via Add Data.</Text>
                        ) : record.action === 'DELETE' ? (
                            <Text fontSize="sm" color="red.600">Record was deleted natively or via Delete Data.</Text>
                        ) : (
                             <Text fontSize="sm" color="gray.600">Action performed.</Text>
                        )}
                    </Box>
                </Box>
            ))}
        </VStack>
    );
};

export default HistoryCompo;
