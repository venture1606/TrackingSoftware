import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
    Button,
    Select,
    useDisclosure,
    Box,
    Flex,
    Th,
} from '@chakra-ui/react'
import { VariableSizeList as List } from 'react-window';

import Process from '../services/Process'
import SubProcess from '../components/SubProcess';
import MeasuredListRow from '../components/MeasuredListRow';
import {
    getHeaderBasedGridTemplate,
    estimateWrappedCellHeight,
    DEFAULT_ROW_HEIGHT,
} from '../utils/tableLayout';

const CELL_WRAP_SX = {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
};

const USER_HEADERS = [
    'S.No',
    'Name',
    'Email',
    'Role',
    'Department',
    'Process',
    'Created',
    'Updated',
    'Status',
];

function AdminTableView({ DetailsArray, TableContent }) {

    const { isOpen, onOpen, onClose } = useDisclosure()

    const { handleGetSingleProcess } = Process();
    const [selectedProcessId, setSelectedProcessId] = useState(null);
    const [popupData, setPopupData] = useState(null);
    const selectedProcess = DetailsArray.find(p => p._id === selectedProcessId);

    const userListRef = useRef(null);
    const processListRef = useRef(null);
    const userRowSizeMap = useRef({});
    const processRowSizeMap = useRef({});

    const userHeaders = useMemo(() => {
        if (DetailsArray?.[0]?.length) {
            return DetailsArray[0].map((item) => item.key);
        }
        return USER_HEADERS;
    }, [DetailsArray]);

    const userGridTemplate = useMemo(
        () => getHeaderBasedGridTemplate(userHeaders),
        [userHeaders],
    );

    const processGridTemplate = useMemo(
        () =>
            selectedProcess
                ? getHeaderBasedGridTemplate(selectedProcess.headers || [], {
                      extraColumns: ['Updated By', 'Created At', 'History'],
                  })
                : '',
        [selectedProcess],
    );

    const setUserRowSize = useCallback((index, size) => {
        const next = Math.ceil(size);
        if (userRowSizeMap.current[index] !== next) {
            userRowSizeMap.current[index] = next;
            userListRef.current?.resetAfterIndex(index);
        }
    }, []);

    const setProcessRowSize = useCallback((index, size) => {
        const next = Math.ceil(size);
        if (processRowSizeMap.current[index] !== next) {
            processRowSizeMap.current[index] = next;
            processListRef.current?.resetAfterIndex(index);
        }
    }, []);

    const getUserItemSize = useCallback(
        (index) => {
            if (userRowSizeMap.current[index] != null) {
                return userRowSizeMap.current[index];
            }
            const row = DetailsArray[index];
            if (!row) return DEFAULT_ROW_HEIGHT;
            let maxHeight = DEFAULT_ROW_HEIGHT;
            row.forEach((cell) => {
                maxHeight = Math.max(
                    maxHeight,
                    estimateWrappedCellHeight(cell?.value, 120),
                );
            });
            return maxHeight;
        },
        [DetailsArray],
    );

    const getProcessItemSize = useCallback(
        (index) => {
            if (processRowSizeMap.current[index] != null) {
                return processRowSizeMap.current[index];
            }
            const row = selectedProcess?.data?.[index];
            if (!row) return DEFAULT_ROW_HEIGHT;
            let maxHeight = DEFAULT_ROW_HEIGHT;
            (selectedProcess.headers || []).forEach((header) => {
                const item = row.items?.find((i) => i.key === header);
                maxHeight = Math.max(
                    maxHeight,
                    estimateWrappedCellHeight(item?.value, 120),
                );
            });
            return maxHeight;
        },
        [selectedProcess],
    );

    useEffect(() => {
        userRowSizeMap.current = {};
        userListRef.current?.resetAfterIndex(0);
    }, [DetailsArray, userGridTemplate]);

    useEffect(() => {
        processRowSizeMap.current = {};
        processListRef.current?.resetAfterIndex(0);
    }, [selectedProcess, processGridTemplate]);

    const handleViewSubProcess = useCallback(async (rowDataId, processId) => {
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
    }, [handleGetSingleProcess, selectedProcess, onOpen]);

    const handleViewHistory = useCallback((rowDataId) => {
        setPopupData({
            parentProcess: selectedProcess.process,
            type: "history",
            processId: selectedProcess._id,
            rowDataId: rowDataId
        });
        onOpen();
    }, [selectedProcess, onOpen]);

    const UserRow = useCallback(({ index, style }) => {
        const row = DetailsArray[index];

        return (
            <MeasuredListRow
                index={index}
                style={style}
                setRowSize={setUserRowSize}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: userGridTemplate,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    padding: "8px 10px",
                    borderBottom: '1px solid #edf2f7',
                    alignItems: 'center',
                    transition: "background-color 0.2s"
                }}>
                    {row.map((cell, cellIndex) => (
                        <Box
                            key={cellIndex}
                            px={3}
                            fontSize="13px"
                            textAlign={cellIndex === 1 ? "left" : "center"}
                            color="#4a5568"
                            fontWeight="500"
                            sx={CELL_WRAP_SX}
                        >
                            {cell?.value && cell?.value !== "" ? cell?.value : "-"}
                        </Box>
                    ))}
                </div>
            </MeasuredListRow>
        );
    }, [DetailsArray, userGridTemplate, setUserRowSize]);

    const ProcessRow = useCallback(({ index, style }) => {
        const row = selectedProcess.data[index];

        return (
            <MeasuredListRow
                index={index}
                style={style}
                setRowSize={setProcessRowSize}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: processGridTemplate,
                    gap: '20px',
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    padding: "8px 10px",
                    borderBottom: '1px solid #edf2f7',
                    alignItems: 'center',
                    transition: "background-color 0.2s"
                }}>
                    {selectedProcess.headers.map((header) => {
                        const item = row.items.find((i) => i.key === header);
                        return (
                            <Box
                                key={header}
                                fontSize="13px"
                                textAlign="center"
                                fontWeight="500"
                                color="#4a5568"
                                sx={CELL_WRAP_SX}
                            >
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
                    <Box fontSize="13px" textAlign="center" color="#4a5568" fontWeight="500" sx={CELL_WRAP_SX}>
                        {selectedProcess.updatedBy?.userName || "N/A"}
                    </Box>
                    <Box fontSize="13px" textAlign="center" color="#4a5568" fontWeight="500" sx={CELL_WRAP_SX}>
                        {new Date(row.createdAt).toLocaleString()}
                    </Box>
                    <Box fontSize="13px" textAlign="center">
                       <Button size="xs" colorScheme="orange" variant="outline" onClick={() => handleViewHistory(row._id)}>History</Button>
                    </Box>
                </div>
            </MeasuredListRow>
        );
    }, [selectedProcess, handleViewSubProcess, handleViewHistory, processGridTemplate, setProcessRowSize]);

    const renderContent = () => {
        switch (TableContent) {
            case 'users':
                if (!DetailsArray || DetailsArray.length === 0) return null;
                return (
                    <Box
                        className='FormPageContainer'
                        sx={{
                            overflow: "hidden",
                            maxWidth: "100%",
                            borderRadius: "xl",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            border: "1px solid",
                            borderColor: "gray.200",
                            backgroundColor: "white",
                            mt: 4
                        }}
                    >
                        <Box minW="max-content">
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
                                minH="50px"
                                alignItems="center"
                            >
                                {userHeaders.map((header, idx) => (
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
                                        whiteSpace="nowrap"
                                    >
                                        {header}
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
                                    ref={userListRef}
                                    height={500}
                                    itemCount={DetailsArray.length}
                                    itemSize={getUserItemSize}
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

                        {selectedProcess && (
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
                                        gridTemplateColumns={processGridTemplate}
                                        gap="20px"
                                        bg="#f8fafc"
                                        borderBottom="2px solid #e2e8f0"
                                        fontWeight="700"
                                        padding="0 10px"
                                        position="sticky"
                                        top={0}
                                        zIndex={15}
                                        minH="50px"
                                        alignItems="center"
                                    >
                                        {selectedProcess.headers.map((header) => (
                                            <Box key={header} fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center" whiteSpace="nowrap">{header}</Box>
                                        ))}
                                        <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center" whiteSpace="nowrap">Updated By</Box>
                                        <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center" whiteSpace="nowrap">Created At</Box>
                                        <Box fontSize="11px" textTransform="uppercase" letterSpacing="wider" color="#64748b" textAlign="center" whiteSpace="nowrap">History</Box>
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
                                            ref={processListRef}
                                            height={500}
                                            itemCount={selectedProcess.data.length}
                                            itemSize={getProcessItemSize}
                                            width="100%"
                                            className="custom-scrollbar"
                                        >
                                            {ProcessRow}
                                        </List>
                                    </Box>
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
