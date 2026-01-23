import React, { useState, useEffect, useRef } from "react";
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
import { useDispatch, useSelector } from "react-redux";

// Importing API
import Process from "../services/Process";

// importing components
import Loading from "../hooks/Loading";
import SubProcess from "./SubProcess"; // modal for nested process
import FormDialog from "../hooks/FormDialog";

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";

function FormPage({ process, isView = false, currentBomId = null }) {
  const {
    loading,
    handleGetSingleProcess,
    handleUpdateData,
    handleDeleteData,
  } = Process();

  const {
    ArrayValuesProcess,
    DefaultSelectProcess,
    ImageUploadArray,
    ShownArray,
    ColorProcess
  } = ItemsData;

  const dispatch = useDispatch();
  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts
  );
  const stateProcess = useSelector((state) => state.department.process);
  const userDetails = useSelector((state) => state.auth.userDetails);

  const [rows, setRows] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [imagePopupUrl, setImagePopupUrl] = useState(null);
  const [rowIds, setRowIds] = useState([]);

  const tableContainerRef = useRef(null);

  // For SubProcess modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // For FormDialog modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRowIdx, setFormRowIdx] = useState(null);
  const [formInitialData, setFormInitialData] = useState({});

  const colorCoordinates = [
    { label: "In Progress", color: "#ffb176" },
    { label: "Pending", color: "#ff4545" },
    { label: "Completed", color: "#92ff89" },
    { label: "Planning", color: "#89b8ff" },
  ];

  useEffect(() => {
    if (process?.value && process?.header) {
      setRows(process.value);
      setRowIds(process.rowIds || []);
    } else {
      setRows([]);
      setRowIds([]);
    }

    if (process?.process === "Products" && stateProcess) {
      const fetchDetailingProducts = async () => {
        const bomProcess = stateProcess.find(
          (item) => item.process === "Bill of Materials - BOM"
        );
        if (bomProcess) {
          const response = await handleGetSingleProcess(bomProcess.id);

          // ✅ Filter detailing products by the current BOM ID
          const filteredData = currentBomId
            ? {
                ...response,
                data: response?.data?.filter(
                  (row) => row.rowDataId === currentBomId
                ),
              }
            : response;

          dispatch(setDetailingProducts(filteredData));
        }
      };
      fetchDetailingProducts();
    }
  }, [process, stateProcess, currentBomId]);

  const getRowData = (row) => {
    const obj = {};
    process.header.forEach((col) => {
      const cell = row.find((item) => item.key === col);
      obj[col] = cell ? cell.value : "";
    });
    return obj;
  };

  const objectToRow = (data, oldRow) => {
    const dataMap = Array.isArray(data)
      ? data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
      : data;

    return process.header.map((col, idx) => {
      const existingCell = oldRow.find((item) => item.key === col) || oldRow[idx];
      return {
        ...existingCell,
        value: dataMap[col] !== undefined ? dataMap[col] : "",
      };
    });
  };

  const handleEditClick = (rowIdx) => {
    setFormRowIdx(rowIdx);
    setFormInitialData(getRowData(rows[rowIdx]));
    setIsFormOpen(true);
  };

  const handleDeleteRow = (rowIdx) => {
    const updatedRows = [...rows];
    const updatedRowIds = [...rowIds];

    handleDeleteData({ rowId: rowIds[rowIdx], id: process.id, userId: userDetails?._id });

    // ✅ Remove both the row and its corresponding ID
    updatedRows.splice(rowIdx, 1);
    updatedRowIds.splice(rowIdx, 1);

    // ✅ Update both arrays to keep indexes in sync
    setRows(updatedRows);
    setRowIds(updatedRowIds);
  };

  const handleFormSubmit = async (items) => {
    const updatedRows = [...rows];
    await handleUpdateData({
      rowId: rowIds[formRowIdx],
      items,
      id: process.id,
    });
    updatedRows[formRowIdx] = objectToRow(
      items,
      rows[formRowIdx]
    );
    setRows(updatedRows);
    setIsFormOpen(false);
    setFormRowIdx(null);
  };

  const handleCellButtonClick = async (row, rowIdx, cellIdx, cellKey) => {
    const cell = row[cellIdx];
    const rowDataId = rowIds[rowIdx];

    let id;
    if (cell.key === "DETAILING PRODUCT") {
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

  const renderImagePopUp = () => {
    if (!imagePopupUrl) return null;

    const isFileObject =
      typeof imagePopupUrl === "object" && imagePopupUrl instanceof File;
    const imageSrc = isFileObject
      ? URL.createObjectURL(imagePopupUrl)
      : imagePopupUrl;

    return (
      <Modal
        isOpen={!!imagePopupUrl}
        onClose={() => setImagePopupUrl(null)}
        size="xl"
      >
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

  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <Button
          // leftIcon={<ChevronLeftIcon />}
          colorScheme="blue"
          size="sm"
          onClick={scrollLeft}
        >
          Left
        </Button>
        <Button
          // rightIcon={<ChevronRightIcon />}
          colorScheme="blue"
          size="sm"
          onClick={scrollRight}
        >
          Right
        </Button>
      </div>
      <div
        ref={tableContainerRef}
        className="FormPageContainer"
        style={{ overflowX: "auto", maxWidth: "100%" }}
      >
        <Table size="sm" showColumnBorder stickyHeader variant="striped">
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
                    // 🧩 Detailing Product Display Logic
                    if (
                      cell.key === "DETAILING PRODUCT" &&
                      Array.isArray(cell.value)
                    ) {
                      // Gather all BOM rows first
                      const bomRows = cell.value
                        .map((bomId) =>
                          detailingProducts?.data?.find((d) => d._id === bomId)
                        )
                        .filter(Boolean); // remove undefined rows

                      if (bomRows.length === 0) {
                        return (
                          <Td key={cellIdx} className="RowsField">
                            No data available
                          </Td>
                        );
                      }

                      return (
                        <Td key={cellIdx} className="RowsField">
                          <div className="FormPageContainer">
                            <Table size="xs" variant="striped">
                              <Thead className="TableHeader">
                                <Tr>
                                  {detailingProducts?.headers?.map(
                                    (header, hIdx) =>
                                      ShownArray.includes(header) && (
                                        <Th
                                          key={hIdx}
                                          className="TableHeaderContent"
                                        >
                                          {header}
                                        </Th>
                                      )
                                  )}
                                </Tr>
                              </Thead>
                              <Tbody className="TableBody">
                                {bomRows.map((bomRow, idx) => (
                                  <Tr key={idx} className="RowsField">
                                    {detailingProducts?.headers?.map(
                                      (header, hIdx) => {
                                        if (!ShownArray.includes(header))
                                          return null;
                                        const item = bomRow.items.find(
                                          (i) => i.key === header
                                        );
                                        return (
                                          <Td
                                            key={hIdx}
                                            className="RowsField"
                                            style={{ padding: "12px" }}
                                          >
                                            {item?.value || "-"}
                                          </Td>
                                        );
                                      }
                                    )}
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </div>
                        </Td>
                      );
                    }

                    // ⚙️ Existing array display logic (keep intact)
                    if (
                      ArrayValuesProcess.includes(cell.key) &&
                      Array.isArray(cell.value)
                    ) {
                      return (
                        <Td key={cellIdx} className="RowsField">
                          {cell.value.map((rev, revIdx) => (
                            <span
                              key={revIdx}
                              style={{
                                margin: "0 4px",
                                border: "1px solid black",
                                padding: "8px",
                                backgroundColor:
                                  revIdx === cell.value.length - 1
                                    ? "green"
                                    : "transparent",
                                color:
                                  revIdx === cell.value.length - 1
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {rev}
                            </span>
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
                        (typeof cell.value === "string" &&
                          cell.value.startsWith("processId -")) ? (
                          <Button
                            sx={{
                              width: "55px",
                              fontSize: "12px",
                              height: "30px",
                            }}
                            colorScheme={`${
                              ColorProcess.includes(cell.key)
                                ? `${
                                    cell.process !== "value"
                                      ? `${cell.process}`
                                      : "red"
                                  }`
                                : "blue"
                            }`}
                            onClick={() =>
                              handleCellButtonClick(
                                row,
                                rowIdx,
                                cellIdx,
                                cell.key
                              )
                            }
                          >
                            {DefaultSelectProcess.includes(cell.key)
                              ? "View"
                              : cell.key === "BREAK HOUR"
                              ? cell.process
                                ? cell.process
                                : "0"
                              : "UPDATE"}
                          </Button>
                        ) : [
                            "Planning",
                            "In Progress",
                            "Completed",
                            "Pending",
                          ].includes(cell.value) ? (
                          <Td className="RowsField ProtoStatusIndicationRow">
                            <div
                              className="ProtoStatusIndication"
                              style={{
                                backgroundColor:
                                  colorCoordinates.find(
                                    (c) => c.label === cell.value
                                  )?.color || "gray",
                              }}
                            ></div>
                            <span>{cell.value}</span>
                          </Td>
                        ) : (
                          <Td
                            className={`RowsField ${
                              cell.key === "IN"
                                ? "Green"
                                : cell.key === "OUT"
                                ? "Red"
                                : ""
                            }`}
                          >
                            {cell.value}
                          </Td>
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
      </div>

      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} />

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

      {renderImagePopUp()}
      {loading && <Loading />}
    </div>
  );
}

export default FormPage;
