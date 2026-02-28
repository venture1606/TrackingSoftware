import React, { useState, useCallback } from 'react'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Select,
    useDisclosure,
    Box,
    Flex
} from '@chakra-ui/react'
import { FixedSizeList as List } from 'react-window';

import Process from '../services/Process'
import SubProcess from '../components/SubProcess';


function AdminTableView({ DetailsArray, TableContent }) {

    const { isOpen, onOpen, onClose } = useDisclosure()

    // Using for process
    const {  handleGetSingleProcess } = Process();
    const [selectedProcessId, setSelectedProcessId] = useState(null);
    const [ popupData, setPopupData ] = useState(null);
    const selectedProcess = DetailsArray.find(p => p._id === selectedProcessId);

    const handleViewSubProcess = async (rowDataId, processId) => {
        let id = processId.split("processId -")[1]?.trim();
        const response = await handleGetSingleProcess(id);
        setPopupData({
            parentProcess: selectedProcess.process,
            row: null,
            rowIdx: null,
            cellIdx: null,
            nestedProcess: response || null,
            rowDataId,
        })
        onOpen();
    }

    const UserRow = useCallback(({ index, style }) => {
        const row = DetailsArray[index];
        return (
            <div style={{ ...style, display: 'flex', borderBottom: '1px solid #E2E8F0', alignItems: 'center' }}>
                {row.map((cell, cellIndex) => (
                    <Box key={cellIndex} flex="1" px={4} py={3} fontSize="sm" isTruncated>
                        {cell.value}
                    </Box>
                ))}
            </div>
        );
    }, [DetailsArray]);

    const ProcessRow = useCallback(({ index, style }) => {
        const row = selectedProcess.data[index];
        const gridTemplate = `repeat(${selectedProcess.headers.length}, 1fr) 150px 200px`;
        
        return (
            <div style={{ ...style, display: 'grid', gridTemplateColumns: gridTemplate, gap: '4px', borderBottom: '1px solid #E2E8F0', alignItems: 'center' }}>
                {selectedProcess.headers.map((header) => {
                    const item = row.items.find((i) => i.key === header);
                    return (
                        <Box key={header} px={4} py={2} fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {item && item.value?.startsWith("processId -") ? (
                                <Button
                                    size="xs"
                                    colorScheme="blue"
                                    onClick={() => handleViewSubProcess(row._id, item.value)}
                                >
                                    View
                                </Button>
                            ) : (
                                item?.value || "-"
                            )}
                        </Box>
                    );
                })}
                <Box px={4} py={2} fontSize="sm">{selectedProcess.updatedBy?.userName || "N/A"}</Box>
                <Box px={4} py={2} fontSize="sm">{new Date(row.createdAt).toLocaleString()}</Box>
            </div>
        );
    }, [selectedProcess, handleViewSubProcess]);

    const renderContent = () => {
        switch (TableContent) {
            case 'users':
                if (!DetailsArray || DetailsArray.length === 0) return null;
                return (
                  <div className='FormPageContainer' style={{ overflowX: "auto", maxWidth: "100%" }}>
                      <Box minW="max-content" bg="white" borderRadius="md" shadow="sm">
                          {/* Custom Header */}
                          <Flex bg="gray.50" borderBottom="1px solid #E2E8F0" fontWeight="bold">
                              {DetailsArray[0].map((item, idx) => (
                                  <Box key={idx} flex="1" px={4} py={3} fontSize="xs" textTransform="uppercase" color="gray.600">
                                      {item.key}
                                  </Box>
                              ))}
                          </Flex>
                          <List
                            height={500}
                            itemCount={DetailsArray.length}
                            itemSize={50}
                            width="100%"
                          >
                            {UserRow}
                          </List>
                      </Box>
                  </div>
                )

            case 'process':
                return (
                    <div>
                        {/* Dropdown to choose process */}
                        <Select
                            placeholder="Select Process"
                            onChange={(e) => setSelectedProcessId(e.target.value)}
                            maxW="300px"
                            mb={4}
                        >
                            {DetailsArray.map((proc) => (
                                <option key={proc._id} value={proc._id}>
                                    {proc.process}
                                </option>
                            ))}
                        </Select>

                        {/* Render Virtualized List if process selected */}
                        {selectedProcess && (
                            <Box mt={4} className='FormPageContainer' overflowX="auto">
                                <Box minW="1200px" bg="white" borderRadius="md" shadow="sm">
                                    <Box 
                                        display="grid" 
                                        gridTemplateColumns={`repeat(${selectedProcess.headers.length}, 1fr) 150px 200px`} 
                                        gap="4px" 
                                        bg="gray.50" 
                                        borderBottom="2px solid #E2E8F0" 
                                        fontWeight="bold"
                                        px={2}
                                    >
                                        {selectedProcess.headers.map((header) => (
                                            <Box key={header} px={4} py={3} fontSize="xs" textTransform="uppercase" color="gray.600">{header}</Box>
                                        ))}
                                        <Box px={4} py={3} fontSize="xs" textTransform="uppercase" color="gray.600">Updated By</Box>
                                        <Box px={4} py={3} fontSize="xs" textTransform="uppercase" color="gray.600">Created At</Box>
                                    </Box>
                                    
                                    <List
                                        height={500}
                                        itemCount={selectedProcess.data.length}
                                        itemSize={60}
                                        width="100%"
                                    >
                                        {ProcessRow}
                                    </List>
                                </Box>
                            </Box>
                        )}
                        <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} isView={true} />
                    </div>
                )
            case 'product':
                return DetailsArray[0].map((item, idx) => (
                    <Th key={idx} className="TableHeaderContent">{item.key}</Th>
                ))
            case 'department':
                return (
                    <div className="AdminTableDepartmentContainer">
                    {DetailsArray.map((dept, idx) => (
                        <div key={dept.id} className="AdminTableDepartmentCard">
                        <div className="AdminTableDeptHeader">
                            <h3>{idx + 1}. {dept.name}</h3>
                            <span className="AdminTableUpdatedBy">Updated By: {dept.updatedBy}</span>
                        </div>

                        <div className="AdminTableDeptBody">
                            <div className="AdminTableProcessSection">
                            <strong>Processes:</strong>
                            <ul>
                                {dept.process.map((proc, i) => (
                                <li key={i}>{proc}</li>
                                ))}
                            </ul>
                            </div>
                        </div>

                        <div className="AdminTableDeptFooter">
                            <span><strong>Created:</strong> {dept.createdAt}</span>
                            <span><strong>Updated:</strong> {dept.updatedAt}</span>
                        </div>
                        </div>
                    ))}
                    </div>
                );

            default:
                return null
        }
    }

    return (
        <div>
            {renderContent()}
        </div>
    )

}

export default AdminTableView
