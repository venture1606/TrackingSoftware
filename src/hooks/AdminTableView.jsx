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
        // Define a consistent grid template for user table
        const gridTemplate = "60px 1.5fr 1fr 1.2fr 1.5fr 1.5fr 120px 120px 100px";

        return (
            <div style={{ ...style }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: gridTemplate,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    padding: "0 10px",
                    borderBottom: '1px solid #edf2f7', 
                    alignItems: 'center',
                    height: "100%",
                    transition: "background-color 0.2s"
                }}>
                    {row.map((cell, cellIndex) => (
                        <Box 
                            key={cellIndex} 
                            px={3} 
                            fontSize="13px" 
                            isTruncated 
                            textAlign={cellIndex === 1 ? "left" : "center"} 
                            color="#4a5568" 
                            fontWeight="500"
                        >
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
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    padding: "0 10px",
                    borderBottom: '1px solid #edf2f7', 
                    alignItems: 'center',
                    height: '100%',
                    transition: "background-color 0.2s"
                }}>
                    {selectedProcess.headers.map((header) => {
                        const item = row.items.find((i) => i.key === header);
                        return (
                            <Box key={header} fontSize="13px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" textAlign="center" fontWeight="500" color="#4a5568">
                                {item && item.value?.startsWith("processId -") ? (
                                    <Button
                                        size="xs"
                                        colorScheme="blue"
                                        variant="soft"
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
                    <Box fontSize="13px" textAlign="center" color="#4a5568" fontWeight="500">{selectedProcess.updatedBy?.userName || "N/A"}</Box>
                    <Box fontSize="13px" textAlign="center" color="#4a5568" fontWeight="500">{new Date(row.createdAt).toLocaleString()}</Box>
                    <Box fontSize="13px" textAlign="center">
                       <Button size="xs" colorScheme="orange" variant="outline" onClick={() => handleViewHistory(row._id)}>History</Button>
                    </Box>
                </div>
            </div>
        );
    }, [selectedProcess, handleViewSubProcess]);

    const renderContent = () => {
        switch (TableContent) {
            case 'users':
                if (!DetailsArray || DetailsArray.length === 0) return null;
                const userGridTemplate = "60px 1.5fr 1fr 1.2fr 1.5fr 1.5fr 120px 120px 100px";
                return (
                    <Box 
                        className='FormPageContainer' 
                        sx={{
                            overflow: "hidden", // Hide outer scroll since list handles it
                            maxWidth: "100%", 
                            borderRadius: "xl", 
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            border: "1px solid",
                            borderColor: "gray.200",
                            backgroundColor: "white",
                            mt: 4
                        }}
                    >
                        <Box minW="1200px"> {/* Ensure horizontal scroll for many columns */}
                            {/* Custom Header */}
                            <Box 
                                display="grid"
                                gridTemplateColumns={userGridTemplate}
                                bg="#f8fafc" 
                                borderBottom="2px solid #e2e8f0" 
                                fontWeight="700" 
                                padding="0 10px" 
                                position="sticky" 
                                top={0} 
                                zIndex={15}
                                height="50px"
                            >
                                {DetailsArray[0].map((item, idx) => (
                                    <Box 
                                        key={idx} 
                                        px={3} 
                                        display="flex"
                                        alignItems="center"
                                        justifyContent={idx === 1 ? "flex-start" : "center"}
                                        fontSize="11px" 
                                        textTransform="uppercase" 
                                        letterSpacing="wider"
                                        color="#64748b"
                                    >
                                        {item.key}
                                    </Box>
                                ))}
                            </Box>
                            
                            <Box sx={{
                                "& .custom-scrollbar": {
                                    overflowY: "auto !important",
                                    overflowX: "auto !important",
                                },
                                "& .custom-scrollbar::-webkit-scrollbar": {
                                    width: "6px",
                                    height: "6px",
                                },
                                "& .custom-scrollbar::-webkit-scrollbar-track": {
                                    background: "#f1f5f9",
                                },
                                "& .custom-scrollbar::-webkit-scrollbar-thumb": {
                                    background: "#cbd5e1",
                                    borderRadius: "10px",
                                },
                                "& .custom-scrollbar::-webkit-scrollbar-thumb:hover": {
                                    background: "#94a3b8",
                                }
                            }}>
                                <List
                                    height={500}
                                    itemCount={DetailsArray.length}
                                    itemSize={55}
                                    width="100%"
                                    className="custom-scrollbar"
                                >
                                    {UserRow}
                                </List>
                            </Box>
                        </Box>
                    </Box>
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
                                <Box 
                                    mt={4} 
                                    className='FormPageContainer' 
                                    sx={{
                                        overflow: "hidden",
                                        borderRadius: "xl",
                                        border: "1px solid",
                                        borderColor: "gray.200",
                                        boxShadow: "sm",
                                        bg: "white",
                                    }}
                                >
                                    <Box minW="max-content">
                                        <Box 
                                            display="grid" 
                                            gridTemplateColumns={gridTemplateColumns} 
                                            gap="20px" 
                                            bg="#f8fafc" 
                                            borderBottom="2px solid #e2e8f0" 
                                            fontWeight="700"
                                            padding="0 10px"
                                            position="sticky"
                                            top={0}
                                            zIndex={15}
                                            height="50px"
                                            alignItems="center"
                                        >
                                            {selectedProcess.headers.map((header) => (
                                                <Box key={header} fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center">{header}</Box>
                                            ))}
                                            <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center">Updated By</Box>
                                            <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center">Created At</Box>
                                            <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center">History</Box>
                                        </Box>
                                        
                                        <Box sx={{
                                            "& .custom-scrollbar": {
                                                overflowY: "auto !important",
                                                overflowX: "auto !important",
                                            },
                                            "& .custom-scrollbar::-webkit-scrollbar": {
                                                width: "6px",
                                                height: "6px",
                                            },
                                            "& .custom-scrollbar::-webkit-scrollbar-track": {
                                                background: "#f1f5f9",
                                            },
                                            "& .custom-scrollbar::-webkit-scrollbar-thumb": {
                                                background: "#cbd5e1",
                                                borderRadius: "10px",
                                            },
                                            "& .custom-scrollbar::-webkit-scrollbar-thumb:hover": {
                                                background: "#94a3b8",
                                            }
                                        }}>
                                            <List
                                                height={500}
                                                itemCount={selectedProcess.data.length}
                                                itemSize={55}
                                                width="100%"
                                                className="custom-scrollbar"
                                            >
                                                {ProcessRow}
                                            </List>
                                        </Box>
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
