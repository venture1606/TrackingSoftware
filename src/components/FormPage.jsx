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
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";

// Importing API
import Process from "../services/Process";

// importing components
import Loading from "../hooks/Loading";
import SubProcess from "./SubProcess"; // modal for nested process
import FormDialog from "../hooks/FormDialog"; // Keeping as fallback or for specific uses

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";

function FormPage({ process, isView = false, currentBomId = null, onDataUpdate }) {
  const {
    loading,
    handleGetSingleProcess,
    handleUpdateData,
    handleDeleteData,
    handleAddData,
  } = Process();

  const {
    ArrayValuesProcess,
    DefaultSelectProcess,
    ImageUploadArray,
    ShownArray,
    SelectOptionsArray: DefaultSelectOptions,
    DateFieldsArray,
    TimeArrays,
    NumberFields,
    MandatoryFields,
    noEditableFields,
    noOthers,
    DefaultHeaderAndProcessId,
  } = ItemsData;

  const dispatch = useDispatch();
  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts
  );
  const stateProcess = useSelector((state) => state.department.process);
  const SelectOptionsArray = useSelector((state) => state.auth.SelectOptionsArray) || DefaultSelectOptions;

  const [rows, setRows] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [imagePopupUrl, setImagePopupUrl] = useState(null);
  const [rowIds, setRowIds] = useState([]);

  const tableContainerRef = useRef(null);

  // Inline Edit States
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [errorFields, setErrorFields] = useState([]);

  // New Row States
  const [newRowData, setNewRowData] = useState({});
  const [isAddingRow, setIsAddingRow] = useState(false);

  // For SubProcess modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // For FormDialog modal (Legacy/Fallback)
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
    process.header.forEach((col, idx) => {
      obj[col] = row[idx]?.value || "";
    });
    return obj;
  };

  const objectToRow = (data, oldRow) =>
    process.header.map((col, idx) => ({
      ...oldRow[idx],
      value: data[col] || "",
    }));

  // --- Inline Editing Functions ---
  const startEditing = (rowIdx) => {
    setEditingRowIdx(rowIdx);
    setEditFormData(getRowData(rows[rowIdx]));
    setErrorFields([]);
  };

  const cancelEditing = () => {
    setEditingRowIdx(null);
    setEditFormData({});
    setErrorFields([]);
  };

  const handleEditChange = (key, value) => {
    setEditFormData((prev) => ({ ...prev, [key]: value }));
    if (errorFields.includes(key)) {
      setErrorFields(errorFields.filter((f) => f !== key));
    }
  };

  const validateData = (data) => {
    const errors = [];
    if (MandatoryFields) {
      MandatoryFields.forEach((field) => {
        if (process.header.includes(field)) {
          const val = data[field];
          const isEmpty =
            !val ||
            (Array.isArray(val) && val.length === 0) ||
            (Array.isArray(val) && val.every((v) => !v.trim())) ||
            (typeof val === "string" && !val.trim());

          if (isEmpty) {
            errors.push(field);
          }
        }
      });
    }
    return errors;
  };

  const saveRow = async (rowIdx) => {
    const errors = validateData(editFormData);
    if (errors.length > 0) {
      setErrorFields(errors);
      alert(`Please fill in mandatory fields: ${errors.join(", ")}`);
      return;
    }

    const originalRow = rows[rowIdx];
    const items = process.header.map((key, idx) => {
      const val = editFormData[key];
      const originalCell = originalRow[idx];
      return {
        key,
        value: val,
        process: originalCell.process || "value"
      };
    });

    const updatedData = await handleUpdateData({
      rowId: rowIds[rowIdx],
      items,
      id: process.id,
    });

    if (updatedData) {
      cancelEditing();
      if (onDataUpdate) onDataUpdate();
      // Optimistic update of local rows could happen here, 
      // but onDataUpdate usually triggers a parent refresh which flows down.
      // For immediate feel:
      const updatedRows = [...rows];
      updatedRows[rowIdx] = objectToRow(editFormData, rows[rowIdx]);
      setRows(updatedRows);
    }
  };

  const deleteRow = async (rowIdx) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;

    await handleDeleteData({ rowId: rowIds[rowIdx], id: process.id });

    // Optimistic remove
    const updatedRows = [...rows];
    const updatedRowIds = [...rowIds];
    updatedRows.splice(rowIdx, 1);
    updatedRowIds.splice(rowIdx, 1);
    setRows(updatedRows);
    setRowIds(updatedRowIds);

    if (onDataUpdate) onDataUpdate();
  };

  // --- New Row Functions ---
  const handleNewRowChange = (key, value) => {
    setNewRowData(prev => ({ ...prev, [key]: value }));
    if (errorFields.includes(key)) {
      setErrorFields(errorFields.filter((f) => f !== key));
    }
  };

  const saveNewRow = async () => {
    const errors = validateData(newRowData);
    if (errors.length > 0) {
      setErrorFields(errors);
      alert(`Please fill in mandatory fields: ${errors.join(", ")}`);
      return;
    }

    const items = process.header.map(key => {
      let processType = "value";
      let value = newRowData[key] !== undefined ? newRowData[key] : "";

      const processIdMatch = DefaultHeaderAndProcessId?.find(p => p.tableHeader === key);
      if (processIdMatch) {
        processType = "processId";
        value = processIdMatch.processId;
      } else if (DefaultSelectProcess.includes(key)) {
        processType = "multiSelect";
      } else if (SelectOptionsArray.find(x => x.key === key)) {
        processType = "select";
      } else if (ImageUploadArray.includes(key)) {
        processType = "image";
      } else if (ArrayValuesProcess.includes(key)) {
        processType = "arrayInput";
      } else if (DateFieldsArray.includes(key)) {
        processType = "date";
      } else if (TimeArrays.includes(key)) {
        processType = "time";
      } else if (NumberFields.includes(key)) {
        processType = "number";
      }

      return {
        key,
        value,
        process: processType
      };
    });

    const response = await handleAddData({
      items,
      id: process.id,
      rowDataId: process.rowDataId
    });

    if (response) {
      setNewRowData({});
      setIsAddingRow(false);
      if (onDataUpdate) onDataUpdate();
      // Optimistic append if you want, but ensure ID is there
    }
  };

  // Legacy/Modal Edit
  const handleEditClick = (rowIdx) => {
    // If we want to use Modal instead of Inline, we use this.
    // user requested Inline, so we'll prefer startEditing
    startEditing(rowIdx);
  };

  const handleLegacyEditClick = (rowIdx) => {
    setFormRowIdx(rowIdx);
    setFormInitialData(getRowData(rows[rowIdx]));
    setIsFormOpen(true);
  }

  const handleFormSubmit = async (items) => {
    const updatedRows = [...rows];
    await handleUpdateData({
      rowId: rowIds[formRowIdx],
      items,
      id: process.id,
    });
    updatedRows[formRowIdx] = objectToRow(
      Object.fromEntries(items.map((i) => [i.key, i.value])),
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

  const renderCellInput = (key, value, onChange, isNew = false) => {
    const isReadOnly = noEditableFields.includes(key);

    // 0. Process ID
    const processIdMatch = DefaultHeaderAndProcessId?.find(p => p.tableHeader === key);
    if (processIdMatch) {
      return <Input size="sm" value={value || processIdMatch.processId} isReadOnly isDisabled />;
    }

    // 1. MultiSelect
    if (DefaultSelectProcess.includes(key)) {
      const options = detailingProducts?.data?.map(row => {
        const subPart = row.items.find(i => i.key === "SUB PARTS")?.value;
        return { label: subPart, value: row._id };
      }).filter(Boolean) || [];

      return (
        <CheckboxGroup value={value || []} onChange={(val) => onChange(key, val)} isDisabled={isReadOnly}>
          <Stack direction="column" maxH="150px" overflowY="auto" border="1px solid #eee" p={2} borderRadius="md">
            {options.map((opt) => (
              <Checkbox key={opt.value} value={opt.value} size="sm">{opt.label}</Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      );
    }

    // 2. Select
    const selectMatch = SelectOptionsArray.find(s => s.key === key);
    if (selectMatch) {
      return (
        <Stack>
          <Select
            size="sm"
            value={selectMatch.value.includes(value) ? value : "Others"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Others") onChange(key, "Others");
              else onChange(key, val);
            }}
            isDisabled={isReadOnly}
            maxWidth="180px"
          >
            {selectMatch.value.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {!noOthers.includes(key) && <option value="Others">Others</option>}
          </Select>
          {(value === "Others" || (value && !selectMatch.value.includes(value))) && !noOthers.includes(key) && (
            <Input
              size="sm"
              placeholder="Specify..."
              value={value === "Others" ? "" : value}
              onChange={(e) => onChange(key, e.target.value)}
              isDisabled={isReadOnly}
              maxWidth="180px"
            />
          )}
        </Stack>
      );
    }

    if (DateFieldsArray.includes(key)) {
      return <Input type="date" size="sm" value={value || ""} onChange={(e) => onChange(key, e.target.value)} isDisabled={isReadOnly} />;
    }

    if (TimeArrays.includes(key)) {
      return <Input type="time" size="sm" value={value || ""} onChange={(e) => onChange(key, e.target.value)} isDisabled={isReadOnly} />;
    }

    if (NumberFields.includes(key)) {
      return <Input type="number" size="sm" value={value || ""} onChange={(e) => onChange(key, e.target.value)} isDisabled={isReadOnly} />;
    }

    if (ImageUploadArray.includes(key)) {
      return (
        <Stack>
          {value && !isNew && (
            <Button size="xs" onClick={() => setImagePopupUrl(value)}>View Current</Button>
          )}
          <Input
            type="file"
            size="sm"
            accept="image/*"
            padding={1}
            isDisabled={isReadOnly}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(key, file);
            }}
          />
        </Stack>
      )
    }

    if (ArrayValuesProcess.includes(key)) {
      const valArr = Array.isArray(value) ? value : (value ? [value] : [""]);
      return (
        <Stack spacing={1} minW="150px">
          {valArr.map((v, i) => (
            <Flex key={i} gap={1}>
              <Input
                size="sm"
                value={v}
                onChange={(e) => {
                  const newArr = [...valArr];
                  newArr[i] = e.target.value;
                  onChange(key, newArr);
                }}
                isDisabled={isReadOnly}
              />
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => {
                  const newArr = valArr.filter((_, idx) => idx !== i);
                  onChange(key, newArr);
                }}
                isDisabled={isReadOnly}
              >X</Button>
            </Flex>
          ))}
          <Button
            size="xs"
            onClick={() => onChange(key, [...valArr, ""])}
            isDisabled={isReadOnly}
          >+ Add</Button>
        </Stack>
      );
    }

    // Default Text
    return <Input size="sm" value={value || ""} onChange={(e) => onChange(key, e.target.value)} isDisabled={isReadOnly} />;
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
        <Flex gap={2}>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={scrollLeft}
          >
            Left
          </Button>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={scrollRight}
          >
            Right
          </Button>
        </Flex>

        {!isView && !isAddingRow && (
          <Button size="sm" colorScheme="green" leftIcon={<AddIcon />} onClick={() => setIsAddingRow(true)}>
            Add New Row
          </Button>
        )}
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
              rows.map((row, rowIdx) => {
                const isEditing = editingRowIdx === rowIdx;

                return (
                  <Tr key={rowIdx}>
                    {row.map((cell, cellIdx) => {
                      const cellKey = cell.key;

                      if (isEditing) {
                        return (
                          <Td key={cellIdx} className="RowsField" style={{ minWidth: "180px", verticalAlign: "top" }}>
                            {renderCellInput(cellKey, editFormData[cellKey], handleEditChange)}
                          </Td>
                        );
                      }

                      // 🧩 Detailing Product Display Logic
                      if (
                        cell.key === "DETAILING PRODUCT" &&
                        Array.isArray(cell.value)
                      ) {
                        const bomRows = cell.value
                          .map((bomId) =>
                            detailingProducts?.data?.find((d) => d._id === bomId)
                          )
                          .filter(Boolean);

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
                              colorScheme={`${cell.key === "PROTO"
                                  ? `${cell.process !== "value"
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
                              className={`RowsField ${cell.key === "IN"
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
                        {isEditing ? (
                          <Flex gap={2} justify="center">
                            <IconButton icon={<CheckIcon />} colorScheme="green" size="sm" onClick={() => saveRow(rowIdx)} title="Save" />
                            <IconButton icon={<CloseIcon />} colorScheme="red" size="sm" onClick={cancelEditing} title="Cancel" />
                          </Flex>
                        ) : (
                          <Button
                            size="sm"
                            className="IconButtonStyle"
                            onClick={() => startEditing(rowIdx)}
                          >
                            Edit
                          </Button>
                        )}
                      </Td>
                    )}
                    {!isView && (
                      <Td className="RowsField">
                        <Button
                          size="sm"
                          colorScheme="red"
                          className="IconButtonStyle"
                          onClick={() => deleteRow(rowIdx)}
                        >
                          Delete
                        </Button>
                      </Td>
                    )}
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={(process?.header?.length || 1) + 2}>No Data</Td>
              </Tr>
            )}

            {isAddingRow && process?.header && (
              <Tr bg="gray.100">
                {process.header.map((col, idx) => (
                  <Td key={idx} className="RowsField" style={{ minWidth: "180px", verticalAlign: "top" }}>
                    {renderCellInput(col, newRowData[col], handleNewRowChange, true)}
                  </Td>
                ))}
                <Td className="RowsField">
                  <Flex gap={2} justify="center">
                    <IconButton icon={<CheckIcon />} colorScheme="green" size="sm" onClick={saveNewRow} title="Save" />
                    <IconButton icon={<CloseIcon />} colorScheme="red" size="sm" onClick={() => setIsAddingRow(false)} title="Cancel" />
                  </Flex>
                </Td>
                <Td className="RowsField"></Td>
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
