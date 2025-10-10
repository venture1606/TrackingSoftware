import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

import { setProcess } from '../redux/slices/department';
import ItemsData from '../utils/ItemsData';

import Department from '../services/Department';
import Process from '../services/Process';
import SubProcess from '../components/SubProcess';

function Qms() {
  const dispatch = useDispatch();

  const departments = useSelector(state => state.department.departments);
  const allProcesses = useSelector(state => state.department.allProcesses);

  const { ImageUploadArray } = ItemsData;

  const { handleGetAllDepartments } = Department();
  const { handlegetAllProcess, handleGetSingleProcess } = Process();

  const [selectedDept, setSelectedDept] = useState('');
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [selectedProcessName, setSelectedProcessName] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [popupData, setPopupData] = useState(null);

  // For Image popup
  const [imagePopupUrl, setImagePopupUrl] = useState(null);

  useEffect(() => {
    handleGetAllDepartments();
  }, []);

  useEffect(() => {
    handlegetAllProcess();
  }, []);

  dispatch(setProcess(allProcesses));

  // Filter processes based on selected department
  useEffect(() => {
    if (selectedDept) {
      const deptObj = departments.find(d => d.name === selectedDept);
      setFilteredProcesses(deptObj ? deptObj.process : []);
      setSelectedProcessName('');
      setSelectedProcess(null);
    } else {
      setFilteredProcesses([]);
    }
  }, [selectedDept, departments]);

  // Update selected process object
  useEffect(() => {
    if (selectedProcessName) {
      const procObj = allProcesses.find(p => p.process === selectedProcessName);
      setSelectedProcess(procObj || null);
    }
  }, [selectedProcessName, allProcesses]);

  const handleViewSubProcess = async (row, cell) => {
    let id;

    // If DETAILING PRODUCT -> open current process ID
    if (cell.key === 'DETAILING PRODUCT') {
      id = selectedProcess.id;
    } else if (cell.value?.startsWith('processId -')) {
      id = cell.value.split('processId -')[1].trim();
    }

    if (!id) return;

    const nestedResponse = await handleGetSingleProcess(id);

    setPopupData({
      parentProcess: selectedProcess.process,
      nestedProcess: nestedResponse || null,
      rowDataId: row._id,
    });

    onOpen();
  };

  // Render Image Popup
  const renderImagePopUp = () => {
    if (!imagePopupUrl) return null;

    return (
      <Modal isOpen={!!imagePopupUrl} onClose={() => setImagePopupUrl(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Uploaded Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <img
              src={imagePopupUrl}
              alt="Uploaded"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setImagePopupUrl(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <div className="AppRightContainer">
      <h1>QMS</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">-- Select Department --</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept.name}>{dept.name}</option>
          ))}
        </Select>

        <Select
          value={selectedProcessName}
          disabled={!selectedDept}
          onChange={(e) => setSelectedProcessName(e.target.value)}
        >
          <option value="">-- Select Process --</option>
          {filteredProcesses.map((proc, idx) => (
            <option key={idx} value={proc}>{proc}</option>
          ))}
        </Select>
      </div>

      {/* Render table for selected process */}
      {selectedProcess && (
        <TableContainer className="FormPageContainer">
          <Table size="sm" variant="striped">
            <Thead className="TableHeader">
              <Tr>
                {selectedProcess.headers.map(header => (
                  <Th key={header} className="TableHeaderContent">{header}</Th>
                ))}
                <Th className="TableHeaderContent">Updated By</Th>
                <Th className="TableHeaderContent">Created At</Th>
              </Tr>
            </Thead>
            <Tbody className="TableBody">
              {selectedProcess.data.map(row => (
                <Tr key={row._id}>
                  {selectedProcess.headers.map(header => {
                    const cell = row.items.find(i => i.key === header);
                    if (!cell) return <Td key={header}>-</Td>;

                    // 🔹 Image Upload Handling
                    if (ImageUploadArray.includes(cell.key) && cell.value) {
                      return (
                        <Td key={header} className="RowsField">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => setImagePopupUrl(cell.value)}
                          >
                            View
                          </Button>
                        </Td>
                      );
                    }

                    // Handle DETAILING PRODUCT or nested processes
                    if (cell.key === 'DETAILING PRODUCT' || cell.value?.startsWith('processId -')) {
                      return (
                        <Td key={header} className="RowsField">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleViewSubProcess(row, cell)}
                          >
                            View
                          </Button>
                        </Td>
                      );
                    }

                    // MultiSelect fields
                    if (cell.process === 'multiSelect' && Array.isArray(cell.value)) {
                      return <Td key={header} className="RowsField">{cell.value.join(', ')}</Td>;
                    }

                    return <Td key={header} className="RowsField">{cell.value}</Td>;
                  })}

                  <Td className="RowsField">{selectedProcess.updatedBy?.userName || 'N/A'}</Td>
                  <Td className="RowsField">{new Date(row.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* SubProcess modal */}
      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} isView={true} />

      {/* Image Popup */}
      {renderImagePopUp()}
    </div>
  );
}

export default Qms;
