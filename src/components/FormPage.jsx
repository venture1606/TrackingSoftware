import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

// Importing API
import Process from "../services/Process";

// importing components
import Loading from "../hooks/Loading";
import SubProcess from "./SubProcess"; // modal for nested process
import FormDialog from "../hooks/FormDialog";

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";

function FormPage({ process, isView = false }) {
  const { loading, handleGetSingleProcess, handleUpdateData, handleDeleteData } = Process();

  const { ArrayValuesProcess, DefaultSelectProcess, ImageUploadArray } = ItemsData;

  const [rows, setRows] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [imagePopupUrl, setImagePopupUrl] = useState(null);

  // For SubProcess modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // For FormDialog modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRowIdx, setFormRowIdx] = useState(null);
  const [formInitialData, setFormInitialData] = useState({});

  useEffect(() => {
    if (process?.value && process?.header) {
      setRows(process.value);
    } else {
      setRows([]); // clear rows when process changes
    }
  }, [process]);

  // Convert row to object keyed by column names
  const getRowData = (row) => {
    const obj = {};
    process.header.forEach((col, idx) => {
      obj[col] = row[idx]?.value || "";
    });
    return obj;
  };

  // Convert back to row format (array of { value })
  const objectToRow = (data, oldRow) =>
    process.header.map((col, idx) => ({
      ...oldRow[idx],
      value: data[col] || "",
    }));

  // When Edit is clicked
  const handleEditClick = (rowIdx) => {
    setFormRowIdx(rowIdx);
    setFormInitialData(getRowData(rows[rowIdx]));
    setIsFormOpen(true);
  };

  const handleDeleteRow = (rowIdx) => {
    const updatedRows = [...rows];
    handleDeleteData({ rowId: process.rowIds[rowIdx], id: process.id });
    updatedRows.splice(rowIdx, 1);
    setRows(updatedRows);
  };

  // When FormDialog saves
  // When FormDialog saves
const handleFormSubmit = async (items) => {
  const updatedRows = [...rows];

  // ✅ Send directly to backend
  await handleUpdateData({
    rowId: process.rowIds[formRowIdx],
    items,  // already normalized { key, value }
    id: process.id,
  });

  // ✅ Convert items[] back into row format for UI
  updatedRows[formRowIdx] = objectToRow(
    Object.fromEntries(items.map((i) => [i.key, i.value])),
    rows[formRowIdx]
  );

  setRows(updatedRows);
  setIsFormOpen(false);
  setFormRowIdx(null);
};



  // When process button inside a cell is clicked
  const handleCellButtonClick = async (row, rowIdx, cellIdx, cellKey) => {
    const cell = row[cellIdx];
    const rowDataId = process.rowIds[rowIdx];

    let id;

    if (cell.key === 'DETAILING PRODUCT') {
      id = process.id;
    } else {
      id = cell.value.split("processId -")[1]?.trim();
    }
    
    const response = await handleGetSingleProcess(id);
    
    setPopupData({
      parentProcess: process.process,
      row,
      rowIdx,
      cellIdx,
      nestedProcess: response || null,
      rowDataId,
    });
    onOpen();
  };

  // Render Image Popup
  const renderImagePopUp = () => {
    if (!imagePopupUrl) return null;

    // Determine if the value is a File object or a string URL
    const isFileObject = typeof imagePopupUrl === "object" && imagePopupUrl instanceof File;

    // If it's a File, create a temporary object URL
    const imageSrc = isFileObject
      ? URL.createObjectURL(imagePopupUrl)
      : imagePopupUrl;

    return (
      <Modal isOpen={!!imagePopupUrl} onClose={() => setImagePopupUrl(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Uploaded Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Uploaded"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            ) : (
              "Please reload to see the image"
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => {
                // Clean up the created object URL to prevent memory leaks
                if (isFileObject) URL.revokeObjectURL(imageSrc);
                setImagePopupUrl(null);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };


  return (
    <div
      className="FormPageContainer"
      style={{ overflowX: "auto", maxWidth: "100%" }}
    >  
      <Table size="sm" showColumnBorder stickyHeader>
        <Thead className="TableHeader">
          <Tr>
            {process && process.header?.length > 0 ? (
              <>
                {process.header.map((col, idx) => (
                  <Th key={idx} className="TableHeaderContent">
                    {col}
                  </Th>
                ))}
                {!isView && <Th className="TableHeaderContent">Action</Th>}
                {!isView && <Th className="TableHeaderContent">Delete</Th>}
              </>
            ) : (
              <Th className="TableHeaderContent">No Process Selected</Th>
            )}
          </Tr>
        </Thead>

        <Tbody className="TableBody">
          {rows && rows.length > 0 ? (
            rows.map((row, rowIdx) => (
              <Tr key={rowIdx}>
                {row.map((cell, cellIdx) => {
                  if (ArrayValuesProcess.includes(cell.key) && Array.isArray(cell.value)) {
                    return (
                      <Td key={cellIdx} className="RowsField">
                        {cell.value.map((rev, revIdx) => (
                          <span key={revIdx}>{rev} </span>
                        ))}
                      </Td>
                    );
                  }

                  // 🔹 Image Upload handling
                  if (ImageUploadArray.includes(cell.key) && cell.value) {
                    return (
                      <Td key={cellIdx} className="RowsField">
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

                  return (
                    <Td key={cellIdx} className="RowsField">
                      {cell?.process === "multiSelect" ||
                      cell.value?.startsWith("processId -") ? (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() =>
                            handleCellButtonClick(row, rowIdx, cellIdx, cell.key)
                          }
                        >
                          {DefaultSelectProcess.includes(cell.key) ? "View" : "Update"}
                        </Button>
                      ) : (
                        ["Red", "Green", "Orange"].includes(cell.value) 
                          ?  <Td className="RowsField ProtoStatusIndicationRow">
                                <div
                                  className="ProtoStatusIndication"
                                  style={{ backgroundColor: cell.value.toLowerCase() }}
                                ></div>
                                {cell.value === "Orange" && <span>In Progress</span>}
                                {cell.value === "Green" && <span>Completed</span>}
                                {cell.value === "Red" && <span>Pending</span>}
                              </Td> 
                          : cell.value
                      )}
                    </Td>
                  );
                })}

                {!isView && (
                  <Td className="RowsField">
                    <Button
                      size="sm"
                      className="IconButtonStyle"
                      onClick={() => handleEditClick(rowIdx)}
                    >
                      Edit
                    </Button>
                  </Td>
                )}
                {!isView && (
                  <Td className="RowsField">
                    <Button
                      size="sm"
                      colorScheme="red"
                      className="IconButtonStyle"
                      onClick={() => handleDeleteRow(rowIdx)}
                    >
                      Delete
                    </Button>
                  </Td>
                )}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={(process?.header?.length || 1) + 2}>No Data</Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* SubProcess Modal */}
      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} />

      {/* FormDialog Modal */}
      {isFormOpen && (
        <FormDialog
          IndicationText="Edit Row"
          FormArray={process.header.map((col) => ({
            label: col,
            key: col,
          }))}
          handleSubmit={(data) => handleFormSubmit(data)}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={formInitialData}
          loading={loading}
          mode="form"
        />
      )}

      {/* Image Popup */}
      {renderImagePopUp()}
      {loading && <Loading />}
    </div>      
  );
}

export default FormPage;
