import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Flex,
  Box,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import TruncatedText from "./TruncatedText";
import { useDispatch, useSelector } from "react-redux";

// components
import Loading from "../hooks/Loading";
import FormDialog from "../hooks/FormDialog";
import ProductValidationCompo from "./ProductValidationCompo";
import ProtoCompo from "./ProtoCompo";
import TechnicalSpecificationCompo from "./TechnicalSpecificationCompo";
import BOMCompo from "./BOMCompo";
import BreakHourCompo from "./BreakHourCompo";
import ContinousImprovementCompo from "./ContinousImprovementCompo";
import DefaultProcessCompo from "./DefaultProcessCompo";

// assets

// styles
import "../styles/subprocess.css";

// API
import Process from "../services/Process";

// utils
import ItemsData from "../utils/ItemsData";
import { setDetailingProducts } from "../redux/slices/department";

function SubProcess({ isOpen, onClose, data, loading, isView = false }) {
  const {
    handleAddData,
    handleUpdateData,
    handleDeleteData,
    handleGetSingleProcess,
    loading: processLoading,
  } = Process();
  const { DefaultTemplateForProtoProcess, ImageUploadArray } = ItemsData;
  const [imagePopupUrl, setImagePopupUrl] = useState(null);
  const dispatch = useDispatch();

  const process = useSelector((state) => state.department.process);
  const userDetails = useSelector((state) => state.auth.userDetails);

  const [nested, setNested] = useState(null);
  const [rows, setRows] = useState([]);
  const [rowIds, setRowIds] = useState([]);
  const [showAddData, setShowAddData] = useState(false);
  const [showBOMAddData, setShowBOMAddData] = useState(false);

  // FormDialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRowIdx, setFormRowIdx] = useState(null);
  const [protoFormIdx, setProtoFormIdx] = useState(null);
  const [formInitialData, setFormInitialData] = useState({});
  const [selectArray, setSelectArray] = useState([]);
  const [bomProducts, setBomProducts] = useState(null);
  const [editingProtoCell, setEditingProtoCell] = useState(null); // { rowIdx, colIdx }


  const colorCoordinatesProto = [
    { label: "In Progress", color: "#ffb176" },
    { label: "Pending", color: "#ff4545" },
    { label: "Completed", color: "#92ff89" },
  ];

  // ------------------------
  // Helper: format process data
  // ------------------------
  const formatProcessData = (processData, rowDataId) => {
    if (!processData) return null;

    const filteredRows = processData.data.filter(
      (row) => row.rowDataId === rowDataId
    );

    return {
      id: processData._id,
      process: processData.process,
      header: processData.headers,
      value: filteredRows.map((row) =>
        row.items.map((cell) => ({
          key: cell.key,
          value: cell.value,
          process: cell.process || null,
        }))
      ),
      rowIds: filteredRows.map((row) => row._id),
      rowDataId,
    };
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

  // load nested process
  useEffect(() => {
    if (!data?.nestedProcess) {
      setNested(null);
      setRows([]);
      setRowIds([]);
      return;
    }
    const formatted = formatProcessData(data.nestedProcess, data.rowDataId);

    setNested(formatted);
    setRows(formatted.value);
    setRowIds(formatted.rowIds);
  }, [data]);

  const handleRefresh = async () => {
    if (!nested?.id) return;
    const response = await handleGetSingleProcess(nested.id);
    const formatted = formatProcessData(response, nested.rowDataId);
    setNested(formatted);
    setRows(formatted.value);
    setRowIds(formatted.rowIds);
  };

  const handleBomProducts = async () => {
    // find the "Products" process dynamically
    const productProcess = process.find((p) => p.process === "Products");

    if (!productProcess) {
      console.error("Products process not found in state");
      return;
    }

    const response = await handleGetSingleProcess(productProcess.id);
    const formatted = formatProcessData(response, data.rowDataId);
    setBomProducts(formatted);
  };

  useEffect(() => {
    if (nested?.process === "Bill of Materials - BOM") {
      dispatch(setDetailingProducts(nested));
      handleBomProducts();
    }
  }, [nested]);


  // convert row array to object keyed by header
  const getRowData = (row) => {
    const obj = {};
    nested.header.forEach((col) => {
      const cell = row.find((item) => item.key === col);
      obj[col] = cell ? cell.value : "";
    });
    return obj;
  };

  // convert back to row array
  const objectToRow = (data, oldRow) => {
    const dataMap = Array.isArray(data)
      ? data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
      : data;

    return nested.header.map((col, idx) => ({
      ...oldRow[idx],
      value: dataMap[col] !== undefined ? dataMap[col] : "",
    }));
  };

  // handle add data
  const handleAddDataSave = async (newData) => {
    const response = await handleAddData({
      items: newData,
      id: nested.id,
      rowDataId: nested.rowDataId,
    });

    // filter again after save
    const filteredRows = response.data.filter(
      (row) => row.rowDataId === nested.rowDataId
    );

    const formattedRows = filteredRows.map((row) =>
      row.items.map((cell) => ({
        key: cell.key,
        value: cell.value,
        process: cell.process || null,
      }))
    );

    const updatedRowIds = filteredRows.map((row) => row._id);
    setNested({
      id: response._id,
      process: response.process,
      header: response.headers,
      value: formattedRows,
      rowIds: updatedRowIds,
      rowDataId: nested.rowDataId,
    });

    setRows(formattedRows);
    setRowIds(updatedRowIds);
  };

  const handleAddDataSaveForBOM = async (newData) => {
    const response = await handleAddData({
      items: newData,
      id: bomProducts.id,
      rowDataId: bomProducts.rowDataId,
    });

    // filter again after save
    const filteredRows = response.data.filter(
      (row) => row.rowDataId === bomProducts.rowDataId
    );

    const formattedRows = filteredRows.map((row) =>
      row.items.map((cell) => ({
        key: cell.key,
        value: cell.value,
        process: cell.process || null,
      }))
    );

    setBomProducts({
      id: response._id,
      process: response.process,
      header: response.headers,
      value: formattedRows,
      rowIds: filteredRows.map((row) => row._id),
      rowDataId: bomProducts.rowDataId,
    });
  };

  // edit button
  const handleEditClick = (rowIdx) => {
    setSelectArray([]);
    setFormRowIdx(rowIdx);
    setFormInitialData(getRowData(rows[rowIdx]));
    setIsFormOpen(true);
  };


  // delete button
  // delete button
  const handleDeleteRow = async (rowIdx) => {
    try {
      const rowIdToDelete = rowIds[rowIdx];
      if (!rowIdToDelete) {
        console.error("No row ID found for index:", rowIdx);
        return;
      }

      // 🔥 Call backend delete API
      await handleDeleteData({ rowId: rowIdToDelete, id: nested.id, userId: userDetails?._id });

      // 🔄 Update locally
      const updatedRows = rows.filter((_, idx) => idx !== rowIdx);
      const updatedRowIds = rowIds.filter((_, idx) => idx !== rowIdx);

      setRows(updatedRows);
      setRowIds(updatedRowIds);
      setNested((prev) => ({
        ...prev,
        value: updatedRows,
        rowIds: updatedRowIds,
      }));
    } catch (error) {
      console.error("Failed to delete row:", error);
    }
  };

  // submit form
  const handleFormSubmit = async (data) => {
    let updatedRows = [...rows];

    if (nested.process === "NPD Proto Model") {
      const selectedValue =
        Array.isArray(data) && data[0]?.key === "value"
          ? data[0]?.value
          : data.value ?? "";

      updatedRows[formRowIdx] = [...updatedRows[formRowIdx]];
      updatedRows[formRowIdx][protoFormIdx] = {
        ...updatedRows[formRowIdx][protoFormIdx],
        value: selectedValue,
      };
    } else {
      updatedRows[formRowIdx] = objectToRow(data, rows[formRowIdx]);
    }

    await handleUpdateData({
      rowId: rowIds[formRowIdx],
      items: updatedRows[formRowIdx],
      id: nested.id,
    });

    // update only filtered rows
    setRows(updatedRows);
    setNested((prev) => ({
      ...prev,
      value: updatedRows,
    }));

    setIsFormOpen(false);
    setFormRowIdx(null);
    setProtoFormIdx(null);
  };

  // ------------------------
  // Renderers
  // ------------------------
  const renderProductValidationReport = () => (
    <ProductValidationCompo 
      rows={rows}
      nested={nested}
      isView={isView}
      handleEditClick={handleEditClick}
      handleDeleteRow={handleDeleteRow}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
      setImagePopupUrl={setImagePopupUrl}
      getStatusStyle={getStatusStyle}
    />
  );

  /* New handler for inline status change - Updates Local State Only */
  const handleProtoStatusChange = (e, rowIdx, colIdx) => {
    const newValue = e.target.value;
    const updatedRows = [...rows];
    updatedRows[rowIdx] = [...updatedRows[rowIdx]];
    updatedRows[rowIdx][colIdx] = {
      ...updatedRows[rowIdx][colIdx],
      value: newValue,
    };
    setRows(updatedRows);
  };

  const getStatusStyle = (value) => {
    let badgeColor = "gray.100";
    let textColor = "gray.600";
    let dotColor = "gray.500";

    const lowerVal = (value || "").toLowerCase();
    if (lowerVal.includes("waiting") || lowerVal.includes("planning")) {
      badgeColor = "#fffaf0";
      textColor = "#dd6b20";
      dotColor = "#dd6b20";
    } else if (lowerVal.includes("prototype") || lowerVal.includes("progress")) {
      badgeColor = "#ebf8ff";
      textColor = "#3182ce";
      dotColor = "#3182ce";
    } else if (lowerVal.includes("complete") || lowerVal.includes("done")) {
      badgeColor = "#f0fff4";
      textColor = "#38a169";
      dotColor = "#38a169";
    } else if (lowerVal.includes("pending")) {
      badgeColor = "#fff5f5";
      textColor = "#e53e3e";
      dotColor = "#e53e3e";
    }
    return { badgeColor, textColor, dotColor };
  };

  const handleProtoSaveClick = async (rowIdx) => {
    await handleProtoSave(rowIdx);
    setEditingProtoCell(null);
  };

  /* Save handler for Proto Status */
  const handleProtoSave = async (rowIdx) => {
    try {
        await handleUpdateData({
            rowId: rowIds[rowIdx],
            items: rows[rowIdx],
            id: nested.id,
        });

        // Update nested state to sync
        setNested((prev) => ({
            ...prev,
            value: rows,
        }));
        
        // Optional: Show success toast or feedback
    } catch (err) {
        console.error("Failed to save status", err);
    }
  };

  const renderNpdProtoModel = () => (
    <ProtoCompo 
      nested={nested}
      rows={rows}
      isView={isView}
      editingProtoCell={editingProtoCell}
      handleProtoStatusChange={handleProtoStatusChange}
      handleProtoSaveClick={handleProtoSaveClick}
      setEditingProtoCell={setEditingProtoCell}
      colorCoordinatesProto={colorCoordinatesProto}
      getStatusStyle={getStatusStyle}
      handleAddDataSave={handleAddDataSave}
      DefaultTemplateForProtoProcess={DefaultTemplateForProtoProcess}
    />
  );

  const renderTechnicalSpecification = () => (
    <TechnicalSpecificationCompo 
      nested={nested}
      isView={isView}
      handleEditClick={handleEditClick}
      setImagePopupUrl={setImagePopupUrl}
      ImageUploadArray={ImageUploadArray}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
    />
  );

  const renderBOM = () => (
    <BOMCompo 
      nested={nested}
      isView={isView}
      bomProducts={bomProducts}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
      showBOMAddData={showBOMAddData}
      setShowBOMAddData={setShowBOMAddData}
      handleAddDataSaveForBOM={handleAddDataSaveForBOM}
    />
  );

  const renderBreakHour = () => (
    <BreakHourCompo 
      rows={rows}
      nested={nested}
      isView={isView}
      handleEditClick={handleEditClick}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
    />
  );

  const renderContinousImrovementStatus = () => (
    <ContinousImprovementCompo 
      rows={rows}
      nested={nested}
      getRowData={getRowData}
      isView={isView}
      handleEditClick={handleEditClick}
      handleDeleteRow={handleDeleteRow}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
    />
  );

  const renderDefault = () => (
    <DefaultProcessCompo 
      nested={nested}
      isView={isView}
      showAddData={showAddData}
      setShowAddData={setShowAddData}
      handleAddDataSave={handleAddDataSave}
      handleRefresh={handleRefresh}
    />
  );

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        scrollBehavior="inside"
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{nested?.process || "Loading..."}</ModalHeader>
          <ModalCloseButton />
          <ModalBody minH="400px" display="flex" flexDirection="column">
            {loading || processLoading ? (
              <Flex flex="1" align="center" justify="center" direction="column">
                <Loading />
              </Flex>
            ) : nested ? (
              <>
                {nested.process === "Product Validation Report" &&
                  renderProductValidationReport()}
                {nested.process === "NPD Proto Model" && renderNpdProtoModel()}
                {nested.process === "Technical Specification" &&
                  renderTechnicalSpecification()}
                {nested.process === "Bill of Materials - BOM" && renderBOM()}
                {nested.process === "Break Hour" && renderBreakHour()}
                {nested.process === "Continous Improvement Status" &&
                  renderContinousImrovementStatus()}
                {nested.process !== "Product Validation Report" &&
                  nested.process !== "Bill of Materials - BOM" &&
                  nested.process !== "NPD Proto Model" &&
                  nested.process !== "Technical Specification" &&
                  nested.process !== "Break Hour" &&
                  nested.process !== "Continous Improvement Status" &&
                  renderDefault()}
              </>
            ) : (
                <Flex flex="1" align="center" justify="center">
                    <Loading />
                </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {isFormOpen && (
        <FormDialog
          IndicationText="Edit Row"
          SelectArray={selectArray}
          FormArray={
            selectArray.length > 0
              ? [] // don’t pass formArray if selectArray is being used
              : nested.header.map((col) => ({
                  label: col,
                  key: col,
                }))
          }
          initialData={formInitialData}
          handleSubmit={handleFormSubmit}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          loading={loading}
          mode="form"
        />
      )}
      {renderImagePopUp()}
    </div>
  );
}

export default SubProcess;
