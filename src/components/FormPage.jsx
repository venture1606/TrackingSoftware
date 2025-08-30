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
} from "@chakra-ui/react";

// importing data
import ItemData from '../utils/ItemsData.json';

// importing styles
import "../styles/departmentpage.css";

function FormPage({ process }) {

  const { DesignProcess } = ItemData;

  const [rows, setRows] = useState([]); // local state for row data
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  // sync process.value to local rows whenever process changes
  useEffect(() => {
    if (process?.value) {
      setRows(process.value);
    }
  }, [process]);

  const handleEditClick = (rowIdx) => {
    setEditingRow(rowIdx);
    setEditedData(
      Object.fromEntries(rows[rowIdx].map((cell, idx) => [idx, cell.val]))
    );
  };

  const handleInputChange = (idx, value) => {
    setEditedData((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };

  const handleSaveClick = (rowIdx) => {
    const updatedRow = rows[rowIdx].map((cell, idx) => ({
      ...cell,
      val: editedData[idx],
    }));

    const updatedRows = [...rows];
    updatedRows[rowIdx] = updatedRow;

    setRows(updatedRows);
    setEditingRow(null);
    setEditedData({});
  };

  const handleCancelClick = () => {
    setEditingRow(null);
    setEditedData({});
  };

  return (
    <div
      className="FormPageContainer"
      style={{ overflowX: "auto", borderWidth: "1px", maxWidth: "100%" }}
    >
      <Table size="sm" variant="simple">
        <Thead className="TableHeader">
          <Tr>
            {process && process.column?.length > 0 ? (
              <>
                {process.column.map((col, idx) => (
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
                  <Td
                    key={cellIdx}
                    className={
                      editingRow !== rowIdx
                        ? "RowsField"
                        : "RowsField SelectedRowField"
                    }
                  >
                    {editingRow === rowIdx ? (
                      <Input
                        size="sm"
                        value={editedData[cellIdx] || ""}
                        className="InputField"
                        onChange={(e) =>
                          handleInputChange(cellIdx, e.target.value)
                        }
                      />
                    ) : (
                      cell.val
                    )}
                  </Td>
                ))}

                <Td
                  className={
                    editingRow !== rowIdx
                      ? "RowsField"
                      : "RowsField SelectedRowField"
                  }
                >
                  {editingRow === rowIdx ? (
                    <>
                      <Button
                        size="sm"
                        colorScheme="green"
                        className="IconButtonStyle"
                        mr={2}
                        onClick={() => handleSaveClick(rowIdx)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        className="IconButtonStyle"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="IconButtonStyle"
                      onClick={() => handleEditClick(rowIdx)}
                    >
                      Edit
                    </Button>
                  )}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={(process?.column?.length || 1) + 1}>No Data</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}

export default FormPage;
