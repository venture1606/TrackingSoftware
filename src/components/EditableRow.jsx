import React, { useState, useEffect, useRef, useMemo } from "react";
import {
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
  Switch,
} from "@chakra-ui/react";
import {
  CheckIcon,
  CloseIcon,
  AddIcon,
  AttachmentIcon,
} from "@chakra-ui/icons";
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
  processId = null,
  rowId = null,
}) => {
  const dispatch = useDispatch();

  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts,
  );
  const SelectOptionsArray =
    useSelector((state) =>
      state.auth.SelectOptionsArray?.length > 0
        ? state.auth.SelectOptionsArray
        : null,
    ) || ItemsData.SelectOptionsArray;
  const groupItem = useSelector((state) => state.auth.groupItem);

  const {
    DefaultHeaderAndProcessId,
    DefaultSelectProcess,
    ArrayValuesProcess,
    DateFieldsArray,
    ProcessDateFields,
    ImageUploadArray,
    noOthers,
    TimeArrays,
    NumberFields,
    MandatoryFields,
    ToggleFieldsArray,
  } = ItemsData;

  const processScopedDateFields = useMemo(() => {
    if (!processId || !ProcessDateFields?.[processId]) return [];
    return ProcessDateFields[processId];
  }, [processId, ProcessDateFields]);

  const isDateFieldKey = (key) => {
    if (!key) return false;
    const lowerKey = key.trim().toLowerCase();
    return (
      DateFieldsArray.some((h) => h.trim().toLowerCase() === lowerKey) ||
      processScopedDateFields.some((h) => h.trim().toLowerCase() === lowerKey)
    );
  };

  const noEditableFields = DataCheck?.noEditableFields || [];

  const [formData, setFormData] = useState([]);
  const [options, setOptions] = useState({});
  const [errorFields, setErrorFields] = useState([]);

  // Build options for DETAILING PRODUCT
  useEffect(() => {
    if (detailingProducts?.data?.length) {
      const filteredProducts = currentBomId
        ? detailingProducts.data.filter((row) => row.rowDataId === currentBomId)
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
          (item) => item.key.toLowerCase() === field.key.toLowerCase(),
        );
        const defaultOptions = defaultMatch?.value || [];
        const newOptions = getFilteredOptions(
          groupItem,
          currentFormData,
          field.key,
          defaultOptions,
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
      if (DefaultSelectProcess.some((h) => h.trim().toLowerCase() === lowerKey))
        return "multiSelect";
      if (ArrayValuesProcess.some((h) => h.trim().toLowerCase() === lowerKey))
        return "arrayInput";
      if (isDateFieldKey(key)) return "date";
      if (ImageUploadArray.some((h) => h.trim().toLowerCase() === lowerKey))
        return "image";
      if (TimeArrays.some((h) => h.trim().toLowerCase() === lowerKey))
        return "time";
      if (NumberFields.some((h) => h.trim().toLowerCase() === lowerKey))
        return "number";
      if (
        ToggleFieldsArray.some((h) => h.trim().toLowerCase() === lowerKey)
      )
        return "toggle";
      if (
        DefaultHeaderAndProcessId.some(
          (item) => item.tableHeader.trim().toLowerCase() === lowerKey,
        )
      )
        return "processId";
      if (
        SelectOptionsArray.some(
          (item) => item.key.trim().toLowerCase() === lowerKey,
        )
      )
        return "select";
      return "value";
    };

    if (initialData) {
      // Edit Mode
      mappedData = (headers || []).map((key) => {
        const cell = initialData.find((item) => item.key === key);
        let value = cell ? cell.value : "";
        let process = getProcessType(key);

        if (process === "arrayInput" && !Array.isArray(value)) {
          value = [value || ""];
        }

        // Convert epoch string back to YYYY-MM-DD for the date input
        if (process === "date" && value && /^\d+$/.test(String(value))) {
          const d = new Date(Number(value));
          if (!isNaN(d.getTime())) {
            value = d.toISOString().split("T")[0];
          }
        }

        if (value == null) value = "";

        const field = { key, value, process };
        if (process === "select") {
          const selectMatch = SelectOptionsArray.find(
            (item) =>
              item.key.trim().toLowerCase() === key.trim().toLowerCase(),
          );
          field.options = selectMatch ? selectMatch.value : [];
        }

        return field;
      });
    } else {
      // New Mode (Add Data logic)
      mappedData = (headers || []).map((key) => {
        const process = getProcessType(key);
        let value = "";

        if (process === "processId") {
          const match = DefaultHeaderAndProcessId.find(
            (item) => item.tableHeader === key,
          );
          value = match ? match.processId : "";
        } else if (process === "multiSelect") {
          value = [];
        } else if (process === "arrayInput") {
          value = [""];
        } else if (process === "select") {
          const selectMatch = SelectOptionsArray.find(
            (item) =>
              item.key.trim().toLowerCase() === key.trim().toLowerCase(),
          );
          const hasRed = selectMatch?.value.some(
            (v) => v.toLowerCase() === "red",
          );
          return {
            key,
            value: hasRed ? "Red" : "",
            process: "select",
            options: selectMatch?.value || [],
          };
        } else if (process === "toggle") {
          value = "NO";
        }

        return { key, value, process };
      });
    }

    setFormData(refreshOptions(mappedData));
    // Re-init only when switching rows / headers / process — not when parent
    // replaces initialData array identity during a query refresh mid-edit.
  }, [headers, processId, rowId, isNew]);

  // Separate effect for updating options when SelectOptionsArray or groupItem changes
  useEffect(() => {
    if (formData.length > 0) {
      const updatedData = refreshOptions(formData);
      setFormData(updatedData);
    }
  }, [SelectOptionsArray, groupItem]);

  const handleValueChange = (index, val, subIndex = null) => {
    setFormData((prev) => {
      const newData = prev.map((field, i) =>
        i === index ? { ...field } : field,
      );
      const key = newData[index]?.key;
      if (!key) return prev;

      if (subIndex !== null && Array.isArray(newData[index].value)) {
        const updatedArray = [...newData[index].value];
        updatedArray[subIndex] = val;
        newData[index].value = updatedArray;
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
            newData[targetIndex] = {
              ...newData[targetIndex],
              value: autoFillData[autoKey],
            };
          }
        });
      }

      return refreshOptions(newData);
    });

    setErrorFields((prev) => {
      const key = formData[index]?.key;
      if (!key || !prev.includes(key)) return prev;
      return prev.filter((k) => k !== key);
    });
  };

  const handleValidationAndSave = () => {
    const errors = [];
    for (const field of formData) {
      if (MandatoryFields.includes(field.key)) {
        let val = field.value;
        if (val === "others") {
          val = field.otherValue || "";
        }

        const isEmpty =
          !val ||
          (Array.isArray(val) && val.length === 0) ||
          (Array.isArray(val) && val.every((v) => !v && !String(v).trim())) ||
          (typeof val === "string" && !val.trim());

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
      let val = field.value;
      if (val === "others" && field.otherValue) {
        val = field.otherValue;
      }

      if (field.process === "image" && val?.file) {
        return { ...field, value: val.file };
      }
      // Convert date fields to epoch milliseconds string
      if (field.process === "date" && val) {
        const epoch = new Date(val).getTime();
        if (!isNaN(epoch)) {
          return { ...field, value: String(epoch) };
        }
      }
      return { ...field, value: val };
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
    newData[index].value = [...newData[index].value, ""];
    setFormData(newData);
  };

  const handleRemoveArrayInput = (index, subIndex) => {
    const newData = [...formData];
    const updatedArray = [...newData[index].value];
    updatedArray.splice(subIndex, 1);
    if (updatedArray.length === 0) updatedArray.push("");
    newData[index].value = updatedArray;
    setFormData(newData);
  };

  const cellStyle = {
    borderRight: "1px solid #edf2f7",
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    width: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const controlSx = {
    w: "100%",
    minW: 0,
    fontSize: "xs",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        gap: "0",
        backgroundColor: "#ebf8ff",
        padding: "0",
        borderRadius: "6px",
        border: "1px solid #63b3ed",
        alignItems: "stretch",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {formData.map((field, idx) => {
        const isReadOnly =
          !isNew &&
          (noEditableFields.some(
            (h) => h.trim().toLowerCase() === field.key.trim().toLowerCase(),
          ) ||
            field.process === "processId");
        const isError = errorFields.includes(field.key);

        return (
          <div key={idx} style={cellStyle}>
            {field.process === "processId" ? (
              <Input
                size="sm"
                value={field.value}
                isReadOnly
                bg="gray.50"
                variant="filled"
                placeholder={field.key}
                sx={controlSx}
              />
            ) : field.process === "multiSelect" ? (
              <CheckboxGroup
                value={field.value || []}
                onChange={(vals) => handleValueChange(idx, vals)}
              >
                <SimpleGrid columns={2} spacing={2} py={1} w="100%">
                  {(options[field.key] || []).map((opt, i) => (
                    <Checkbox key={i} value={opt.value} size="sm">
                      <Text fontSize="xs" noOfLines={1}>
                        {opt.label}
                      </Text>
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            ) : field.process === "arrayInput" ? (
              <Stack spacing={1} width="100%" minW={0}>
                {(Array.isArray(field.value) ? field.value : [""]).map(
                  (val, subIdx) => (
                    <Flex key={subIdx} gap={1} align="center" minW={0}>
                      <Input
                        size="sm"
                        value={val}
                        onChange={(e) =>
                          handleValueChange(idx, e.target.value, subIdx)
                        }
                        isInvalid={isError}
                        bg="white"
                        placeholder={field.key}
                        sx={controlSx}
                      />
                      <IconButton
                        size="xs"
                        flexShrink={0}
                        icon={<CloseIcon boxSize={2} />}
                        colorScheme="red"
                        variant="ghost"
                        aria-label={`Remove ${field.key} value`}
                        onClick={() => handleRemoveArrayInput(idx, subIdx)}
                      />
                    </Flex>
                  ),
                )}
                <IconButton
                  size="xs"
                  alignSelf="flex-start"
                  icon={<AddIcon boxSize={2.5} />}
                  variant="outline"
                  colorScheme="blue"
                  aria-label={`Add ${field.key} value`}
                  onClick={() => handleAddArrayInput(idx)}
                />
              </Stack>
            ) : field.process === "select" ? (
              <Stack spacing={1} width="100%" minW={0}>
                <Select
                  size="sm"
                  value={
                    field.value === "others" ? "others" : field.value || ""
                  }
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
                  sx={controlSx}
                >
                  {field.options
                    ?.filter((o) => o.toLowerCase() !== "others")
                    .map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  {!noOthers.includes(field.key) && (
                    <option value="others">Others</option>
                  )}
                </Select>
                {field.value === "others" && (
                  <Input
                    size="sm"
                    placeholder={`Enter ${field.key}`}
                    value={field.otherValue || ""}
                    onChange={(e) => {
                      const newData = [...formData];
                      newData[idx].otherValue = e.target.value;
                      setFormData(newData);
                    }}
                    onBlur={() => {
                      const customVal = field.otherValue?.trim();
                      if (customVal) {
                        const newData = [...formData];
                        newData[idx].value = customVal;

                        if (
                          newData[idx].options &&
                          !newData[idx].options.includes(customVal)
                        ) {
                          newData[idx].options = [
                            ...newData[idx].options,
                            customVal,
                          ];
                        }

                        delete newData[idx].otherValue;
                        setFormData(newData);

                        dispatch(
                          updateSelectOptions({
                            key: field.key,
                            value: [...(field.options || []), customVal],
                          }),
                        );
                      }
                    }}
                    bg="white"
                    sx={controlSx}
                  />
                )}
              </Stack>
            ) : field.process === "date" ? (
              <Input
                type="date"
                size="sm"
                value={field.value ?? ""}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                isInvalid={isError}
                isDisabled={isReadOnly}
                bg="white"
                placeholder={field.key}
                sx={controlSx}
              />
            ) : field.process === "time" ? (
              <Input
                type="time"
                size="sm"
                value={field.value ?? ""}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                isInvalid={isError}
                isDisabled={isReadOnly}
                bg="white"
                placeholder={field.key}
                sx={controlSx}
              />
            ) : field.process === "number" ? (
              <Input
                type="number"
                size="sm"
                value={field.value ?? ""}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                isInvalid={isError}
                isDisabled={isReadOnly}
                bg="white"
                placeholder={field.key}
                sx={controlSx}
              />
            ) : field.process === "image" ? (
              <Stack spacing={1} align="center" width="100%" minW={0}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id={`file-upload-${idx}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      handleValueChange(idx, { file, previewUrl: url });
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
                  <Center gap={1}>
                    <AttachmentIcon color="gray.500" boxSize={3} />
                    <Text fontSize="xs" color="gray.600" fontWeight="500">
                      Upload
                    </Text>
                  </Center>
                </Box>
                {field.value?.previewUrl && (
                  <Box
                    border="1px solid"
                    borderColor="gray.100"
                    p={1}
                    borderRadius="md"
                    bg="white"
                  >
                    <img
                      src={field.value.previewUrl}
                      alt="prev"
                      width="48"
                      style={{ borderRadius: "4px" }}
                    />
                  </Box>
                )}
              </Stack>
            ) : field.process === "toggle" ? (
              <Flex align="center" gap={2}>
                <Text fontSize="xs" fontWeight="bold">
                  {field.value === "YES" ? "YES" : "NO"}
                </Text>
                <Switch
                  size="sm"
                  isChecked={field.value === "YES"}
                  onChange={(e) =>
                    handleValueChange(idx, e.target.checked ? "YES" : "NO")
                  }
                  colorScheme="green"
                />
              </Flex>
            ) : (
              <Input
                size="sm"
                value={field.value ?? ""}
                onChange={(e) => handleValueChange(idx, e.target.value)}
                isDisabled={isReadOnly}
                isInvalid={isError}
                bg="white"
                placeholder={field.key}
                sx={controlSx}
              />
            )}
          </div>
        );
      })}

      {/* Actions — icon buttons so they fit the Actions column track */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          width: "100%",
          minWidth: 0,
          padding: "6px 8px",
          boxSizing: "border-box",
        }}
      >
        <Tooltip label={isNew ? "Add row" : "Save"} hasArrow>
          <IconButton
            icon={<CheckIcon />}
            colorScheme="green"
            size="sm"
            onClick={handleValidationAndSave}
            aria-label={isNew ? "Add row" : "Save"}
            flexShrink={0}
          />
        </Tooltip>
        <Tooltip label={isNew ? "Cancel" : "Cancel edit"} hasArrow>
          <IconButton
            icon={<CloseIcon />}
            variant="outline"
            colorScheme="gray"
            size="sm"
            onClick={onCancel}
            aria-label={isNew ? "Cancel add" : "Cancel"}
            flexShrink={0}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default EditableRow;
