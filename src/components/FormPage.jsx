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
} from "@chakra-ui/react";

// Importing API
import Process from "../services/Process";

// importing components
import SubProcess from "./SubProcess"; // modal for nested process
import FormDialog from "../hooks/FormDialog";

// importing styles
import "../styles/departmentpage.css";

function FormPage({ process }) {
  const { loading, handleGetSingleProcess } = Process();

  const [rows, setRows] = useState([]);
  const [popupData, setPopupData] = useState(null);

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

  // When FormDialog saves
  const handleFormSubmit = (data) => {
    const updatedRows = [...rows];
    if (formRowIdx !== null) {
      // Editing existing row
      updatedRows[formRowIdx] = objectToRow(data, rows[formRowIdx]);
    } else {
      // Adding new row
      const newRow = process.header.map((col) => ({ value: data[col] || "" }));
      updatedRows.push(newRow);
    }

    console.log(updatedRows);
    setRows(updatedRows);
    setIsFormOpen(false);
    setFormRowIdx(null);
  };

  // When process button inside a cell is clicked
  const handleCellButtonClick = async (row, rowIdx, cellIdx) => {
    const cell = row[cellIdx];
    let id = cell.value.split("processId -")[1]?.trim();
    cell.process = await handleGetSingleProcess(id);
    console.log(cell.process);
    setPopupData({
      parentProcess: process.process,
      row,
      rowIdx,
      cellIdx,
      nestedProcess: cell.process || null,
    });
    onOpen();
  };

  return (
    <div
      className="FormPageContainer"
      style={{ overflowX: "auto", maxWidth: "100%" }}
    >  
      <Table size="sm" variant="simple">
        <Thead className="TableHeader">
          <Tr>
            {process && process.header?.length > 0 ? (
              <>
                {process.header.map((col, idx) => (
                  <Th key={idx} className="TableHeaderContent">
                    {col}
                  </Th>
                ))}
                <Th className="TableHeaderContent">Action</Th>
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
                {row.map((cell, cellIdx) => (
                  <Td key={cellIdx} className="RowsField">
                    {cell.value?.startsWith("processId -") ? (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() =>
                          handleCellButtonClick(row, rowIdx, cellIdx)
                        }
                      >
                        Update
                      </Button>
                    ) : (
                      cell.value
                    )}
                  </Td>
                ))}

                <Td className="RowsField">
                  <Button
                    size="sm"
                    className="IconButtonStyle"
                    onClick={() => handleEditClick(rowIdx)}
                  >
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={(process?.header?.length || 1) + 1}>No Data</Td>
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
          handleSubmit={handleFormSubmit}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={formInitialData}
          loading={loading}
        />
      )}
    </div>      
  );
}

export default FormPage;
