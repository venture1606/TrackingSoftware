import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  CheckboxGroup,
  Checkbox,
  Stack,
  Flex,
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
import Process from "../services/Process";
import Loading from "../hooks/Loading";
import SubProcess from "./SubProcess";
import "../styles/departmentpage.css";
import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";

function FormPage({ process, isView = false }) {
  const { loading, handleGetSingleProcess, handleUpdateData, handleDeleteData } = Process();
  const { ArrayValuesProcess, DefaultSelectProcess, ImageUploadArray, ShownArray, SelectOptionsArray, DateFieldsArray } = ItemsData;

  const dispatch = useDispatch();
  const detailingProducts = useSelector((state) => state.department.detailingProducts);
  const stateProcess = useSelector((state) => state.department.process);

  const [rows, setRows] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [imagePopupUrl, setImagePopupUrl] = useState(null);
  const [rowIds, setRowIds] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Inline Edit States
  const [editRowIdx, setEditRowIdx] = useState(null);
  const [editRowValues, setEditRowValues] = useState({});

  useEffect(() => {
    if (process?.value && process?.header) {
      setRows(process.value);
      setRowIds(process.rowIds || []);
    } else {
      setRows([]);
      setRowIds([]);
    }

    if (process !== null && process?.process === "Products" && stateProcess !== null) {
      const fetchDetailingProducts = async () => {
        let object = stateProcess.find((item) => item.process === "Bill of Materials - BOM");
        if (object) {
          const response = await handleGetSingleProcess(object.id);
          dispatch(setDetailingProducts(response));
        }
      };
      fetchDetailingProducts();
    }
  }, [process]);

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

  // 🧩 Inline Edit Functions
  const handleEditClick = (rowIdx) => {
    setEditRowIdx(rowIdx);
    setEditRowValues(getRowData(rows[rowIdx]));
  };

  const handleEditChange = (key, value, subIndex = null) => {
    setEditRowValues((prev) => {
      if (subIndex !== null && Array.isArray(prev[key])) {
        const updated = [...prev[key]];
        updated[subIndex] = value;
        return { ...prev, [key]: updated };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleAddArrayInput = (key) => {
    setEditRowValues((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ""],
    }));
  };

  const handleRemoveArrayInput = (key, subIndex) => {
    setEditRowValues((prev) => {
      const updated = [...(prev[key] || [])];
      updated.splice(subIndex, 1);
      if (updated.length === 0) updated.push("");
      return { ...prev, [key]: updated };
    });
  };

  const handleSaveEdit = async () => {
    const merged = editRowValues;

    const items = Object.keys(merged).map((key) => {
      const value = merged[key];
      let processType = "value";

      if (DefaultSelectProcess.includes(key)) {
        processType = "multiSelect";
      } else if (SelectOptionsArray.some((s) => s.key === key)) {
        processType = "select";
      } else if (ImageUploadArray.includes(key)) {
        processType = "image";
      }

      const finalValue = value?.file ? value.file : value;
      return { key, value: finalValue, process: processType };
    });

    await handleUpdateData({
      rowId: rowIds[editRowIdx],
      items,
      id: process.id,
    });

    const updatedRows = [...rows];
    updatedRows[editRowIdx] = objectToRow(editRowValues, rows[editRowIdx]);
    setRows(updatedRows);
    setEditRowIdx(null);
    setEditRowValues({});
  };

  const handleDeleteRow = (rowIdx) => {
    const updatedRows = [...rows];
    const updatedRowIds = [...rowIds];

    handleDeleteData({ rowId: rowIds[rowIdx], id: process.id });
    updatedRows.splice(rowIdx, 1);
    updatedRowIds.splice(rowIdx, 1);
    setRows(updatedRows);
    setRowIds(updatedRowIds);
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

    const isFileObject = typeof imagePopupUrl === "object" && imagePopupUrl instanceof File;
    const imageSrc = isFileObject ? URL.createObjectURL(imagePopupUrl) : imagePopupUrl;

    return (
      <Modal isOpen={!!imagePopupUrl} onClose={() => setImagePopupUrl(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Uploaded Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {imageSrc ? (
              <img src={imageSrc} alt="Uploaded" style={{ width: "100%", borderRadius: "8px" }} />
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

  return (
    <div className="FormPageContainer" style={{ overflowX: "auto", maxWidth: "100%" }}>
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
                {!isView && <Th>Action</Th>}
                {!isView && <Th>Delete</Th>}
              </>
            ) : (
              <Th>No Process Selected</Th>
            )}
          </Tr>
        </Thead>

        <Tbody>
          {rows && rows.length > 0 ? (
            rows.map((row, rowIdx) => (
              <Tr key={rowIdx}>
                {row.map((cell, cellIdx) => {
                  const key = cell.key;
                  const value = editRowIdx === rowIdx ? editRowValues[key] : cell.value;

                  // Inline edit mode
                  if (editRowIdx === rowIdx) {
                    const selectMatch = SelectOptionsArray.find((item) => item.key === key);

                    if (DefaultSelectProcess.includes(key)) {
                      return (
                        <Td key={cellIdx}>
                          <CheckboxGroup
                            value={value || []}
                            onChange={(selected) => handleEditChange(key, selected)}
                          >
                            <Stack direction="row" wrap="wrap">
                              {detailingProducts?.data?.map((row) => {
                                const subPartLabel = row.items.find(
                                  (item) => item.key === "SUB PARTS"
                                )?.value;
                                return (
                                  <Checkbox key={row._id} value={row._id}>
                                    {subPartLabel}
                                  </Checkbox>
                                );
                              })}
                            </Stack>
                          </CheckboxGroup>
                        </Td>
                      );
                    }

                    if (ArrayValuesProcess.includes(key)) {
                      return (
                        <Td key={cellIdx}>
                          <Stack spacing={2}>
                            {(Array.isArray(value) ? value : [""]).map((v, subIdx) => (
                              <Flex key={subIdx} gap={2} align="center">
                                <Input
                                  value={v}
                                  placeholder={`Enter ${key}`}
                                  onChange={(e) => handleEditChange(key, e.target.value, subIdx)}
                                />
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => handleRemoveArrayInput(key, subIdx)}
                                >
                                  Remove
                                </Button>
                                {subIdx === (value?.length || 1) - 1 && (
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleAddArrayInput(key)}
                                  >
                                    + Add
                                  </Button>
                                )}
                              </Flex>
                            ))}
                          </Stack>
                        </Td>
                      );
                    }

                    if (selectMatch) {
                      return (
                        <Td key={cellIdx}>
                          <Select
                            placeholder={`Select ${key}`}
                            value={value || ""}
                            onChange={(e) => handleEditChange(key, e.target.value)}
                          >
                            {selectMatch.value.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </Select>
                        </Td>
                      );
                    }

                    if (DateFieldsArray.includes(key)) {
                      return (
                        <Td key={cellIdx}>
                          <Input
                            type="date"
                            value={value || ""}
                            onChange={(e) => handleEditChange(key, e.target.value)}
                          />
                        </Td>
                      );
                    }

                    if (ImageUploadArray.includes(key)) {
                      return (
                        <Td key={cellIdx}>
                          <Stack spacing={2}>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file) {
                                  const previewUrl = URL.createObjectURL(file);
                                  handleEditChange(key, { file, previewUrl });
                                } else {
                                  handleEditChange(key, null);
                                }
                              }}
                            />
                            {value?.previewUrl && (
                              <img
                                src={value.previewUrl}
                                alt="Preview"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid #ccc",
                                }}
                              />
                            )}
                          </Stack>
                        </Td>
                      );
                    }

                    return (
                      <Td key={cellIdx}>
                        <Input
                          value={value || ""}
                          onChange={(e) => handleEditChange(key, e.target.value)}
                        />
                      </Td>
                    );
                  }

                  // Non-edit mode display logic (unchanged)
                  if (cell.key === "DETAILING PRODUCT" && Array.isArray(cell.value)) {
                    const bomRows = cell.value
                      .map((bomId) => detailingProducts?.data?.find((d) => d._id === bomId))
                      .filter(Boolean);

                    if (bomRows.length === 0) {
                      return <Td key={cellIdx}>No data</Td>;
                    }

                    return (
                      <Td key={cellIdx}>
                        <Table size="xs">
                          <Thead>
                            <Tr>
                              {detailingProducts?.headers?.map(
                                (header, hIdx) =>
                                  ShownArray.includes(header) && <Th key={hIdx}>{header}</Th>
                              )}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {bomRows.map((bomRow, idx) => (
                              <Tr key={idx}>
                                {detailingProducts?.headers?.map((header, hIdx) => {
                                  if (!ShownArray.includes(header)) return null;
                                  const item = bomRow.items.find((i) => i.key === header);
                                  return <Td key={hIdx}>{item?.value || "-"}</Td>;
                                })}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Td>
                    );
                  }

                  if (ArrayValuesProcess.includes(cell.key) && Array.isArray(cell.value)) {
                    return (
                      <Td key={cellIdx}>
                        {cell.value.map((rev, revIdx) => (
                          <span
                            key={revIdx}
                            style={{
                              margin: "0 4px",
                              border: "1px solid black",
                              padding: "6px",
                              backgroundColor:
                                revIdx === cell.value.length - 1 ? "green" : "transparent",
                              color: revIdx === cell.value.length - 1 ? "white" : "black",
                            }}
                          >
                            {rev}
                          </span>
                        ))}
                      </Td>
                    );
                  }

                  if (ImageUploadArray.includes(cell.key) && cell.value) {
                    return (
                      <Td key={cellIdx}>
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
                    <Td key={cellIdx}>
                      {cell?.process === "multiSelect" ||
                      cell.value?.startsWith("processId -") ? (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleCellButtonClick(row, rowIdx, cellIdx, cell.key)}
                        >
                          {DefaultSelectProcess.includes(cell.key) ? "View" : "Update"}
                        </Button>
                      ) : ["Red", "Green", "Orange"].includes(cell.value) ? (
                        <Td className="RowsField ProtoStatusIndicationRow">
                          <div
                            className="ProtoStatusIndication"
                            style={{ backgroundColor: cell.value.toLowerCase() }}
                          ></div>
                          {cell.value === "Orange" && <span>In Progress</span>}
                          {cell.value === "Green" && <span>Completed</span>}
                          {cell.value === "Red" && <span>Pending</span>}
                        </Td>
                      ) : (
                        cell.value
                      )}
                    </Td>
                  );
                })}

                {!isView && (
                  <Td>
                    {editRowIdx === rowIdx ? (
                      <>
                        <Button size="sm" colorScheme="green" onClick={handleSaveEdit} mr={2}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditRowIdx(null);
                            setEditRowValues({});
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => handleEditClick(rowIdx)}>
                        Edit
                      </Button>
                    )}
                  </Td>
                )}

                {!isView && (
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
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

      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} />
      {renderImagePopUp()}
      {loading && <Loading />}
    </div>
  );
}

export default FormPage;
