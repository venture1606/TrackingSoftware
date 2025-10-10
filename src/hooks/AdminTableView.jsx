import React, { useState } from 'react'
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
    useDisclosure
} from '@chakra-ui/react'

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

    const renderContent = () => {
        switch (TableContent) {
            case 'users':
                return (
                  <div className='FormPageContainer' style={{ overflowX: "auto", maxWidth: "100%" }}>
                      <Table  size='sm' showColumnBorder stickyHeader>
                          <Thead className="TableHeader">
                              <Tr>
                                  { DetailsArray[0].map((item, idx) => (
                                      <Th key={idx} className="TableHeaderContent">{item.key}</Th>
                                  ))}
                              </Tr>
                          </Thead>
                          <Tbody className="TableBody">
                              {DetailsArray.map((row, rowIndex) => (
                                  <Tr key={rowIndex} className="RowsField">
                                      {row.map((cell, cellIndex) => (
                                          <Td key={cellIndex} className="RowsField">
                                              {cell.value}
                                          </Td>
                                      ))}
                                  </Tr>
                              ))}
                          </Tbody>
                      </Table>
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

                        {/* Render Table if process selected */}
                        {selectedProcess && (
                            <TableContainer mt={4} className='FormPageContainer'>
                                <Table showColumnBorder stickyHeader size="sm">
                                    <Thead className='TableHeader'>
                                        <Tr>
                                            {selectedProcess.headers.map((header) => (
                                                <Th key={header} className='TableHeaderContent'>{header}</Th>
                                            ))}
                                            <Th className='TableHeaderContent'>Updated By</Th>
                                            <Th className='TableHeaderContent'>Created At</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody className='TableBody'>
                                        {selectedProcess.data.map((row) => (
                                        <Tr key={row._id}>
                                            {selectedProcess.headers.map((header) => {
                                                const item = row.items.find((i) => i.key === header);

                                                return (
                                                    <Td key={header} className="RowsField">
                                                    {item && item.value?.startsWith("processId -") ? (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="blue"
                                                            onClick={() => handleViewSubProcess(row._id, item.value)}
                                                        >
                                                            View
                                                        </Button>
                                                    ) : (
                                                        item?.value || "-"
                                                    )}
                                                    </Td>
                                                );
                                            })}
                                            <Td className='RowsField'>{selectedProcess.updatedBy?.userName || "N/A"}</Td>
                                            <Td className='RowsField'>{new Date(row.createdAt).toLocaleString()}</Td>
                                        </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
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