import React, { useState } from 'react';
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
    IconButton,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import { TimeIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useProcessRowHistory, useProcessHistory } from '../services/Process';
import Process from '../services/Process';
import SubProcess from './SubProcess';
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

    const { handleGetSingleProcess } = Process();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [popupData, setPopupData] = useState(null);

    const handleViewSubProcessHistory = async (rowId, valueStr) => {
        let pId = valueStr.split("processId -")[1]?.trim();
        if (!pId) return;
        try {
            const response = await handleGetSingleProcess(pId);
            setPopupData({
                type: "history",
                processId: pId,
                rowDataId: rowId,
                nestedProcess: response || null
            });
            onOpen();
        } catch (e) {
            console.error("Failed to load sub-process history", e);
        }
    };

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

    // Helper function to format values
    const renderValue = (item, recordRowId) => {
        if (!item || item.value === "" || item.value == null) return "-";
        
        if (typeof item.value === 'string' && item.value.startsWith("processId -")) {
            return (
                <Button 
                    size="xs" 
                    colorScheme="blue" 
                    onClick={() => handleViewSubProcessHistory(recordRowId, item.value)}
                >
                    View
                </Button>
            );
        }

        if (item.process === 'date' && !isNaN(item.value)) {
            return new Date(Number(item.value)).toLocaleDateString();
        }
        return String(item.value);
    };

    const HistoryRecordTable = ({ record }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        // Fallback for old style changes if they ever existed
        if (record.changes) {
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
                        {record.changes.map((change, idx) => (
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
        }

        const newItems = record.newData?.items || [];
        const oldItems = record.oldData?.items || [];
        
        if (newItems.length === 0 && oldItems.length === 0) {
             return <Text fontSize="sm" color="gray.500">No specific field changes recorded.</Text>;
        }

        const allKeys = Array.from(new Set([...newItems.map(i => i.key), ...oldItems.map(i => i.key)]));
        const action = (record.action || record.operation || 'unknown').toUpperCase();
        const hasOldData = record.oldData !== null && oldItems.length > 0;

        return (
            <Table variant="simple" size="sm" mt={2} style={{ whiteSpace: "nowrap" }}>
                <Thead>
                    <Tr bg="gray.50">
                        {hasOldData && <Th width="40px" p={1}></Th>}
                        {allKeys.map(key => (
                            <Th key={key} fontSize="xs" color="gray.600">{key}</Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        {hasOldData && (
                            <Td p={1}>
                                <IconButton 
                                    size="xs" 
                                    variant="ghost" 
                                    icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />} 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    aria-label="Toggle Old Data"
                                />
                            </Td>
                        )}
                        {allKeys.map(key => {
                            const newItem = newItems.find(i => i.key === key);
                            const oldItem = oldItems.find(i => i.key === key);
                            
                            return (
                                <Td key={key} color={action === 'DELETE' ? "red.500" : "gray.700"} fontSize="xs">
                                    {renderValue(newItem || oldItem, record.rowId)}
                                </Td>
                            );
                        })}
                    </Tr>
                    {isExpanded && hasOldData && (
                        <Tr bg="#fff5f5">
                            <Td p={1} fontSize="xs" fontWeight="bold" color="red.500" textAlign="center">OLD</Td>
                            {allKeys.map(key => {
                                const oldItem = oldItems.find(i => i.key === key);
                                return (
                                    <Td key={key} color="red.500" fontSize="xs">
                                        {renderValue(oldItem, record.rowId)}
                                    </Td>
                                );
                            })}
                        </Tr>
                    )}
                </Tbody>
            </Table>
        );
    };

    return (
        <Box>
            <VStack spacing={4} align="stretch" p={4}>
                {historyData.map((record, index) => {
                    const action = (record.action || record.operation || 'unknown').toUpperCase();
                    return (
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
                                        action === 'CREATE' ? 'green' 
                                        : action === 'UPDATE' ? 'blue' 
                                        : 'red'
                                    }
                                >
                                    {action}
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
                        
                        <Box overflowX="auto">
                            <HistoryRecordTable record={record} />
                        </Box>
                    </Box>
                )})}
            </VStack>

            {/* SubProcess viewer modal for deeply nested history checks */}
            {isOpen && (
                <SubProcess 
                    isOpen={isOpen} 
                    onClose={onClose} 
                    data={popupData} 
                    isView={true} 
                />
            )}
        </Box>
    );
};

export default HistoryCompo;
