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
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";

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
import { setDetailingProducts } from "../redux/slices/department";

function SubProcess({ isOpen, onClose, data, loading, isView = false }) {
  const {
    handleAddData,
    handleUpdateData,
    handleDeleteData,
    handleGetSingleProcess,
  } = Process();
  const { DefaultTemplateForProtoProcess } = ItemsData;
  const dispatch = useDispatch();

  const detailingProducts = useSelector((state) => state.department.detailingProducts); 
  const process = useSelector((state) => state.department.process);

  const [nested, setNested] = useState(null);
  const [rows, setRows] = useState([]);
  const [showAddData, setShowAddData] = useState(false);
  const [showBOMAddData, setShowBOMAddData] = useState(false);

  // FormDialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRowIdx, setFormRowIdx] = useState(null);
  const [protoFormIdx, setProtoFormIdx] = useState(null);
  const [formInitialData, setFormInitialData] = useState({});
  const [selectArray, setSelectArray] = useState([]);
  const [bomProducts, setBomProducts] = useState(null);
  const [productBom, setProductBom] = useState(null);
  

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

  // load nested process
  useEffect(() => {
    if (!data?.nestedProcess) {
      setNested(null);
      setRows([]);
      return;
    }
    const formatted = formatProcessData(data.nestedProcess, data.rowDataId);

    setNested(formatted);
    setRows(formatted.value);
  }, [data]);

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
    if (
      nested?.process === "Bill of Materials - BOM"
    ) {
      dispatch(setDetailingProducts(nested));
      handleBomProducts();
    }
  }, [nested]);

  useEffect(() => {
    if (nested?.process === "Products" && detailingProducts?.rowIds?.length > 0) {
          const fetchBomForProduct = () => {
        // Find the "DETAILING PRODUCT" entry in data.row
        const detailingEntry = data.row.find((item) => item.key === "DETAILING PRODUCT");

        if (!detailingEntry || !Array.isArray(detailingEntry.value)) {
          console.warn("No detailing products found in data.row");
          return;
        }

        // Extract selected IDs from data
        const selectedIds = detailingEntry.value;

        // Loop through and pick matching BOM rows
        const matchedBom = selectedIds.map((id) => {
          const index = detailingProducts.rowIds.indexOf(id);
          if (index !== -1) {
            return detailingProducts.value[index]; // store the corresponding row
          }
          return null; // no match
        }).filter(Boolean); // remove nulls

        // Store formatted BOM
        setProductBom({
          key: "DETAILING PRODUCT",
          value: selectedIds, // keep original IDs
          process: "multiSelect",
          matchedBom // add BOM rows if you want them alongside
        });
      };

      fetchBomForProduct();

    }
  }, [nested, detailingProducts]);

  if (!nested) return null;

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

  const handleEditClickForProto = (rowIdx, status, colIdx) => {
    setFormRowIdx(rowIdx);
    setProtoFormIdx(colIdx);
    setFormInitialData({ value: status });
    setSelectArray([
      {
        key: "value",
        label: `${nested.header[colIdx]} Status`,
        options: ["Orange", "Red", "Green"],
      },
    ]);
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

  // ------------------------
  // Renderers
  // ------------------------
  const renderProductValidationReport = () => (
    <div className="ProductValidationReportEntireContainer">
      {!isView && (
        <button
          className="AddDataButton ProductValidationReportContainerButton"
          onClick={() => setShowAddData(true)}
        >
          Add Data
        </button>
      )}

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
            {!isView && (
              <Button
                colorScheme="blue"
                onClick={() => handleEditClick(rowIndex)}
              >
                Edit
              </Button>
            )}
            <h2>{row.find((item) => item.key === "TEST NAME")?.value}</h2>
            {!isView && (
              <Button
                colorScheme="red"
                onClick={() => handleDeleteRow(rowIndex)}
              >
                Delete
              </Button>
            )}
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
    <div
      className="FormPageContainer"
      style={{ overflowX: "auto", maxWidth: "100%" }}
    >
      <Table size="sm" showColumnBorder stickyHeader>
        <Thead className="TableHeader">
          <Tr>
            <Th className="TableHeaderContent">SL.NO</Th>
            <Th className="TableHeaderContent">Document</Th>
            <Th className="TableHeaderContent">Status</Th>
            {!isView && <Th className="TableHeaderContent">Action</Th>}
          </Tr>
        </Thead>
        {nested.value.length > 0 ? (
          <Tbody className="TableBody">
            {rows.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <Tr key={`${rowIdx}-${colIdx}`}>
                  <Td className="RowsField">{colIdx + 1}</Td>
                  <Td className="RowsField">{nested.header[colIdx]}</Td>
                  <Td className="RowsField ProtoStatusIndicationRow">
                    <div
                      className="ProtoStatusIndication"
                      style={{ backgroundColor: cell.value.toLowerCase() }}
                    ></div>
                    {cell.value === "Orange" && <span>In Progress</span>}
                    {cell.value === "Green" && <span>Completed</span>}
                    {cell.value === "Red" && <span>Pending</span>}
                  </Td>
                  {!isView && (
                    <Td className="RowsField">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleEditClickForProto(rowIdx, cell.value, colIdx)
                        }
                      >
                        Edit
                      </Button>
                    </Td>
                  )}
                </Tr>
              ))
            )}
          </Tbody>
        ) : (
          !isView && (
            <Button
              className="AddDataButton"
              onClick={() => handleAddDataSave(DefaultTemplateForProtoProcess)}
            >
              Create Page
            </Button>
          )
        )}
      </Table>
    </div>
  );

  const renderTechnicalSpecification = () => {
    if (!nested?.value) return null;

    return (
      <div className="TechnicalSpecificationContainer">
        <div className="AddDataContainer">
          {!isView && (
            <div className="AddDataContainer">
              <button
                className="AddDataButton AddDataContainer"
                onClick={() => setShowAddData(true)}
              >
                Add Data
              </button>
            </div>
          )}

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
        <div className="TechnicalSpecificationCardsContainer">
          {nested.value.map((row, rowIdx) => (
            <div key={rowIdx} className="TechnicalSpecificationCard">
              {!isView && (
                <Button
                  className="EditButton"
                  onClick={() => handleEditClick(rowIdx)}
                >
                  Edit
                </Button>
              )}
              {row.map((field) => (
                <div key={field.key}>
                  <strong>{field.key}:</strong>&nbsp;&nbsp;{field.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBOM = () => (
    <div className="renderBOMContainer">
      <div className="Gap">
        <div className="AddDataContainer">
          {!isView && (
            <div className="AddDataContainer">
              <button
                className="AddDataButton AddDataContainer"
                onClick={() => setShowAddData(true)}
              >
                Add Data
              </button>
            </div>
          )}

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
        <FormPage process={nested} isView={isView} />
      </div>

      <div className="Gap">
        <div className="AddDataContainer">
          {!isView && (
            <div className="AddDataContainer">
              <button
                className="AddDataButton AddDataContainer"
                onClick={() => setShowBOMAddData(true)}
              >
                Add Products Data
              </button>
            </div>
          )}

          {showBOMAddData && (
            <AddData
              headers={bomProducts?.header || []}
              IndicationText="Add New Data"
              isOpen={showBOMAddData}
              onClose={() => setShowBOMAddData(false)}
              onSave={handleAddDataSaveForBOM}
            />
          )}
        </div>
        {bomProducts && <FormPage process={bomProducts} isView={isView} />}
      </div>
    </div>
  );

  const renderBOMProducts = () => {
    if (!productBom || !productBom.matchedBom) {
      return <p>No BOM products found</p>;
    }

    // Grab headers dynamically from the first matched row
    const headers = productBom.matchedBom[0]?.map((cell) => cell.key) || [];

    return (
      <div style={{ overflowX: "auto" }} className="FormPageContainer">
        <Table size="sm" showColumnBorder stickyHeader>
          <Thead className="TableHeader">
            <Tr>
              {headers.map((header, idx) => (
                <Th key={idx} className="TableHeaderContent">{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody className="TableBody">
            {productBom.matchedBom.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Td key={cellIndex} className="RowsField">{cell.value}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  };

  const renderBreakHour = () => (
    <div className="BreakHourContainer">
      {!isView && (
        <div className="BreakHourAddDataContainer">
          <button
            className="AddDataButton"
            onClick={() => setShowAddData(true)}
          >
            + Add Data
          </button>
        </div>
      )}

      {showAddData && (
        <AddData
          headers={nested.header || []}
          IndicationText="Add New Break Hour"
          isOpen={showAddData}
          onClose={() => setShowAddData(false)}
          onSave={handleAddDataSave}
        />
      )}

      <div className="BreakHourCards">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="BreakHourCard">
            <div className="BreakHourCardHeader">
              <h3>
                {row.find((f) => f.key === "BREAK NAME")?.value ||
                  `Break ${rowIdx + 1}`}
              </h3>
              {!isView && (
                <div className="BreakHourActions">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEditClick(rowIdx)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteRow(rowIdx)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Grid layout for fields */}
            <div className="BreakHourCardContent">
              {row.map((field, idx) => (
                <div key={idx} className="BreakHourFieldCard">
                  <strong>{field.key}</strong>
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinousImrovementStatus = () => {
    return (
      <div className="Gap">
        <div className="AddDataContainer">
          {!isView && (
            <button
              className="AddDataButton AddDataContainer"
              onClick={() => setShowAddData(true)}
            >
              Add Data
            </button>
          )}

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

        {rows.map((row, rowIndex) => {
          const rowData = getRowData(row);

          return (
            <div key={rowIndex} className="ContinousImprovementCard">
              {/* Action Buttons */}
              {!isView && (
                <div className="ImprovementActions">
                  <Button size="sm" colorScheme="blue" onClick={() => handleEditClick(rowIndex)}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDeleteRow(rowIndex)}>
                    Delete
                  </Button>
                </div>
              )}
              {/* Header */}
              <div className="ContinousImprovementHeaderContainer">
                <div className="ContinousImprovementHeader">
                  <strong>IMP. NO:</strong>
                  <div>{rowData["IMP. NO"]}</div>
                </div>
                <div className="ContinousImprovementHeader">
                  <strong>DATE:</strong>
                  <div>{rowData["DATE"]}</div>
                </div>
                <div className="ContinousImprovementHeader">
                  <strong>NATURE OF PROBLEM:</strong>
                  <div>{rowData["NATURE OF PROBLEM"]}</div>
                </div>
                <div className="ContinousImprovementHeader">
                  <strong>IMPROVEMENT ACTION:</strong>
                  <div>{rowData["IMPROVEMENT ACTION"]}</div>
                </div>
                <div className="ContinousImprovementHeader">
                  <strong>DONE BY:</strong>
                  <div>{rowData["DONE BY"]}</div>
                </div>
              </div>
              {/* Section Rows */}
              <div className="ImprovementSection">
                <strong>ROOT CAUSE:</strong>
                <span>{rowData["ROOT CAUSE"]}</span>
              </div>

              <div className="ImprovementSection">
                <strong>CORRECTIVE ACTION:</strong>
                <span>{rowData["CORRECTIVE ACTION"]}</span>
              </div>

              <div className="ImprovementSection">
                <strong>ACTION IMPLEMENTATION:</strong>
                <span>{rowData["ACTION IMPLEMENTATION"]}</span>
              </div>

              {/* Before/After with Images */}
              <div className="ImprovementSectionImage">
                <div className="BeforeImage">
                  <strong>BEFORE:</strong>
                  {rowData["BEFORE"] ? (
                    <img
                      src={rowData["BEFORE"]}
                      alt="Before"
                      style={{ width: "120px", border: "1px solid #ccc" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </div>
                <div className="AfterImage">
                  <strong>AFTER:</strong>
                  {rowData["AFTER"] ? (
                    <img
                      src={rowData["AFTER"]}
                      alt="After"
                      style={{ width: "120px", border: "1px solid #ccc" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </div>
              </div>

              <div className="ImprovementSection">
                <strong>RESULTS AND BENEFITS:</strong>
                <div>{rowData["RESULTS AND BENEFITS"]}</div>
              </div>

              <div className="ImprovementSection">
                <strong>HORIZONTAL DEPLOYMENT:</strong>
                <div>{rowData["HORIZONTAL DEPLOYMENT"]}</div>
              </div>

              
            </div>
          );
        })}
      </div>
    );
  };


  const renderDefault = () => (
    <div className='Gap'>
      <div className="AddDataContainer">
        {!isView && (
          <div className="AddDataContainer">
            <button
              className="AddDataButton AddDataContainer"
              onClick={() => setShowAddData(true)}
            >
              Add Data
            </button>
          </div>
        )}

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
      <FormPage process={nested} isView={isView} />
    </div>
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
          <ModalHeader>{nested.process}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Loading />
            ) : (
              <>
                {nested.process === "Product Validation Report" &&
                  renderProductValidationReport()}
                {nested.process === "NPD Proto Model" && renderNpdProtoModel()}
                {nested.process === "Technical Specification" &&
                  renderTechnicalSpecification()}
                {nested.process === "Bill of Materials - BOM" && renderBOM()}
                {nested.process === "Products" && renderBOMProducts()}
                {nested.process === "Break Hour" && renderBreakHour()}
                {nested.process === "Continous Improvement Status" && renderContinousImrovementStatus()}
                {nested.process !== "Product Validation Report" &&
                  nested.process !== "Bill of Materials - BOM" &&
                  nested.process !== "NPD Proto Model" &&
                  nested.process !== "Technical Specification" &&
                  nested.process !== "Products" &&
                  nested.process !== "Break Hour" &&
                  nested.process !== "Continous Improvement Status" &&
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
