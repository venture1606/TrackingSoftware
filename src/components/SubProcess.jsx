import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

// components
import FormPage from "./FormPage";
import Loading from "../hooks/Loading";
import AddData from "../hooks/AddData";
import FormDialog from "../hooks/FormDialog";

// assets
import ProductImage from "../assets/ProductImage.jpg";

// styles
import "../styles/subprocess.css";

// API
import Process from "../services/Process";

// utils
import ItemsData from "../utils/ItemsData";

function SubProcess({ isOpen, onClose, data, loading }) {
  const { handleAddData, handleUpdateData, handleDeleteData } = Process();
  const { DefaultTemplateForProtoProcess } = ItemsData

  const [nested, setNested] = useState(null);
  const [rows, setRows] = useState([]);
  const [showAddData, setShowAddData] = useState(false);

  // FormDialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRowIdx, setFormRowIdx] = useState(null);
  const [ protoFormIdx, setProtoFormIdx ] = useState(null);
  const [formInitialData, setFormInitialData] = useState({});
  const [selectArray, setSelectArray] = useState([]);

  // load nested process
  useEffect(() => {
    if (!data?.nestedProcess) {
      setNested(null);
      setRows([]);
      return;
    }
    const filteredRows = data.nestedProcess.data.filter(
      (row) => row.rowDataId === data.rowDataId
    );

    const formatted = {
      id: data.nestedProcess._id,
      process: data.nestedProcess.process,
      header: data.nestedProcess.headers,
      value: filteredRows.map((row) =>
        row.items.map((cell) => ({
          key: cell.key,
          value: cell.value,
          process: cell.process || null,
        }))
      ),
      rowIds: filteredRows.map((row) => row._id),
      rowDataId: data.rowDataId,
    };

    setNested(formatted);
    setRows(formatted.value);
  }, [data]);

  if (!nested) return null;

  console.log(nested);
  console.log(nested.rowDataId);

  // convert row array to object keyed by header
  const getRowData = (row) => {
    const obj = {};
    nested.header.forEach((col, idx) => {
      obj[col] = row[idx]?.value || "";
    });
    return obj;
  };

  // convert back to row array
  const objectToRow = (data, oldRow) =>
    nested.header.map((col, idx) => ({
      ...oldRow[idx],
      value: data[col] || "",
  }));

  // handle add data
  const handleAddDataSave = async (newData) => {
    const response = await handleAddData({ items: newData, id: nested.id, rowDataId: nested.rowDataId });

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

    setNested({
      id: response._id,
      process: response.process,
      header: response.headers,
      value: formattedRows,
      rowIds: filteredRows.map((row) => row._id),
      rowDataId: nested.rowDataId,
    });

    setRows(formattedRows);
  };


  // edit button
  const handleEditClick = (rowIdx) => {
    setSelectArray([]);
    setFormRowIdx(rowIdx);
    setFormInitialData(getRowData(rows[rowIdx]));
    setIsFormOpen(true);
  };

  const handleEditClickForProto = (rowIdx, status, colIdx) => {
    setFormRowIdx(rowIdx);
    setProtoFormIdx(colIdx);
    console.log(getRowData(rows[rowIdx]), rowIdx)
    setFormInitialData({ value: status });
    setSelectArray([{
      key: "value",
      label: `${nested.header[colIdx]} Status`,
      options: ["Orange", "Red", "Green"]
    }]);
    setIsFormOpen(true);
  };

  // delete button
  const handleDeleteRow = async (rowIdx) => {
    await handleDeleteData({ rowId: nested.rowIds[rowIdx], id: nested.id });

    // remove locally
    const updated = [...rows];
    updated.splice(rowIdx, 1);

    setRows(updated);
    setNested((prev) => ({
      ...prev,
      value: updated,
      rowIds: prev.rowIds.filter((_, idx) => idx !== rowIdx),
    }));
  };

  // submit form
  const handleFormSubmit = async (data) => {
    let updatedRows = [...rows];

    if (nested.process === "NPD Proto Model") {
      updatedRows[formRowIdx] = [...updatedRows[formRowIdx]];
      updatedRows[formRowIdx][protoFormIdx] = {
        ...updatedRows[formRowIdx][protoFormIdx],
        value: data.value,
      };
    } else {
      updatedRows[formRowIdx] = objectToRow(data, rows[formRowIdx]);
    }

    await handleUpdateData({
      rowId: nested.rowIds[formRowIdx],
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

  // case-specific rendering
  const renderProductValidationReport = () => (
    <div className='ProductValidationReportEntireContainer'>
      <button
        className="AddDataButton ProductValidationReportContainerButton"
        onClick={() => setShowAddData(true)}
      >
        Add Data
      </button>

      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Data"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="ProductValidationReportContainer">
          <div className="ProductValidationReportHeader">
            <Button colorScheme="blue" onClick={() => handleEditClick(rowIndex)}>
              Edit
            </Button>
            <h2>{row.find((item) => item.key === "TEST NAME")?.value}</h2>
            <Button colorScheme="red" onClick={() => handleDeleteRow(rowIndex)}>
              Delete
            </Button>
          </div>

          <div className="ProductValidationReportContent">
            <div className="ProductValidationReportDetails">
              {row.map((item, colIndex) =>
                item.key === "IMAGE" || item.key === "SL.NO" ? null : (
                  <div key={colIndex}>
                    <span>
                      <strong>{item.key}:</strong> {item.value}
                    </span>
                  </div>
                )
              )}
            </div>
            <div>
              <img
                src={ProductImage || row.find((i) => i.key === "IMAGE")?.value}
                alt={row.find((i) => i.key === "TEST NAME")?.value}
                className="ProductValidationReportImage"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNpdProtoModel = () => (
    <div className="FormPageContainer" style={{ overflowX: "auto", maxWidth: "100%" }}>
      <Table size="sm" variant="simple">
        <Thead className="TableHeader">
          <Tr>
            <Th className="TableHeaderContent">SL.NO</Th>
            <Th className="TableHeaderContent">Document</Th>
            <Th className="TableHeaderContent">Status</Th>
            <Th className="TableHeaderContent">Action</Th>
          </Tr>
        </Thead>
        { nested.value.length > 0 
        ? 
          <Tbody className="TableBody">
            {rows.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <Tr key={`${rowIdx}-${colIdx}`}>
                  <Td className="RowsField">{colIdx + 1}</Td>
                  <Td className="RowsField">{nested.header[colIdx]}</Td>
                  <Td className="RowsField">{cell.value}</Td>
                  <Td className="RowsField">
                    <Button
                      size="sm"
                      onClick={() => handleEditClickForProto(rowIdx, cell.value, colIdx)}
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        :
          <Button
            className="AddDataButton"
            onClick={() => handleAddDataSave(DefaultTemplateForProtoProcess)}
          >
            Create Page
          </Button>
        }
      </Table>
    </div>
  );

  const renderDefault = () => (
    <div>
      <div className="AddDataContainer">
        <button
          className="AddDataButton AddDataContainer"
          onClick={() => setShowAddData(true)}
        >
          Add Data
        </button>
        {showAddData && (
          <AddData
            headers={nested.header || []}
            IndicationText="Add New Data"
            isOpen={showAddData}
            onClose={() => setShowAddData(false)}
            onSave={handleAddDataSave}
          />
        )}
      </div>
      <FormPage process={nested} />
    </div>
  );

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{nested.process}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Loading />
            ) : (
              <>
                {nested.process === "Product Validation Report" && renderProductValidationReport()}
                {nested.process === "NPD Proto Model" && renderNpdProtoModel()}
                {nested.process !== "Product Validation Report" &&
                  nested.process !== "NPD Proto Model" &&
                  renderDefault()}
              </>
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
    </div>
  );
}

export default SubProcess;
