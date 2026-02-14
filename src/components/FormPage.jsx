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
  IconButton,
  Flex,
  Text,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AttachmentIcon } from "@chakra-ui/icons";
import TruncatedText from "./TruncatedText";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Importing API
import { 
  useUpdateProcessData, 
  useDeleteProcessData, 
  useProcessById, 
  useAddProcessData 
} from "../services/Process";

// importing components
import Loading from "../hooks/Loading";
import SubProcess from "./SubProcess"; // modal for nested process
import EditableRow from "./EditableRow";
import DetailingProductCompo from "./DetailingProductCompo";
import ArrayDisplayCompo from "./ArrayDisplayCompo";
import ImagePreviewCompo from "./ImagePreviewCompo";
import StatusBadgeCompo from "./StatusBadgeCompo";
import ActionButtonCompo from "./ActionButtonCompo";

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";

const URL = process.env.REACT_APP_PROCESS_URL;

function FormPage({ process, isView = false, currentBomId = null }) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProcessData();
  const deleteMutation = useDeleteProcessData();
  const addMutation = useAddProcessData();

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

  // Inline Editing State
  const [editingRowIds, setEditingRowIds] = useState([]); // Allow multiple edits? No, usually single. Let's stick to single for simplicity or array if requested. User didn't specify. Single is safer.
  const [editingRowId, setEditingRowId] = useState(null);
  const [newRowKey, setNewRowKey] = useState(0); // Key to force re-render/reset of new row

  const tableContainerRef = useRef(null);

  // For SubProcess modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const colorCoordinates = [
    { label: "In Progress", color: "#ffb176" },
    { label: "Pending", color: "#ff4545" },
    { label: "Completed", color: "#92ff89" },
    { label: "Planning", color: "#89b8ff" },
  ];

  // Determine BOM process ID for detailing logic
  const bomProcessId = (process?.process === "Products" && stateProcess) 
    ? stateProcess.find((item) => item.process === "Bill of Materials - BOM")?._id || 
      stateProcess.find((item) => item.process === "Bill of Materials - BOM")?.id
    : null;

  // Fetch BOM data if needed
  const { data: bomData } = useProcessById(bomProcessId);

  const getStatusStyle = (value) => {
    let badgeColor = "gray.100";
    let textColor = "gray.600";
    let dotColor = "gray.500";
    
    if (!value) return { badgeColor, textColor, dotColor };

    const lowerVal = value.toLowerCase();
    if (lowerVal.includes("waiting") || lowerVal.includes("planning")) {
        badgeColor = "#fffaf0"; // orangeish
        textColor = "#dd6b20";
        dotColor = "#dd6b20";
    } else if (lowerVal.includes("prototype") || lowerVal.includes("progress")) {
        badgeColor = "#ebf8ff"; // blueish
        textColor = "#3182ce";
        dotColor = "#3182ce";
    } else if (lowerVal.includes("complete") || lowerVal.includes("done")) {
        badgeColor = "#f0fff4"; // greenish
        textColor = "#38a169";
        dotColor = "#38a169";
    } else if (lowerVal.includes("pending")) {
        badgeColor = "#fff5f5"; // reddish
        textColor = "#e53e3e";
        dotColor = "#e53e3e";
    }
    return { badgeColor, textColor, dotColor };
  };

  useEffect(() => {
    if (process?.value && process?.header) {
      setRows(process.value);
      setRowIds(process.rowIds || []);
    } else {
      setRows([]);
      setRowIds([]);
    }

    if (process?.process === "Products" && bomData) {
          const filteredData = currentBomId
            ? {
                ...bomData,
                data: bomData?.data?.filter(
                  (row) => row.rowDataId === currentBomId
                ),
              }
            : bomData;

          dispatch(setDetailingProducts(filteredData));
    }
  }, [process, bomData, currentBomId, dispatch]);

  const handleDeleteRow = (rowIdx) => {
    if(window.confirm("Are you sure you want to delete this row?")) {
        const updatedRows = [...rows];
        const updatedRowIds = [...rowIds];
    
        deleteMutation.mutate({ rowId: rowIds[rowIdx], id: process.id, userId: userDetails?._id });
    
        updatedRows.splice(rowIdx, 1);
        updatedRowIds.splice(rowIdx, 1);
    
        setRows(updatedRows);
        setRowIds(updatedRowIds);
    }
  };

  const handleSaveEdit = async (items, rowId, rowIdx) => {
    try {
        await updateMutation.mutateAsync({
            rowId,
            items,
            id: process.id,
        });
        setEditingRowId(null);
        // Optimistic update:
        const updatedRows = [...rows];
        
        // Need to convert items (array of {key, value, process}) back to row structure matching process.header
        // But logic in EditableRow works with Items. existing logic in FormPage used objectToRow.
        // Let's reuse objectToRow logic but adapted.
        // Actually Items returned by EditableRow are already fully formed {key, value, process} objects.
        // But rows in state are arrays of cells.
        // So we need to map headers to these items.
        
        const newRow = process.header.map(h => {
            const item = items.find(i => i.key === h);
            return item || { key: h, value: "", process: "value" };
        });
        updatedRows[rowIdx] = newRow;
        setRows(updatedRows);

    } catch (e) {
        console.error("Failed to save edit", e);
    }
  };

  const handleSaveNew = async (items) => {
      try {
          await addMutation.mutateAsync({
              items,
              id: process.id
          });
          setNewRowKey(prev => prev + 1); // Reset new row form
          // We can't easily optimistic update since we don't know the new ID.
          // Rely on refetch.
      } catch (e) {
          console.error("Failed to add new data", e);
      }
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

    try {
        const response = await queryClient.fetchQuery({
            queryKey: ['process', id],
            queryFn: async () => {
                const res = await axios.get(`${URL}/${id}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                return res.data.data;
            },
            staleTime: 1000 * 60
        });

        setPopupData({
            parentProcess: process.process,
            row,
            rowIdx,
            cellIdx,
            nestedProcess: response || null,
            rowDataId,
        });
        onOpen();
    } catch (error) {
        console.error("Error fetching nested process:", error);
    }
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


  const loading = updateMutation.isPending || deleteMutation.isPending || addMutation.isPending;

  const gridTemplateColumns = process?.header
    ? process.header.map(h => h === "DETAILING PRODUCT" ? "minmax(450px, 4fr)" : "minmax(150px, 1fr)").join(" ") + (!isView ? " 160px" : "")
    : `repeat(${process?.header?.length || 1}, 150px) max-content`;

  return (
    <div style={{ position: "relative", backgroundColor: "#f7f9fc", padding: "20px", borderRadius: "10px" }}>
      <div
        ref={tableContainerRef}
        className="FormPageContainer"
        style={{ overflowX: "auto", maxWidth: "100%" }}
      >
        {/* Header Row */}
        <div style={{
            display: "grid",
            gridTemplateColumns: gridTemplateColumns,
            gap: "20px",
            marginBottom: "10px",
            padding: "0 10px",
            minWidth: "fit-content"
        }}>
            {process && process.header?.length > 0 ? (
                <>
                  {process.header.map((col, idx) => (
                    <div key={idx} style={{ 
                      fontWeight: "bold", 
                      color: "#718096", 
                      fontSize: "0.75rem", 
                      textTransform: "uppercase",
                      textAlign: "center",
                      padding: "10px 0"
                    }}>
                      {col}
                    </div>
                  ))}
                  {!isView && <div style={{ fontWeight: "bold", color: "#718096", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center", minWidth: "max-content", padding: "10px 15px" }}>
                      Actions
                  </div>}
                </>
              ) : (
                <div>No Process Selected</div>
              )}
        </div>

        {/* Data Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "fit-content" }}>
            {rows && rows.length > 0 ? (
              rows.map((row, rowIdx) => {
                  const rowId = rowIds[rowIdx];
                  const isEditing = editingRowId === rowId;

                  if (isEditing) {
                      return (
                          <EditableRow
                             key={rowId}
                             headers={process.header}
                             initialData={row}
                             currentBomId={currentBomId}
                             onSave={(items) => handleSaveEdit(items, rowId, rowIdx)}
                             onCancel={() => setEditingRowId(null)}
                             gridTemplateColumns={gridTemplateColumns}
                          />
                      );
                  }

                  return (
                    <div key={rowIdx} style={{
                        display: "grid",
                        gridTemplateColumns: gridTemplateColumns,
                        gap: "20px",
                        backgroundColor: "white",
                        padding: "15px 10px",
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        alignItems: "center"
                    }}>
                      {row.map((cell, cellIdx) => {
                        // 🧩 Detailing Product Display Logic
                        if (
                          cell.key === "DETAILING PRODUCT" &&
                          Array.isArray(cell.value)
                        ) {
                          return (
                            <DetailingProductCompo 
                              key={cellIdx}
                              bomIds={cell.value}
                              detailingProducts={detailingProducts}
                              ShownArray={ShownArray}
                            />
                          );
                        }

                        // ⚙️ Existing array display logic
                        if (
                          ArrayValuesProcess.includes(cell.key) &&
                          Array.isArray(cell.value)
                        ) {
                          return (
                            <div key={cellIdx} style={{ textAlign: "center" }}>
                               <ArrayDisplayCompo values={cell.value} />
                            </div>
                          );
                        }

                        // 🔹 Image Upload handling
                        if (ImageUploadArray.includes(cell.key)) {
                          return (
                            <ImagePreviewCompo 
                              key={cellIdx}
                              url={cell.value}
                              isView={isView}
                              onClick={() => setImagePopupUrl(cell.value)}
                            />
                          );
                        }
                        
                        // Status Badge Logic
                        if (["Planning", "In Progress", "Completed", "Pending", "Waiting For Order", "In Prototype", "Complete", "Not Feasible", "Order Confirmed", "Under Process", "Supplied to Customer"].includes(cell.value)) {
                             return (
                               <StatusBadgeCompo 
                                 key={cellIdx}
                                 value={cell.value}
                                 getStatusStyle={getStatusStyle}
                               />
                            );
                        }

                        return (
                          <div key={cellIdx} className={`RowsField ${cell.key === "IN" ? "Green" : cell.key === "OUT" ? "Red" : ""}`} style={{ fontSize: "0.8rem", color: "#2d3748", fontWeight: "500", textAlign: "center" }}>
                            {cell?.process === "multiSelect" ||
                            (typeof cell.value === "string" &&
                              cell.value.startsWith("processId -")) ? (
                              <ActionButtonCompo 
                                cell={cell}
                                label={DefaultSelectProcess.includes(cell.key)
                                  ? "View"
                                  : cell.key === "BREAK HOUR" || cell.key === "ACTION PLAN" || cell.key === "ACTION TAKEN"
                                  ? cell.process || "0"
                                  : "UPDATE"}
                                colorScheme={ColorProcess.includes(cell.key)
                                  ? `${cell.process !== "value" ? `${cell.process}` : "red"}`
                                  : "blue"}
                                onClick={() => handleCellButtonClick(row, rowIdx, cellIdx, cell.key)}
                              />
                            ) : (
                                <TruncatedText text={cell.value} limit={25} />
                            )}
                          </div>
                        );
                      })}

                      {/* Actions Column */}
                      {!isView && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                           {/* Action Buttons */}
                           <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => setEditingRowId(rowIds[rowIdx])}
                                aria-label="Edit"
                           />
                           <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => handleDeleteRow(rowIdx)}
                                aria-label="Delete"
                           />
                        </div>
                      )}
                    </div>
                  );
              })
            ) : (
               null
            )}

            {/* Always Show Add New Row at the bottom specific to layout request */}
            {!isView && process?.header?.length > 0 && (
                <EditableRow
                    key={`new-row-${newRowKey}`}
                    headers={process.header}
                    isNew={true}
                    currentBomId={currentBomId}
                    onSave={handleSaveNew}
                    onCancel={() => setNewRowKey(prev => prev + 1)} // Reset form
                    gridTemplateColumns={gridTemplateColumns}
                />
            )}
            
            {rows.length === 0 && !process?.header && (
                <div style={{ padding: "20px", textAlign: "center", fontStyle: "italic", color: "gray" }}>No Process Selected</div>
            )}
        </div>
      </div>

      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} />

      {renderImagePopUp()}
      {loading && <Loading />}
    </div>
  );
}

export default FormPage;
