import React, { useState, useEffect, useRef } from "react";
import {
  Tr,
  Td,
  Button,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Flex,
  IconButton,
  Tooltip,
  Box,
  Text,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, AddIcon, AttachmentIcon } from "@chakra-ui/icons";
import { useSelector, useDispatch } from "react-redux";
import ItemsData from "../utils/ItemsData.json";
import DataCheck from "../utils/DataCheck.json";
import { findAutoFillData, getFilteredOptions } from "../utils/constant";
import { updateSelectOptions } from "../redux/slices/auth";

const EditableRow = ({
  headers,
  initialData = null,
  onSave,
  onCancel,
  currentBomId = null,
  isNew = false,
  gridTemplateColumns, // Added
}) => {
  const dispatch = useDispatch();

  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts
  );
  const SelectOptionsArray =
    useSelector((state) => (state.auth.SelectOptionsArray?.length > 0 ? state.auth.SelectOptionsArray : null)) ||
    ItemsData.SelectOptionsArray;
  const groupItem = useSelector((state) => state.auth.groupItem);

  const {
    DefaultHeaderAndProcessId,
    DefaultSelectProcess,
    ArrayValuesProcess,
    DateFieldsArray,
    ImageUploadArray,
    noOthers,
    TimeArrays,
    NumberFields,
    MandatoryFields,
  } = ItemsData;

  const noEditableFields = DataCheck?.noEditableFields || [];

  const [formData, setFormData] = useState([]);
  const [options, setOptions] = useState({});
  const [errorFields, setErrorFields] = useState([]);

  // Build options for DETAILING PRODUCT
  useEffect(() => {
    if (detailingProducts?.data?.length) {
      const filteredProducts = currentBomId
        ? detailingProducts.data.filter(
            (row) => row.rowDataId === currentBomId
          )
        : detailingProducts.data;

      const codesWithRowIds = filteredProducts
        .map((row) => {
          const subPart = row.items.find((item) => item.key === "SUB PARTS");
          return subPart ? { label: subPart.value, value: row._id } : null;
        })
        .filter(Boolean);

      setOptions((prev) => ({
        ...prev,
        "DETAILING PRODUCT": codesWithRowIds,
      }));
    }
  }, [detailingProducts, currentBomId]);

  const refreshOptions = (currentFormData) => {
    return currentFormData.map((field) => {
      if (field.process === "select") {
        const defaultMatch = SelectOptionsArray.find(
          (item) => item.key.toLowerCase() === field.key.toLowerCase()
        );
        const defaultOptions = defaultMatch?.value || [];
        const newOptions = getFilteredOptions(
          groupItem,
          currentFormData,
          field.key,
          defaultOptions
        );
        return { ...field, options: newOptions };
      }
      return field;
    });
  };

  // Initialize Data
  useEffect(() => {
    let mappedData = [];

    const getProcessType = (key) => {
        if (!key) return "value";
        const lowerKey = key.trim().toLowerCase();
        if (DefaultSelectProcess.some(h => h.trim().toLowerCase() === lowerKey)) return "multiSelect";
        if (ArrayValuesProcess.some(h => h.trim().toLowerCase() === lowerKey)) return "arrayInput";
        if (DateFieldsArray.some(h => h.trim().toLowerCase() === lowerKey)) return "date";
        if (ImageUploadArray.some(h => h.trim().toLowerCase() === lowerKey)) return "image";
        if (TimeArrays.some(h => h.trim().toLowerCase() === lowerKey)) return "time";
        if (NumberFields.some(h => h.trim().toLowerCase() === lowerKey)) return "number";
        if (DefaultHeaderAndProcessId.some(item => item.tableHeader.trim().toLowerCase() === lowerKey)) return "processId";
        if (SelectOptionsArray.some(item => item.key.trim().toLowerCase() === lowerKey)) return "select";
        return "value";
    };

    if (initialData) {
      // Edit Mode
      mappedData = headers.map((key) => {
        const cell = initialData.find((item) => item.key === key);
        let value = cell ? cell.value : "";
        let process = getProcessType(key);

        if (process === "arrayInput" && !Array.isArray(value)) {
            value = [value || ""];
        }

        const field = { key, value, process };
        if (process === "select") {
            const selectMatch = SelectOptionsArray.find((item) => item.key.trim().toLowerCase() === key.trim().toLowerCase());
            field.options = selectMatch ? selectMatch.value : [];
        }
        
        return field;
      });
    } else {
      // New Mode (Add Data logic)
      mappedData = headers.map((key) => {
        const process = getProcessType(key);
        let value = "";

        if (process === "processId") {
            const match = DefaultHeaderAndProcessId.find(item => item.tableHeader === key);
            value = match ? match.processId : "";
        } else if (process === "multiSelect") {
            value = [];
        } else if (process === "arrayInput") {
            value = [""];
        } else if (process === "select") {
            const selectMatch = SelectOptionsArray.find(item => item.key.trim().toLowerCase() === key.trim().toLowerCase());
            const hasRed = selectMatch?.value.some(v => v.toLowerCase() === "red");
            return {
                key,
                value: hasRed ? "Red" : "",
                process: "select",
                options: selectMatch?.value || [],
            };
        }

        return { key, value, process };
      });
    }

    setFormData(refreshOptions(mappedData));

    // Cleanup on unmount or header change
    return () => setFormData([]);
  }, [headers, initialData, DefaultHeaderAndProcessId, SelectOptionsArray, groupItem]);

  const handleValueChange = (index, val, subIndex = null) => {
    const newData = [...formData];
    const key = newData[index].key;

    if (subIndex !== null && Array.isArray(newData[index].value)) {
      newData[index].value[subIndex] = val;
    } else {
      newData[index].value = val;
    }

    // Autofill
    const autoFillData = findAutoFillData(groupItem, key, val);
    if (autoFillData) {
      Object.keys(autoFillData).forEach((autoKey) => {
        if (autoKey === key) return;
        const targetIndex = newData.findIndex((f) => f.key === autoKey);
        if (targetIndex !== -1) {
          newData[targetIndex].value = autoFillData[autoKey];
        }
      });
    }

    const updatedWithDynamicOptions = refreshOptions(newData);
    setFormData(updatedWithDynamicOptions);

    if (errorFields.includes(key)) {
      setErrorFields(errorFields.filter((k) => k !== key));
    }
  };

  const handleValidationAndSave = () => {
    const errors = [];
    for (const field of formData) {
      if (MandatoryFields.includes(field.key)) {
        const isEmpty =
          !field.value ||
          (Array.isArray(field.value) && field.value.length === 0) ||
          (Array.isArray(field.value) && field.value.every((v) => !v.trim())) ||
          (typeof field.value === "string" && !field.value.trim());

        if (isEmpty) {
          errors.push(field.key);
        }
      }
    }

    if (errors.length > 0) {
      setErrorFields(errors);
      alert(`The following fields cannot be empty: ${errors.join(", ")}`);
      return;
    }

    // Format for save
    const items = formData.map((field) => {
        if (field.process === "image" && field.value?.file) {
            return { ...field, value: field.value.file };
        }
        return field;
    });

    onSave(items);
    if (isNew) {
        // Reset form data if it's the "Add New" row
        // Trigger re-init via useEffect? simpler to just reload headers logic
        // But parent might unmount/remount specific logic.
    }
  };

  const handleAddArrayInput = (index) => {
    const newData = [...formData];
    newData[index].value.push("");
    setFormData(newData);
  };

  const handleRemoveArrayInput = (index, subIndex) => {
    const newData = [...formData];
    newData[index].value.splice(subIndex, 1);
    if (newData[index].value.length === 0) newData[index].value.push("");
    setFormData(newData);
  };

  return (
    <div style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        gap: "20px",
        backgroundColor: "white",
        padding: "15px 10px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        border: "1px solid #3182ce", // Highlight edit mode
        alignItems: "center",
        marginBottom: "10px"
    }}>
      {formData.map((field, idx) => {
        const isReadOnly = !isNew && (noEditableFields.some(h => h.trim().toLowerCase() === field.key.trim().toLowerCase()) || field.process === "processId");
        const isError = errorFields.includes(field.key);

        return (
          <div key={idx}> 
             {/* Render logic based on process type */}
             {field.process === "processId" ? (
                 <Input 
                    size="sm" 
                    fontSize="xs"
                    value={field.value} 
                    isReadOnly 
                    bg="gray.50"
                    variant="filled"
                    placeholder={field.key}
                 />
             ) : field.process === "multiSelect" ? (
                 <CheckboxGroup
                    value={field.value || []}
                    onChange={(vals) => handleValueChange(idx, vals)}
                 >
                     <SimpleGrid columns={5} spacing={3} py={2}>
                         {(options[field.key] || []).map((opt, i) => (
                             <Checkbox key={i} value={opt.value} size="sm">
                                 {opt.label}
                             </Checkbox>
                         ))}
                     </SimpleGrid>
                 </CheckboxGroup>
             ) : field.process === "arrayInput" ? (
                 <Stack spacing={1}>
                     {field.value.map((val, subIdx) => (
                         <div key={subIdx} style={{display: "flex", gap: "5px"}}>
                             <Input 
                                size="sm" 
                                fontSize="xs"
                                value={val} 
                                onChange={(e) => handleValueChange(idx, e.target.value, subIdx)}
                                isInvalid={isError}
                                bg="white"
                                placeholder={field.key}
                             />
                             <IconButton 
                                size="xs" 
                                icon={<CloseIcon />} 
                                colorScheme="red" 
                                onClick={() => handleRemoveArrayInput(idx, subIdx)} 
                             />
                         </div>
                     ))}
                     <Button size="xs" width="100%" variant="outline" colorScheme="blue" onClick={() => handleAddArrayInput(idx)}>+ Add</Button>
                 </Stack>
             ) : field.process === "select" ? (
                <Stack spacing={1}>
                 <Select
                    size="sm"
                    fontSize="xs"
                    value={field.value === "others" ? "others" : (field.value || "")}
                    placeholder={field.key}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "others") {
                            const newData = [...formData];
                            newData[idx].value = "others";
                            newData[idx].otherValue = "";
                            setFormData(newData);
                        } else {
                            handleValueChange(idx, val);
                        }
                    }}
                    isInvalid={isError}
                    isDisabled={isReadOnly}
                    bg="white"
                 >
                     <option value="">Select</option>
                     {field.options?.filter(o => o.toLowerCase() !== "others").map((opt, i) => (
                         <option key={i} value={opt}>{opt}</option>
                     ))}
                     {!noOthers.includes(field.key) && <option value="others">Others</option>}
                 </Select>
                  {field.value === "others" && (
                      <Input 
                        size="sm" 
                        fontSize="xs"
                        placeholder={`Enter ${field.key}`}
                        value={field.otherValue || ""}
                        onChange={(e) => {
                            const newData = [...formData];
                            newData[idx].otherValue = e.target.value;
                            setFormData(newData);
                        }}
                        onBlur={() => {
                            const customVal = field.otherValue?.trim();
                            if(customVal) {
                                const newData = [...formData];
                                newData[idx].value = customVal;
                                delete newData[idx].otherValue;
                                setFormData(newData);
                                dispatch(updateSelectOptions({ key: field.key, value: [...field.options, customVal] }));
                            }
                        }}
                        bg="white"
                      />
                  )}
                 </Stack>
             ) : field.process === "date" ? (
                 <Input 
                    type="date" 
                    size="sm" 
                    fontSize="xs"
                    value={field.value} 
                    onChange={(e) => handleValueChange(idx, e.target.value)} 
                    isInvalid={isError}
                    isDisabled={isReadOnly}
                    bg="white"
                    placeholder={field.key}
                 />
             ) : field.process === "time" ? (
                <Input 
                    type="time" 
                    size="sm" 
                    fontSize="xs"
                    value={field.value} 
                    onChange={(e) => handleValueChange(idx, e.target.value)} 
                    isInvalid={isError}
                    isDisabled={isReadOnly}
                    bg="white"
                    placeholder={field.key}
                />
             ) : field.process === "number" ? (
                <Input 
                    type="number" 
                    size="sm" 
                    fontSize="xs"
                    value={field.value} 
                    onChange={(e) => handleValueChange(idx, e.target.value)} 
                    isInvalid={isError}
                    isDisabled={isReadOnly}
                    bg="white"
                    placeholder={field.key}
                />
              ) : field.process === "image" ? (
                  <Stack spacing={2} align="center">
                      <input 
                         type="file" 
                         accept="image/*"
                         style={{ display: "none" }}
                         id={`file-upload-${idx}`}
                         onChange={(e) => {
                             const file = e.target.files?.[0];
                             if(file) {
                                 const url = URL.createObjectURL(file);
                                 handleValueChange(idx, {file, previewUrl: url});
                             }
                         }}
                      />
                      <Box
                        as="label"
                        htmlFor={`file-upload-${idx}`}
                        cursor="pointer"
                        border="1px dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        p={1}
                        _hover={{ borderColor: "blue.400", bg: "gray.50" }}
                        transition="all 0.2s"
                        width="100%"
                        bg="white"
                      >
                        <Center gap={2}>
                          <AttachmentIcon color="gray.500" />
                          <Text fontSize="sm" color="gray.600" fontWeight="500">
                             Upload
                          </Text>
                        </Center>
                      </Box>
                      {field.value?.previewUrl && (
                        <Box border="1px solid" borderColor="gray.100" p={1} borderRadius="md" bg="white">
                           <img src={field.value.previewUrl} alt="prev" width="80" style={{borderRadius: "4px"}} />
                        </Box>
                      )}
                  </Stack>
             ) : (
                 <Input 
                    size="sm" 
                    fontSize="xs"
                    value={field.value} 
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    isDisabled={isReadOnly}
                    isInvalid={isError}
                    bg="white"
                    placeholder={field.key}
                 />
             )}
          </div>
        );
      })}
      
      {/* Actions Column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", width: "100%", padding: "0 5px" }}>
          <Button 
            // leftIcon={!isNew && <CheckIcon />}
            colorScheme="green" 
            size="sm" 
            onClick={handleValidationAndSave}
            aria-label="Save"
            px={isNew ? 4 : 2}
            width="100%"
          >
            {isNew ? "Add" : "Save"}
          </Button>
          <Button 
            // leftIcon={!isNew && <CloseIcon />} 
            variant="outline"
            size="sm" 
            onClick={onCancel}
            aria-label="Cancel"
            width="100%"
          >
            {isNew ? "Clear" : "Cancel"}
          </Button>
      </div>
    </div>
  );
};

export default EditableRow;
