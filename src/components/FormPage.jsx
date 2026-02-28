import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { FixedSizeList as List } from "react-window";
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
import ConfirmDialog from "./ConfirmDialog";

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";

const URL = process.env.REACT_APP_PROCESS_URL;

function FormPage({ process, isView = false, currentBomId = null, isDefault = false, rowDataId = null, refresh }) {
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
  const [editingRowIds, setEditingRowIds] = useState([]); 
  const [editingRowId, setEditingRowId] = useState(null);
  const [newRowKey, setNewRowKey] = useState(0); // Key to force re-render/reset of new row

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState(null);

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
    setDeleteTargetIdx(rowIdx);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIdx === null) return;
    
    const rowIdx = deleteTargetIdx;
    const updatedRows = [...rows];
    const updatedRowIds = [...rowIds];

    deleteMutation.mutate({ rowId: rowIds[rowIdx], id: process?.id, userId: userDetails?._id });

    updatedRows.splice(rowIdx, 1);
    updatedRowIds.splice(rowIdx, 1);

    setRows(updatedRows);
    setRowIds(updatedRowIds);
    setDeleteTargetIdx(null);
  };

  const handleSaveEdit = async (items, rowId, rowIdx) => {
    try {
        await updateMutation.mutateAsync({
            rowId,
            items,
            id: process?.id,
        });
        setEditingRowId(null);
        // Optimistic update:
        const updatedRows = [...rows];
        
        const newRow = (process?.header || []).map(h => {
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
              id: process?.id,
              ...(isDefault && { rowDataId: rowDataId})
          });
          setNewRowKey(prev => prev + 1); // Reset new row form
          if (isDefault && refresh) {
              refresh();
          }
      } catch (e) {
          console.error("Failed to add new data", e);
      }
  };

  const handleCellButtonClick = async (row, rowIdx, cellIdx, cellKey) => {
    const cell = row[cellIdx];
    const rowDataId = rowIds[rowIdx];

    let id;
    if (cell.key === "DETAILING PRODUCT") {
      id = process?.id;
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
            parentProcess: process?.process,
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

  const Row = useCallback(({ index, style }) => {
    const row = rows[index];
    const rowId = rowIds[index];
    const isEditing = editingRowId === rowId;

    if (isEditing) {
      return (
        <div style={{ ...style, marginBottom: "10px" }}>
          <EditableRow
            key={rowId}
            headers={process?.header}
            initialData={row}
            currentBomId={currentBomId}
            onSave={(items) => handleSaveEdit(items, rowId, index)}
            onCancel={() => setEditingRowId(null)}
            gridTemplateColumns={gridTemplateColumns}
          />
        </div>
      );
    }

    return (
      <div style={{ ...style }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          gap: "20px",
          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9", // Striped layout
          padding: "8px 10px",
          borderBottom: "1px solid #edf2f7",
          alignItems: "center",
          height: "100%"
        }}>
          {row.map((cell, cellIdx) => {
            if (cell.key === "DETAILING PRODUCT" && Array.isArray(cell.value)) {
              return (
                <DetailingProductCompo 
                  key={cellIdx}
                  bomIds={cell.value}
                  detailingProducts={detailingProducts}
                  ShownArray={ShownArray}
                />
              );
            }

            if (ArrayValuesProcess.includes(cell.key) && Array.isArray(cell.value)) {
              return (
                <div key={cellIdx} style={{ textAlign: "center" }}>
                   <ArrayDisplayCompo values={cell.value} />
                </div>
              );
            }

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
                {cell?.process === "multiSelect" || (typeof cell.value === "string" && cell.value.startsWith("processId -")) ? (
                  <ActionButtonCompo 
                    cell={cell}
                    label={DefaultSelectProcess.includes(cell.key) ? "View" : cell.key === "BREAK HOUR" || cell.key === "ACTION PLAN" || cell.key === "ACTION TAKEN" ? cell.process || "0" : "UPDATE"}
                    colorScheme={ColorProcess.includes(cell.key) ? `${cell.process !== "value" ? `${cell.process}` : "red"}` : "blue"}
                    onClick={() => handleCellButtonClick(row, index, cellIdx, cell.key)}
                  />
                ) : (
                    <TruncatedText text={cell.value} limit={25} />
                )}
              </div>
            );
          })}

          {!isView && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
               <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => setEditingRowId(rowIds[index])}
                    aria-label="Edit"
               />
               <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => handleDeleteRow(index)}
                    aria-label="Delete"
               />
            </div>
          )}
        </div>
      </div>
    );
  }, [rows, rowIds, editingRowId, process?.header, currentBomId, gridTemplateColumns, detailingProducts, isView, getStatusStyle]);

  return (
    <div style={{ position: "relative", backgroundColor: "#f7f9fc", padding: "10px", borderRadius: "10px", height: "100%" }}>
      <div
        ref={tableContainerRef}
        className="FormPageContainer"
        style={{ 
          overflowX: "auto", 
          overflowY: "auto", // Enable vertical scroll for the container
          maxWidth: "100%", 
          maxHeight: "calc(100vh - 250px)", // Set a max height for the table area
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: "8px"
        }}
      >
        <div style={{ minWidth: "fit-content", flex: 1 }}>
          {/* Sticky Header Row */}
          <div style={{
              position: "sticky",
              top: 0,
              zIndex: 15,
              backgroundColor: "#f7f9fc",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns,
              gap: "20px",
              padding: "10px", // Denser header
              borderBottom: "2px solid #e2e8f0"
          }}>
              {process && process.header?.length > 0 ? (
                  <>
                    {process.header.map((col, idx) => (
                      <div key={idx} style={{ 
                        fontWeight: "bold", 
                        color: "#718096", 
                        fontSize: "0.75rem", 
                        textTransform: "uppercase",
                        textAlign: "center"
                      }}>
                        {col}
                      </div>
                    ))}
                    {!isView && <div style={{ fontWeight: "bold", color: "#718096", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "center", minWidth: "max-content", padding: "0 15px" }}>
                        Actions
                    </div>}
                  </>
                ) : (
                  <div>No Process Selected</div>
                )}
          </div>

          {/* Data Rows with Virtualization */}
          <div style={{ minWidth: "fit-content" }}>
              {rows && rows.length > 0 ? (
                <List
                  height={Math.min(500, rows.length * 55)} // Reduced row factor
                  itemCount={rows.length}
                  itemSize={55} // Compact height
                  width="100%"
                  style={{ overflowX: "hidden" }} // Horizontal scroll is handled by FormPageContainer
                >
                  {Row}
                </List>
              ) : (
                 null
              )}
          </div>
          
          {rows.length === 0 && !process?.header && (
              <div style={{ padding: "20px", textAlign: "center", fontStyle: "italic", color: "gray" }}>No Process Selected</div>
          )}

          {/* Sticky Add New Row at the bottom */}
          {!isView && process?.header?.length > 0 && (
              <div style={{ 
                position: "sticky", 
                bottom: 0, 
                backgroundColor: "#f7f9fc", 
                zIndex: 15, 
                padding: "20px 10px",
                marginTop: "10px",
                borderTop: "1px solid #e2e8f0",
                boxShadow: "0 -4px 6px rgba(0,0,0,0.02)"
              }}>
                  <EditableRow
                      key={`new-row-${newRowKey}`}
                      headers={process.header}
                      isNew={true}
                      currentBomId={currentBomId}
                      onSave={handleSaveNew}
                      onCancel={() => setNewRowKey(prev => prev + 1)} // Reset form
                      gridTemplateColumns={gridTemplateColumns}
                  />
              </div>
          )}
        </div>
      </div>

      <SubProcess isOpen={isOpen} onClose={onClose} data={popupData} />

      <ConfirmDialog 
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Row"
        message="Are you sure you want to delete this record? This action cannot be undone."
      />

      {renderImagePopUp()}
      {loading && <Loading />}
    </div>
  );
}

export default FormPage;
