import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Flex,
  Stack,
  Checkbox,
  CheckboxGroup,
  Select,
  IconButton,
  Tooltip,
  Box,
  Text,
  Center,
} from "@chakra-ui/react";
import { RepeatIcon, AttachmentIcon } from "@chakra-ui/icons";
import { useSelector, useDispatch } from "react-redux";

import ItemsData from "../utils/ItemsData";
import { updateSelectOptions } from "../redux/slices/auth";
import { findAutoFillData, getFilteredOptions } from "../utils/constant";

function AddData({
  IndicationText = "Add Data",
  headers = [],
  isOpen,
  onClose,
  onSave,
  currentBomId = null,
}) {
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

  const initialRef = useRef(null);

  // Helper to recalculate options for all select fields based on current groupItem and formData
  const refreshOptions = (currentFormData) => {
    return currentFormData.map((field) => {
      if (field.process === "select") {
        const defaultMatch = SelectOptionsArray.find(
          (item) => item.key.trim().toLowerCase() === field.key.trim().toLowerCase()
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

  const [formData, setFormData] = useState([]);
  const [options, setOptions] = useState({});
  const [errorFields, setErrorFields] = useState([]);

  // Build options from detailingProducts (CODE → rowId)
  useEffect(() => {
    if (detailingProducts?.data?.length) {
      const filteredProducts = currentBomId
        ? detailingProducts.data.filter(
            (row) => row.rowDataId === currentBomId // ✅ match BOM ID
          )
        : detailingProducts.data; // fallback if no filter

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

  // Initialize formData whenever headers change
  useEffect(() => {
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

    setFormData((prevData) => {
      const mappedData = headers.map((key) => {
        const prevField = prevData.find((f) => f.key === key);
        const process = getProcessType(key);
        let value = prevField?.value;

        if (value === undefined) {
             if (process === "multiSelect") value = [];
             else if (process === "arrayInput") value = [""];
             else if (process === "processId") {
                 const match = DefaultHeaderAndProcessId.find(item => item.tableHeader === key);
                 value = match ? match.processId : "";
             } else if (process === "select") {
                 const selectMatch = SelectOptionsArray.find(item => item.key.trim().toLowerCase() === key.trim().toLowerCase());
                 value = selectMatch?.value.some(v => v.toLowerCase() === "red") ? "Red" : "";
             } else {
                 value = "";
             }
        }

        const field = { key, value, process };
        if (process === "select") {
            const selectMatch = SelectOptionsArray.find(item => item.key.trim().toLowerCase() === key.trim().toLowerCase());
            field.options = selectMatch ? selectMatch.value : [];
        }

        return field;
      });

      return refreshOptions(mappedData);
    });
  }, [
    headers,
    DefaultHeaderAndProcessId,
    DefaultSelectProcess,
    ArrayValuesProcess,
    DateFieldsArray,
    ImageUploadArray,
    SelectOptionsArray,
    groupItem, // Added groupItem dependency
  ]);

  // Handle value change
  const handleValueChange = (index, val, subIndex = null) => {
    const newData = [...formData];
    const key = newData[index].key;

    if (subIndex !== null && Array.isArray(newData[index].value)) {
      newData[index].value[subIndex] = val;
    } else {
      newData[index].value = val;
    }

    // Autofill Logic
    const autoFillData = findAutoFillData(groupItem, key, val);
    if (autoFillData) {
      Object.keys(autoFillData).forEach((autoKey) => {
        if (autoKey === key) return; // Skip the key that triggered autofill
        const targetIndex = newData.findIndex((f) => f.key === autoKey);
        if (targetIndex !== -1) {
          newData[targetIndex].value = autoFillData[autoKey];
        }
      });
    }

    // Refresh dynamic options (dependent dropdowns)
    const updatedWithDynamicOptions = refreshOptions(newData);
    setFormData(updatedWithDynamicOptions);
    // Clear error for this field when user starts typing
    if (errorFields.includes(newData[index].key)) {
      setErrorFields(errorFields.filter((k) => k !== newData[index].key));
    }
  };

  // Add new input for arrayInput
  const handleAddArrayInput = (index) => {
    const newData = [...formData];
    newData[index].value.push("");
    setFormData(newData);
  };

  // Remove input for arrayInput
  const handleRemoveArrayInput = (index, subIndex) => {
    const newData = [...formData];
    newData[index].value.splice(subIndex, 1);
    if (newData[index].value.length === 0) {
      newData[index].value.push("");
    }
    setFormData(newData);
  };

  // Reset form to initial state
  const handleReset = () => {
    const mappedData = headers.map((key) => {
      const match = DefaultHeaderAndProcessId.find(
        (item) => item.tableHeader === key
      );

      if (match) {
        if (DefaultSelectProcess.includes(key)) {
          return {
            key,
            value: [],
            process: "multiSelect",
          };
        }
        return {
          key,
          value: match.processId,
          process: "processId",
        };
      }

      if (DefaultSelectProcess.includes(key)) {
        return {
          key,
          value: [],
          process: "multiSelect",
        };
      }

      if (ArrayValuesProcess.includes(key)) {
        return {
          key,
          value: [""],
          process: "arrayInput",
        };
      }

      // Dropdown select
      const selectMatch = SelectOptionsArray.find((item) => item.key === key);
      if (selectMatch) {
        const hasRed = selectMatch.value.includes("Red");
        return {
          key,
          value: hasRed ? "Red" : "",
          process: "select",
          options: selectMatch.value,
        };
      }

      // Date
      if (DateFieldsArray.includes(key)) {
        return {
          key,
          value: "",
          process: "date",
        };
      }

      // Image
      if (ImageUploadArray.includes(key)) {
        return {
          key,
          value: null,
          process: "image",
        };
      }

      if (TimeArrays.includes(key)) {
        return {
          key,
          value: "",
          process: "time",
        };
      }

      if (NumberFields.includes(key)) {
        return {
          key,
          value: "",
          process: "number",
        };
      }

      return {
        key,
        value: "",
        process: "value",
      };
    });

    const resetWithDynamicOptions = refreshOptions(mappedData);
    setFormData(resetWithDynamicOptions);
    setErrorFields([]);
  };

  // Save handler
  const handleSave = () => {
    // ✅ Validate mandatory fields
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

    setErrorFields([]);

    // ✅ just send structured items
    const items = formData.map((field) => {
      if (field.process === "image") {
        if (field.value?.file) {
          return { ...field, value: field.value.file }; // keep File object
        }
        return { ...field, value: field.value || "" };
      }
      // Convert date fields to epoch milliseconds string
      if (field.process === "date" && field.value) {
        const epoch = new Date(field.value).getTime();
        if (!isNaN(epoch)) {
          return { ...field, value: String(epoch) };
        }
      }
      return field;
    });

    onSave && onSave(items); // parent handles API formatting
    onClose();
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="4xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" justify="space-between" pr={10}>
            {IndicationText}
            <Tooltip label="Reset Form">
              <IconButton
                icon={<RepeatIcon />}
                aria-label="Reset Form"
                size="sm"
                colorScheme="orange"
                variant="ghost"
                onClick={handleReset}
              />
            </Tooltip>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Stack spacing={4}>
            {formData.map((field, idx) => (
              <Flex key={idx} gap={3} align="flex-start">
                {/* Key column */}
                <Input
                  value={field.key}
                  isReadOnly
                  width="150px"
                  placeholder="Key"
                />

                {/* Render based on field type */}
                {field.process === "processId" ? (
                  <Input
                    value={field.value}
                    isReadOnly
                    placeholder="ProcessId"
                    borderColor={
                      errorFields.includes(field.key) ? "red.500" : undefined
                    }
                    borderWidth={
                      errorFields.includes(field.key) ? "2px" : undefined
                    }
                  />
                ) : field.process === "multiSelect" ? (
                  <CheckboxGroup
                    value={field.value} // stores selected rowIds
                    onChange={(selectedValues) =>
                      handleValueChange(idx, selectedValues)
                    }
                  >
                    <Stack
                      direction="row"
                      wrap="wrap"
                      borderColor={
                        errorFields.includes(field.key) ? "red.500" : undefined
                      }
                      borderWidth={
                        errorFields.includes(field.key) ? "2px" : undefined
                      }
                      borderRadius="md"
                      p={errorFields.includes(field.key) ? 2 : 0}
                    >
                      {(options[field.key] || []).map((opt, i) => (
                        <Checkbox key={i} value={opt.value}>
                          {opt.label}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                ) : field.process === "arrayInput" ? (
                  <Stack spacing={2} flex="1">
                    {field.value.map((val, subIdx) => (
                      <Flex key={subIdx} gap={2} align="center">
                        <Input
                          value={val}
                          placeholder="Enter value"
                          onChange={(e) =>
                            handleValueChange(idx, e.target.value, subIdx)
                          }
                          borderColor={
                            errorFields.includes(field.key)
                              ? "red.500"
                              : undefined
                          }
                          borderWidth={
                            errorFields.includes(field.key) ? "2px" : undefined
                          }
                        />
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleRemoveArrayInput(idx, subIdx)}
                        >
                          Remove
                        </Button>
                        {subIdx === field.value.length - 1 && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleAddArrayInput(idx)}
                          >
                            + Add
                          </Button>
                        )}
                      </Flex>
                    ))}
                  </Stack>
                ) : field.process === "select" ? (
                  <Stack flex="1" spacing={2}>
                    <Select
                      placeholder={`Select ${field.key}`}
                      value={field.value === "others" ? "others" : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "others") {
                          const newData = [...formData];
                          newData[idx].value = "others";
                          newData[idx].otherValue =
                            newData[idx].otherValue || "";
                          setFormData(newData);
                        } else {
                          // use handleValueChange to trigger autofill and standard updates
                          handleValueChange(idx, val);
                        }
                      }}
                      borderColor={
                        errorFields.includes(field.key) ? "red.500" : undefined
                      }
                      borderWidth={
                        errorFields.includes(field.key) ? "2px" : undefined
                      }
                    >
                      {/* normal options */}
                      {field.options.filter(opt => opt.toLowerCase() !== "others").map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}

                      {/* ONLY add Others when key not in noOthers */}
                      {!noOthers.includes(field.key) && (
                        <option value="others">Others</option>
                      )}
                    </Select>

                    {/* ✅ Input appears when "Others" is selected */}
                    {field.value === "others" && (
                      <Input
                        placeholder={`Enter other ${field.key}`}
                        value={field.otherValue || ""}
                        onChange={(e) => {
                          const newData = [...formData];
                          newData[idx].otherValue = e.target.value;
                          setFormData(newData);
                        }}
                        onBlur={() => {
                          const newData = [...formData];
                          const customValue = newData[idx].otherValue?.trim();

                          if (customValue) {
                            // ✅ 1️⃣ Commit the custom value
                            newData[idx].value = customValue;
                            delete newData[idx].otherValue;
                            setFormData(newData);

                            // ✅ 2️⃣ Update the options list locally
                            const updatedOptions = field.options.includes(
                              customValue
                            )
                              ? field.options
                              : [...field.options, customValue];

                            newData[idx].options = updatedOptions;
                            setFormData([...newData]);

                            // ✅ 3️⃣ Optionally update global Redux SelectOptionsArray
                            dispatch(
                              updateSelectOptions({
                                key: field.key,
                                value: updatedOptions,
                              })
                            );
                          }
                        }}
                      />
                    )}
                  </Stack>
                ) : field.process === "date" ? (
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    borderColor={
                      errorFields.includes(field.key) ? "red.500" : undefined
                    }
                    borderWidth={
                      errorFields.includes(field.key) ? "2px" : undefined
                    }
                  />
                ) : field.process === "image" ? (
                  <Stack spacing={3} align="center">
                    <input
                      type="file"
                      id={`file-upload-add-${idx}`}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          handleValueChange(idx, { file, previewUrl });
                        } else {
                          handleValueChange(idx, null);
                        }
                      }}
                    />
                    <Box
                      as="label"
                      htmlFor={`file-upload-add-${idx}`}
                      cursor="pointer"
                      border="1px dashed"
                      borderColor={errorFields.includes(field.key) ? "red.500" : "gray.300"}
                      borderRadius="md"
                      p={1}
                      width="100%"
                      bg="white"
                      _hover={{ borderColor: "blue.400", bg: "gray.50" }}
                      transition="all 0.2s"
                    >
                      <Center gap={2}>
                        <AttachmentIcon color="gray.500" />
                        <Text fontSize="sm" color="gray.600" fontWeight="500">
                          Upload Image
                        </Text>
                      </Center>
                    </Box>

                    {field.value?.previewUrl && (
                      <Flex direction="column" align="center" gap={2} width="100%">
                        <Box border="1px solid" borderColor="gray.200" p={1} borderRadius="lg" bg="white">
                          <img
                            src={field.value.previewUrl}
                            alt="Preview"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleValueChange(idx, null)}
                        >
                          Remove Image
                        </Button>
                      </Flex>
                    )}
                  </Stack>
                ) : field.process === "time" ? (
                  <Input
                    type="time"
                    value={field.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    borderColor={
                      errorFields.includes(field.key) ? "red.500" : undefined
                    }
                    borderWidth={
                      errorFields.includes(field.key) ? "2px" : undefined
                    }
                  />
                ) : field.process === "number" ? (
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    borderColor={
                      errorFields.includes(field.key) ? "red.500" : undefined
                    }
                    borderWidth={
                      errorFields.includes(field.key) ? "2px" : undefined
                    }
                  />
                ) : (
                  <Input
                    ref={idx === 0 ? initialRef : null}
                    value={field.value}
                    placeholder="Value"
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    borderColor={
                      errorFields.includes(field.key) ? "red.500" : undefined
                    }
                    borderWidth={
                      errorFields.includes(field.key) ? "2px" : undefined
                    }
                  />
                )}
              </Flex>
            ))}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button ml={3} colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AddData;
