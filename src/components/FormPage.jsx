import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { VariableSizeList as List } from "react-window";
import TruncatedText from "./TruncatedText";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  getHeaderBasedGridTemplate,
  getHeaderBasedColumnWidths,
  estimateWrappedCellHeight,
  DEFAULT_ROW_HEIGHT,
} from "../utils/tableLayout";

// Importing API
import {
  useUpdateProcessData,
  useDeleteProcessData,
  useProcessById,
  useAddProcessData,
} from "../services/Process";
import {
  usePermissions,
  getAccessDeniedReason,
} from "../services/permissions";

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
import ImageCompo from "./ImageCompo";
import MeasuredListRow from "./MeasuredListRow";
import DisabledWithTooltip from "./DisabledWithTooltip";

// importing styles
import "../styles/departmentpage.css";

import ItemsData from "../utils/ItemsData.json";
import { setDetailingProducts } from "../redux/slices/department";
import { PROCESS_URL } from "../config/api";

const URL = PROCESS_URL;

const CELL_WRAP_STYLE = {
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
};

const STATUS_CELL_STYLE = {
  maxWidth: "100%",
  overflow: "visible",
  whiteSpace: "nowrap",
  minWidth: 0,
};

function FormPage({
  process,
  isView = false,
  currentBomId = null,
  isDefault = false,
  rowDataId = null,
  refresh,
  isAddingNewRow = false,
  setIsAddingNewRow,
  initialValues = null,
}) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProcessData();
  const deleteMutation = useDeleteProcessData();
  const addMutation = useAddProcessData();

  const {
    ArrayValuesProcess,
    DefaultSelectProcess,
    ImageUploadArray,
    ShownArray,
    ColorProcess,
    DateFieldsArray,
    ProcessDateFields,
  } = ItemsData;

  const processScopedDateFields =
    (process?.processId && ProcessDateFields?.[process.processId]) || [];

  const dispatch = useDispatch();
  const { isEditor, isCreator, isViewer, isAdmin, hasAccessToProcess } =
    usePermissions();
  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts,
  );
  const stateProcess = useSelector((state) => state.department.process);
  const userDetails = useSelector((state) => state.auth.userDetails);

  // Process-specific authorization (e.g. NPD Register → DD/R/010)
  const hasProcessAccess =
    isAdmin ||
    !process?.processId ||
    hasAccessToProcess(process.processId);

  // Computed permissions (accessLevel + processAccess)
  const canModify = !isView && !isViewer && hasProcessAccess;
  const canEdit = canModify && (isEditor || isAdmin);
  const canCreate = canModify && (isEditor || isCreator || isAdmin);
  const canDelete = canModify && (isEditor || isAdmin);
  // UPDATE / nested process buttons (PROTO, VALIDATION, …)
  const canClickUpdate = canModify && (isEditor || isAdmin || isCreator);

  // Show Actions (disabled + tooltip) when restricted; hide for intentional view-only (e.g. Products)
  const showActionsColumn =
    Boolean(process?.header?.length) &&
    (canModify || isViewer || !hasProcessAccess || (isView && isDefault));

  const editDeniedReason = getAccessDeniedReason({
    hasProcessAccess,
    isViewer,
    isView,
    action: "edit",
  });
  const deleteDeniedReason = getAccessDeniedReason({
    hasProcessAccess,
    isViewer,
    isView,
    action: "delete",
  });
  const updateDeniedReason = getAccessDeniedReason({
    hasProcessAccess,
    isViewer,
    isView,
    action: "edit",
  });

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
  const listRef = useRef(null);
  const rowSizeMap = useRef({});
  const [listSizeVersion, setListSizeVersion] = useState(0);

  // For SubProcess modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const colorCoordinates = [
    { label: "In Progress", color: "#ffb176" },
    { label: "Pending", color: "#ff4545" },
    { label: "Completed", color: "#92ff89" },
    { label: "Planning", color: "#89b8ff" },
  ];

  // Determine BOM process ID for detailing logic
  const bomProcessId =
    process?.process === "Products" && stateProcess
      ? stateProcess.find((item) => item.process === "Bill of Materials - BOM")
          ?._id ||
        stateProcess.find((item) => item.process === "Bill of Materials - BOM")
          ?.id
      : null;

  // Fetch BOM data if needed
  const { data: bomData } = useProcessById(bomProcessId);

  // Convert epoch milliseconds string → DD/MM/YYYY for display
  const formatEpochToDate = (value) => {
    if (!value) return value;
    const num = Number(value);
    if (isNaN(num) || String(value).trim() === "") return value; // not a number, return as-is
    const d = new Date(num);
    if (isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

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
    } else if (
      lowerVal.includes("prototype") ||
      lowerVal.includes("progress")
    ) {
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
              (row) => row.rowDataId === currentBomId,
            ),
          }
        : bomData;

      dispatch(setDetailingProducts(filteredData));
    }
    // Depend on stable process fields — whole `process` object identity changes often
    // and was remounting inline edit rows mid-typing.
  }, [
    process?.id,
    process?.process,
    process?.processId,
    process?.value,
    process?.header,
    process?.rowIds,
    bomData,
    currentBomId,
    dispatch,
  ]);

  const columnWidths = useMemo(
    () =>
      getHeaderBasedColumnWidths(process?.header || [], {
        // Fixed width so edit/add IconButtons fit without clipping
        extraColumns: showActionsColumn ? [100] : [],
      }),
    [process?.header, showActionsColumn],
  );

  const setRowSize = useCallback((index, size) => {
    const next = Math.ceil(size);
    if (rowSizeMap.current[index] !== next) {
      rowSizeMap.current[index] = next;
      listRef.current?.resetAfterIndex(index);
      // Re-render so VariableSizeList height tracks measured content (no inner scroll)
      setListSizeVersion((v) => v + 1);
    }
  }, []);

  const getItemSize = useCallback(
    (index) => {
      if (rowSizeMap.current[index] != null) {
        return rowSizeMap.current[index];
      }

      const row = rows[index];
      if (!row) return DEFAULT_ROW_HEIGHT;

      if (editingRowId && rowIds[index] === editingRowId) {
        return Math.max(DEFAULT_ROW_HEIGHT, 120);
      }

      const detailingCell = row.find((c) => c.key === "DETAILING PRODUCT");
      if (
        detailingCell &&
        Array.isArray(detailingCell.value) &&
        detailingCell.value.length > 0
      ) {
        const count = detailingCell.value.length;
        // Header ~32px + each nested row ~28px + padding (no height cap / inner scroll)
        return Math.max(DEFAULT_ROW_HEIGHT, count * 28 + 48);
      }

      let maxHeight = DEFAULT_ROW_HEIGHT;
      (process?.header || []).forEach((headerKey, colIdx) => {
        const cell = row.find((c) => c.key === headerKey);
        const width = columnWidths[colIdx] || 120;
        maxHeight = Math.max(
          maxHeight,
          estimateWrappedCellHeight(cell?.value, width),
        );
      });
      return maxHeight;
    },
    [rows, rowIds, editingRowId, process?.header, columnWidths],
  );

  useEffect(() => {
    rowSizeMap.current = {};
    setListSizeVersion((v) => v + 1);
    listRef.current?.resetAfterIndex(0);
  }, [rows, columnWidths, editingRowId]);

  const handleDeleteRow = (rowIdx) => {
    setDeleteTargetIdx(rowIdx);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIdx === null) return;

    const rowIdx = deleteTargetIdx;
    const updatedRows = [...rows];
    const updatedRowIds = [...rowIds];

    deleteMutation.mutate({
      rowId: rowIds[rowIdx],
      id: process?.id,
      userId: userDetails?._id,
    });

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

      const newRow = (process?.header || []).map((h) => {
        const item = items.find((i) => i.key === h);
        return item || { key: h, value: "", process: "value" };
      });
      updatedRows[rowIdx] = newRow;
      setRows(updatedRows);

      if (refresh) {
        await refresh();
      }
    } catch (e) {
      console.error("Failed to save edit", e);
    }
  };

  const handleSaveNew = async (items) => {
    try {
      await addMutation.mutateAsync({
        items,
        id: process?.id,
        ...((isDefault || rowDataId) && { rowDataId: rowDataId }),
      });
      setNewRowKey((prev) => prev + 1); // Reset new row form
      if (setIsAddingNewRow) {
        setIsAddingNewRow(false);
      }
      if (refresh) {
        await refresh();
      }
    } catch (e) {
      console.error("Failed to add new data", e);
    }
  };

  const handleCellButtonClick = async (
    row,
    rowIdx,
    cellIdx,
    cellKey,
    { forceView = false } = {},
  ) => {
    const cell =
      row.find((c) => c.key === cellKey) || row[cellIdx] || { key: cellKey, value: "" };
    const rowDataId = rowIds[rowIdx];

    const isViewOnlyCell =
      forceView ||
      DefaultSelectProcess.includes(cell.key) ||
      !canClickUpdate;

    // Block nested open only when the process itself is not authorized
    if (
      !DefaultSelectProcess.includes(cell.key) &&
      !hasProcessAccess &&
      !forceView
    ) {
      return;
    }

    let id;
    if (cell.key === "DETAILING PRODUCT") {
      id = process?.id;
    } else {
      id = cell.value.split("processId -")[1]?.trim();
    }

    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["process", id],
        queryFn: async () => {
          const res = await axios.get(`${URL}/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          return res.data.data;
        },
        staleTime: 1000 * 60,
      });

      setPopupData({
        parentProcess: process?.process,
        row,
        rowIdx,
        cellIdx,
        nestedProcess: response || null,
        rowDataId,
        openAsView: isViewOnlyCell,
      });
      onOpen();
    } catch (error) {
      console.error("Error fetching nested process:", error);
    }
  };

  // Removed renderImagePopUp - now using ImageCompo

  const loading =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    addMutation.isPending;

  const gridTemplateColumns = useMemo(
    () =>
      getHeaderBasedGridTemplate(process?.header || [], {
        extraColumns: showActionsColumn ? [100] : [],
      }),
    [process?.header, showActionsColumn],
  );

  const Row = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      const rowId = rowIds[index];
      const isEditing = editingRowId === rowId;

      if (isEditing) {
        return (
          <MeasuredListRow
            index={index}
            style={{ ...style, marginBottom: "10px" }}
            setRowSize={setRowSize}
            extraPad={10}
          >
            <EditableRow
              key={rowId}
              headers={process?.header}
              processId={process?.processId || null}
              rowId={rowId}
              initialData={row}
              initialValues={initialValues}
              currentBomId={currentBomId}
              onSave={(items) => handleSaveEdit(items, rowId, index)}
              onCancel={() => setEditingRowId(null)}
              gridTemplateColumns={gridTemplateColumns}
            />
          </MeasuredListRow>
        );
      }

      return (
        <MeasuredListRow
          index={index}
          style={{ ...style, paddingBottom: "2px" }}
          setRowSize={setRowSize}
          extraPad={2}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridTemplateColumns,
              gap: "0",
              backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9",
              padding: "0",
              borderBottom: "1px solid #edf2f7",
              alignItems: "stretch",
            }}
          >
            {(process?.header || []).map((headerKey, cellIdx) => {
              const cell = row.find((c) => c.key === headerKey) || {
                key: headerKey,
                value: "",
                process: null,
              };
              if (
                cell.key === "DETAILING PRODUCT" &&
                Array.isArray(cell.value)
              ) {
                return (
                  <div
                    key={cellIdx}
                    style={{
                      borderRight: "1px solid #edf2f7",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "stretch",
                      justifyContent: "stretch",
                      overflow: "visible",
                      maxWidth: "100%",
                    }}
                  >
                    <DetailingProductCompo
                      key={cellIdx}
                      bomIds={cell.value}
                      detailingProducts={detailingProducts}
                      ShownArray={ShownArray}
                    />
                  </div>
                );
              }

              if (
                ArrayValuesProcess.includes(cell.key) &&
                Array.isArray(cell.value)
              ) {
                return (
                  <div
                    key={cellIdx}
                    style={{
                      borderRight: "1px solid #edf2f7",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...CELL_WRAP_STYLE,
                    }}
                  >
                    <ArrayDisplayCompo values={cell.value} />
                  </div>
                );
              }

              if (ImageUploadArray.includes(cell.key)) {
                return (
                  <div
                    key={cellIdx}
                    style={{
                      borderRight: "1px solid #edf2f7",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...CELL_WRAP_STYLE,
                    }}
                  >
                    <ImagePreviewCompo
                      key={cellIdx}
                      url={cell.value}
                      isView={true}
                      onClick={() => setImagePopupUrl(cell.value)}
                    />
                  </div>
                );
              }

              if (
                [
                  "Planning",
                  "In Progress",
                  "Completed",
                  "Pending",
                  "Waiting For Order",
                  "In Prototype",
                  "Complete",
                  "Not Feasible",
                  "Order Confirmed",
                  "Under Process",
                  "Supplied to Customer",
                ].includes(cell.value)
              ) {
                return (
                  <div
                    key={cellIdx}
                    style={{
                      borderRight: "1px solid #edf2f7",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...STATUS_CELL_STYLE,
                    }}
                  >
                    <StatusBadgeCompo
                      key={cellIdx}
                      value={cell.value}
                      getStatusStyle={getStatusStyle}
                    />
                  </div>
                );
              }

              const isDateField =
                DateFieldsArray.some(
                  (d) =>
                    d.trim().toLowerCase() === cell.key.trim().toLowerCase(),
                ) ||
                processScopedDateFields.some(
                  (d) =>
                    d.trim().toLowerCase() === cell.key.trim().toLowerCase(),
                );
              const displayValue = isDateField
                ? formatEpochToDate(cell.value)
                : cell.value;

              return (
                <div
                  key={cellIdx}
                  className={`RowsField ${cell.key === "IN" ? "Green" : cell.key === "OUT" ? "Red" : ""}`}
                  style={{
                    fontSize: "0.8rem",
                    color: "#2d3748",
                    fontWeight: "500",
                    textAlign: "center",
                    borderRight: "1px solid #edf2f7",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(isDateField
                      ? {
                          whiteSpace: "nowrap",
                          overflow: "visible",
                          maxWidth: "100%",
                        }
                      : CELL_WRAP_STYLE),
                  }}
                >
                  {cell?.process === "multiSelect" ||
                  (typeof cell.value === "string" &&
                    cell.value.startsWith("processId -")) ? (
                    <div style={{ maxWidth: "100%" }}>
                      <ActionButtonCompo
                        cell={cell}
                        label={
                          DefaultSelectProcess.includes(cell.key)
                            ? "View"
                            : cell.key === "BREAK HOUR" ||
                                cell.key === "ACTION TAKEN"
                              ? cell.process || "0"
                              : "UPDATE"
                        }
                        colorScheme={
                          ColorProcess.includes(cell.key)
                            ? `${cell.process !== "value" ? `${cell.process}` : "red"}`
                            : "blue"
                        }
                        isDisabled={
                          !DefaultSelectProcess.includes(cell.key) &&
                          !hasProcessAccess
                        }
                        disabledReason={updateDeniedReason}
                        onClick={() =>
                          handleCellButtonClick(row, index, cellIdx, cell.key)
                        }
                      />
                    </div>
                  ) : (
                    <TruncatedText text={displayValue} wrap={!isDateField} />
                  )}
                </div>
              );
            })}

            {showActionsColumn && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                }}
              >
                <DisabledWithTooltip
                  isDisabled={!canEdit}
                  label={editDeniedReason}
                >
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    isDisabled={!canEdit}
                    onClick={
                      canEdit
                        ? () => setEditingRowId(rowIds[index])
                        : undefined
                    }
                    aria-label="Edit"
                    pointerEvents={canEdit ? "auto" : "none"}
                  />
                </DisabledWithTooltip>
                <DisabledWithTooltip
                  isDisabled={!canDelete}
                  label={deleteDeniedReason}
                >
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    isDisabled={!canDelete}
                    onClick={
                      canDelete ? () => handleDeleteRow(index) : undefined
                    }
                    aria-label="Delete"
                    pointerEvents={canDelete ? "auto" : "none"}
                  />
                </DisabledWithTooltip>
              </div>
            )}
          </div>
        </MeasuredListRow>
      );
    },
    [
      rows,
      rowIds,
      editingRowId,
      process?.header,
      process?.processId,
      currentBomId,
      gridTemplateColumns,
      detailingProducts,
      getStatusStyle,
      setRowSize,
      showActionsColumn,
      canEdit,
      canDelete,
      canClickUpdate,
      hasProcessAccess,
      editDeniedReason,
      deleteDeniedReason,
      updateDeniedReason,
      handleSaveEdit,
      handleCellButtonClick,
      processScopedDateFields,
    ],
  );

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#f7f9fc",
        padding: "10px",
        borderRadius: "10px",
        height: "100%",
      }}
    >
      <div
        ref={tableContainerRef}
        className="FormPageContainer"
        style={{
          overflowX: "auto",
          overflowY: "hidden", // Vertical scroll only on the list / parent modal
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: "8px",
        }}
      >
        <div style={{ minWidth: "fit-content", flex: 1 }}>
          {/* Sticky Header Row */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 15,
              backgroundColor: "#f7f9fc",
              display: "grid",
              gridTemplateColumns: gridTemplateColumns,
              gap: "0",
              padding: "0", // Padding removed to align with rows
              borderBottom: "2px solid #e2e8f0",
              alignItems: "stretch",
            }}
          >
            {process && process.header?.length > 0 ? (
              <>
                {process.header.map((col, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontWeight: "bold",
                      color: "#718096",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      textAlign: "center",
                      borderRight: "1px solid #e2e8f0",
                      padding: "12px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>{col}</span>
                  </div>
                ))}
                {showActionsColumn && (
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#718096",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      textAlign: "center",
                      padding: "12px 15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </div>
                )}
              </>
            ) : (
              <div>No Process Selected</div>
            )}
          </div>

          <div style={{ minWidth: "fit-content" }}>
            {rows && rows.length > 0 ? (
              <List
                ref={listRef}
                height={(() => {
                  void listSizeVersion; // measured sizes bump this so height recalculates
                  const total = rows.reduce(
                    (acc, _, i) => acc + getItemSize(i),
                    0,
                  );
                  // Small tables (e.g. BOM modal): expand fully — parent/modal scrolls once.
                  // Large tables: keep a capped list viewport for virtualization.
                  if (rows.length <= 40) {
                    return Math.max(total, DEFAULT_ROW_HEIGHT);
                  }
                  const viewportCap =
                    typeof window !== "undefined"
                      ? Math.max(400, window.innerHeight - 280)
                      : 500;
                  return Math.min(viewportCap, Math.max(total, DEFAULT_ROW_HEIGHT));
                })()}
                itemCount={rows.length}
                itemSize={getItemSize}
                width="100%"
                style={{ overflowX: "hidden" }}
              >
                {Row}
              </List>
            ) : null}
          </div>

          {rows.length === 0 && !process?.header && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                fontStyle: "italic",
                color: "gray",
              }}
            >
              No Process Selected
            </div>
          )}

          {/* Inline add row — same grid as header/body (no extra horizontal padding) */}
          {canCreate && process?.header?.length > 0 && isAddingNewRow && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#f7f9fc",
                zIndex: 15,
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <EditableRow
                key={`new-row-${newRowKey}`}
                headers={process.header}
                processId={process?.processId || null}
                rowId={`new-row-${newRowKey}`}
                isNew={true}
                initialValues={initialValues}
                currentBomId={currentBomId}
                onSave={handleSaveNew}
                onCancel={() => {
                  setNewRowKey((prev) => prev + 1);
                  if (setIsAddingNewRow) setIsAddingNewRow(false);
                }}
                gridTemplateColumns={gridTemplateColumns}
              />
            </div>
          )}
        </div>
      </div>

      <SubProcess
        isOpen={isOpen}
        onClose={onClose}
        data={popupData}
        isView={
          isView ||
          isViewer ||
          !hasProcessAccess ||
          !canClickUpdate ||
          !!popupData?.openAsView
        }
      />

      <ConfirmDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Row"
        message="Are you sure you want to delete this record? This action cannot be undone."
      />

      <ImageCompo
        imageUrl={imagePopupUrl}
        onClose={() => setImagePopupUrl(null)}
      />
      {loading && <Loading />}
    </div>
  );
}

export default FormPage;
