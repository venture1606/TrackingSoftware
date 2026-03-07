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
        const nestedProcess = response || null
        setPopupData({
            parentProcess: selectedProcess.process,
            type: "subProcess",
            row: null,
            rowIdx: null,
            cellIdx: null,
            nestedProcess: nestedProcess,
            rowDataId,
        })
        onOpen();
    }

    const handleViewHistory = (rowDataId) => {
        setPopupData({
            parentProcess: selectedProcess.process,
            type: "history",
            processId: selectedProcess._id,
            rowDataId: rowDataId
        });
        onOpen();
    }

    const UserRow = useCallback(({ index, style }) => {
        const row = DetailsArray[index];
        return (
            <div style={{ ...style }}>
                <div style={{
                    display: 'flex', 
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                    padding: "8px 10px",
                    borderBottom: '1px solid #E2E8F0', 
                    alignItems: 'center',
                    height: "100%"
                }}>
                    {row.map((cell, cellIndex) => (
                        <Box key={cellIndex} flex="1" px={4} fontSize="sm" isTruncated textAlign="center" color="#2d3748" fontWeight="500">
                            {cell?.value && cell?.value !== "" ? cell?.value : "-"}
                        </Box>
                    ))}
                </div>
            </div>
        );
    }, [DetailsArray]);

    const ProcessRow = useCallback(({ index, style }) => {
        const row = selectedProcess.data[index];
        const gridTemplate = selectedProcess.headers.map(h => h === "DETAILING PRODUCT" ? "minmax(450px, 4fr)" : "minmax(150px, 1fr)").join(" ") + " 150px 160px 100px";
        
        return (
            <div style={{ ...style }}>
                <div style={{
                    display: 'grid', 
                    gridTemplateColumns: gridTemplate, 
                    gap: '20px', 
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                    padding: "8px 10px",
                    borderBottom: '1px solid #E2E8F0', 
                    alignItems: 'center',
                    height: '100%'
                }}>
                    {selectedProcess.headers.map((header) => {
                        const item = row.items.find((i) => i.key === header);
                        return (
                            <Box key={header} fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" textAlign="center" fontWeight="500" color="#2d3748">
                                {item && item.value?.startsWith("processId -") ? (
                                    <Button
                                        size="xs"
                                        colorScheme="blue"
                                        onClick={() => handleViewSubProcess(row._id, item.value)}
                                    >
                                        View
                                    </Button>
                                ) : (
                                    item?.value && item?.value !== '' ? item?.value : "-"
                                )}
                            </Box>
                        );
                    })}
                    <Box fontSize="sm" textAlign="center">{selectedProcess.updatedBy?.userName || "N/A"}</Box>
                    <Box fontSize="sm" textAlign="center">{new Date(row.createdAt).toLocaleString()}</Box>
                    <Box fontSize="sm" textAlign="center">
                       <Button size="xs" colorScheme="orange" onClick={() => handleViewHistory(row._id)}>History</Button>
                    </Box>
                </div>
            </div>
        );
    }, [selectedProcess, handleViewSubProcess]);

    const renderContent = () => {
        switch (TableContent) {
            case 'users':
                if (!DetailsArray || DetailsArray.length === 0) return null;
                return (
                  <div className='FormPageContainer' style={{ overflowX: "auto", overflowY: "auto", maxWidth: "100%", maxHeight: "calc(100vh - 250px)", position: "relative", borderRadius: "8px", padding: "10px", backgroundColor: "#f7f9fc" }}>
                      <Box minW="max-content" bg="transparent" borderRadius="md">
                          {/* Custom Header */}
                          <Flex bg="#f7f9fc" borderBottom="2px solid #e2e8f0" fontWeight="bold" padding="10px" position="sticky" top={0} zIndex={15}>
                              {DetailsArray[0].map((item, idx) => (
                                  <Box key={idx} flex="1" px={4} py={3} fontSize="xs" textTransform="uppercase" color="#718096" textAlign="center">
                                      {item.key}
                                  </Box>
                              ))}
                          </Flex>
                          <List
                            height={500}
                            itemCount={DetailsArray.length}
                            itemSize={55}
                            width="100%"
                            style={{ overflowX: "hidden" }}
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
                        <Flex gap={4} mb={4} align="center">
                            <Select
                                placeholder="Select Process"
                                onChange={(e) => setSelectedProcessId(e.target.value)}
                                maxW="300px"
                            >
                                {DetailsArray.map((proc) => (
                                    <option key={proc._id} value={proc._id}>
                                        {proc.process}
                                    </option>
                                ))}
                            </Select>
                            {selectedProcess && (
                                <Button colorScheme="purple" onClick={() => handleViewHistory(null)}>
                                    View Process History
                                </Button>
                            )}
                        </Flex>

                        {/* Render Virtualized List if process selected */}
                        {selectedProcess && (() => {
                            const gridTemplateColumns = selectedProcess.headers.map(h => h === "DETAILING PRODUCT" ? "minmax(450px, 4fr)" : "minmax(150px, 1fr)").join(" ") + " 150px 160px 100px";
                            return (
                                <Box mt={4} className='FormPageContainer' overflowX="auto" overflowY="auto" maxH="calc(100vh - 250px)" position="relative" borderRadius="8px" bg="#f7f9fc" p="10px">
                                    <Box minW="max-content" bg="transparent" borderRadius="md">
                                        <Box 
                                            display="grid" 
                                            gridTemplateColumns={gridTemplateColumns} 
                                            gap="20px" 
                                            bg="#f7f9fc" 
                                            borderBottom="2px solid #e2e8f0" 
                                            fontWeight="bold"
                                            padding="10px"
                                            position="sticky"
                                            top={0}
                                            zIndex={15}
                                        >
                                            {selectedProcess.headers.map((header) => (
                                                <Box key={header} fontSize="xs" textTransform="uppercase" color="#718096" textAlign="center">{header}</Box>
                                            ))}
                                            <Box fontSize="xs" textTransform="uppercase" color="#718096" textAlign="center">Updated By</Box>
                                            <Box fontSize="xs" textTransform="uppercase" color="#718096" textAlign="center">Created At</Box>
                                            <Box fontSize="xs" textTransform="uppercase" color="#718096" textAlign="center">History</Box>
                                        </Box>
                                        
                                        <List
                                            height={500}
                                            itemCount={selectedProcess.data.length}
                                            itemSize={55}
                                            width="100%"
                                            style={{ overflowX: "hidden" }}
                                        >
                                            {ProcessRow}
                                        </List>
                                    </Box>
                                </Box>
                            )
                        })()}
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
