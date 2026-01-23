import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Flex,
  Checkbox,
  CheckboxGroup,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useSelector, useDispatch } from "react-redux";

import ItemsData from "../utils/ItemsData";
import { updateSelectOptions } from "../redux/slices/auth";
import { findAutoFillData, getFilteredOptions } from "../utils/constant";

function FormDialog({
  IndicationText,
  FormArray,
  SelectArray,
  graphFormArray,
  handleSubmit,
  isOpen,
  onClose,
  initialData = {},
  mode = "form",
}) {
  const dispatch = useDispatch();

  const initialRef = useRef(null);
  const detailingProducts = useSelector(
    (state) => state.department.detailingProducts
  );
  const SelectOptionsArray =
    useSelector((state) => state.auth.SelectOptionsArray) ||
    ItemsData.SelectOptionsArray;
  const groupItem = useSelector((state) => state.auth.groupItem);

  const {
    DefaultSelectProcess,
    ArrayValuesProcess,
    ImageUploadArray,
    DateFieldsArray,
    noOthers,
    TimeArrays,
    NumberFields,
    MandatoryFields,
    noEditableFields,
  } = ItemsData;

  const [formValues, setFormValues] = useState(initialData);
  const [selectValues, setSelectValues] = useState({});
  const [graphData, setGraphData] = useState(
    graphFormArray
      ? graphFormArray.map((g) => ({
          name: g.name,
          data: g.data || [""],
        }))
      : []
  );

  const [dynamicOptions, setDynamicOptions] = useState({});

  // Helper to refresh filtered options for all select fields
  const refreshDynamicOptions = (currentFormValues, currentSelectValues) => {
    const mergedValues = { ...currentFormValues, ...currentSelectValues };
    const formDataFormat = Object.keys(mergedValues).map((key) => ({
      key,
      value: mergedValues[key],
    }));

    const newDynamicOptions = {};

    // Filter for SelectArray
    if (SelectArray) {
      SelectArray.forEach((field) => {
        const defaultOptions = field.options || [];
        newDynamicOptions[field.key] = getFilteredOptions(
          groupItem,
          formDataFormat,
          field.key,
          defaultOptions
        );
      });
    }

    // Filter for FormArray (select types)
    if (FormArray) {
      FormArray.forEach((field) => {
        const selectMatch = SelectOptionsArray.find(
          (item) => item.key === field.key
        );
        if (selectMatch) {
          const defaultOptions = selectMatch.value || [];
          newDynamicOptions[field.key] = getFilteredOptions(
            groupItem,
            formDataFormat,
            field.key,
            defaultOptions
          );
        }
      });
    }

    setDynamicOptions(newDynamicOptions);
  };

  // Reset on initialData change
  useEffect(() => {
    setFormValues(initialData);
    refreshDynamicOptions(initialData, selectValues);
  }, [initialData]);

  useEffect(() => {
    if (SelectArray) {
      const initialSelects = {};
      SelectArray.forEach((field) => {
        if (initialData[field.key] !== undefined) {
          initialSelects[field.key] = initialData[field.key];
        }
      });
      setSelectValues(initialSelects);
      refreshDynamicOptions(formValues, initialSelects);
    }
  }, [initialData, SelectArray]);

  const handleInputChange = (field, value, subIndex = null) => {
    let newFormValues;
    if (subIndex !== null && Array.isArray(formValues[field])) {
      const updated = [...formValues[field]];
      updated[subIndex] = value;
      newFormValues = { ...formValues, [field]: updated };
    } else {
      newFormValues = { ...formValues, [field]: value };
    }

    // Autofill Logic
    const autoFillData = findAutoFillData(groupItem, field, value);
    if (autoFillData) {
      Object.keys(autoFillData).forEach((autoKey) => {
        if (autoKey === field) return;
        // Search in formValues or selectValues
        if (FormArray?.some((f) => f.key === autoKey)) {
          newFormValues[autoKey] = autoFillData[autoKey];
        } else if (SelectArray?.some((s) => s.key === autoKey)) {
          setSelectValues((prev) => ({
            ...prev,
            [autoKey]: autoFillData[autoKey],
          }));
        }
      });
    }

    setFormValues(newFormValues);
    refreshDynamicOptions(newFormValues, selectValues);
  };

  const handleSelectChange = (field, value) => {
    const newSelectValues = { ...selectValues, [field]: value };

    // Autofill Logic
    const autoFillData = findAutoFillData(groupItem, field, value);
    if (autoFillData) {
      const newFormValues = { ...formValues };
      Object.keys(autoFillData).forEach((autoKey) => {
        if (autoKey === field) return;
        if (SelectArray?.some((s) => s.key === autoKey)) {
          newSelectValues[autoKey] = autoFillData[autoKey];
        } else if (FormArray?.some((f) => f.key === autoKey)) {
          newFormValues[autoKey] = autoFillData[autoKey];
        }
      });
      setFormValues(newFormValues);
    }

    setSelectValues(newSelectValues);
    refreshDynamicOptions(formValues, newSelectValues);
  };

  const handleReset = () => {
    // Clear everything as requested
    const clearedForm = {};
    if (FormArray) {
      FormArray.forEach((f) => {
        if (ArrayValuesProcess.includes(f.key)) {
          clearedForm[f.key] = [""];
        } else {
          clearedForm[f.key] = "";
        }
      });
    }
    const clearedSelect = {};
    if (SelectArray) {
      SelectArray.forEach((s) => {
        clearedSelect[s.key] = "";
      });
    }
    setFormValues(clearedForm);
    setSelectValues(clearedSelect);
    setGraphData(
      graphFormArray
        ? graphFormArray.map((g) => ({
            name: g.name,
            data: [""],
          }))
        : []
    );
    refreshDynamicOptions(clearedForm, clearedSelect);
  };

  // Array helpers
  const handleAddArrayInput = (field) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleRemoveArrayInput = (field, subIndex) => {
    setFormValues((prev) => {
      const updated = [...(prev[field] || [])];
      updated.splice(subIndex, 1);
      if (updated.length === 0) updated.push("");
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = () => {
    let data;

    if (mode === "edit-graph") {
      data = { ...formValues, ...selectValues, graph: graphData };
    } else if (mode === "create-graph") {
      const rows = formValues.graphRows || [];
      const xValues = rows.map((r) => r.x);
      const yValues = rows.map((r) => r.y);

      data = {
        ...formValues,
        ...selectValues,
        graph: [
          { name: formValues.xAxis || "X", data: xValues },
          { name: formValues.yAxis || "Y", data: yValues },
        ],
      };
    } else {
      // ✅ Default form mode
      const merged = { ...formValues, ...selectValues };

      const items = Object.keys(merged).map((key) => {
        const value = merged[key];

        // Determine process type
        let process = "value";

        if (DefaultSelectProcess.includes(key)) {
          process = "multiSelect";
        } else if (SelectArray?.some((s) => s.key === key)) {
          process = "select";
        } else if (ImageUploadArray.includes(key)) {
          process = "image";
        } else if (ArrayValuesProcess.includes(key)) {
          process = "array";
        } else if (DateFieldsArray.includes(key)) {
          process = "date";
        } else if (TimeArrays.includes(key)) {
          process = "time";
        } else if (NumberFields.includes(key)) {
          process = "number";
        }

        // unwrap image file if needed
        const finalValue = value?.file ? value.file : value;

        return { key, value: finalValue, process };
      });

      data = items;
    }

    handleSubmit(data);
    onClose();
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="4xl"
      maxH="70vh"
      overflowY="auto"
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
        <ModalBody pb={6}>
          <Stack gap="4">
            {/* Select dropdowns from SelectArray */}
            {SelectArray &&
              SelectArray.map((field, index) => (
                <FormControl key={index}>
                  <FormLabel>{field.label}</FormLabel>
                  <Select
                    isDisabled={noEditableFields.includes(field.key)}
                    placeholder={`Select ${field.label}`}
                    value={selectValues[field.key] || ""}
                    onChange={(e) =>
                      handleSelectChange(field.key, e.target.value)
                    }
                  >
                    {(dynamicOptions[field.key] || field.options || []).map(
                      (option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
              ))}

            {/* Form fields */}
            {FormArray &&
              FormArray.map((field, index) => {
                const selectMatch = SelectOptionsArray.find(
                  (item) => item.key === field.key
                );

                return (
                  <FormControl key={index}>
                    <FormLabel>{field.label}</FormLabel>

                    {DefaultSelectProcess.includes(field.key) ? (
                      // ✅ Checkbox group
                      <CheckboxGroup
                        isDisabled={noEditableFields.includes(field.key)}
                        value={formValues["DETAILING PRODUCT"] || []}
                        onChange={(selectedRowIds) =>
                          handleInputChange("DETAILING PRODUCT", selectedRowIds)
                        }
                      >
                        <Stack direction="row" wrap="wrap">
                          {detailingProducts?.data?.map((row) => {
                            const subPartLabel = row.items.find(
                              (item) => item.key === "SUB PARTS"
                            )?.value;
                            return (
                              <Checkbox key={row._id} value={row._id}>
                                {subPartLabel}
                              </Checkbox>
                            );
                          })}
                        </Stack>
                      </CheckboxGroup>
                    ) : ArrayValuesProcess.includes(field.key) ? (
                      // ✅ Array inputs
                      <Stack spacing={2}>
                        {(Array.isArray(formValues[field.key])
                          ? formValues[field.key]
                          : [""]
                        ).map((val, subIdx) => (
                          <Flex key={subIdx} gap={2} align="center">
                            <Input
                              isDisabled={noEditableFields.includes(field.key)}
                              value={val}
                              placeholder={`Enter ${field.label}`}
                              onChange={(e) =>
                                handleInputChange(
                                  field.key,
                                  e.target.value,
                                  subIdx
                                )
                              }
                            />
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() =>
                                handleRemoveArrayInput(field.key, subIdx)
                              }
                            >
                              Remove
                            </Button>
                            {subIdx ===
                              (formValues[field.key]?.length || 1) - 1 && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleAddArrayInput(field.key)}
                              >
                                + Add
                              </Button>
                            )}
                          </Flex>
                        ))}
                      </Stack>
                    ) : selectMatch ? (
                      <Stack spacing={2}>
                        <Select
                          isDisabled={noEditableFields.includes(field.key)}
                          placeholder={`Select ${field.label}`}
                          value={
                            formValues[field.key] === "Others"
                              ? "Others"
                              : formValues[field.key] || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;

                           if (val === "Others") {
                                // keep showing input field
                                const newValues = {
                                  ...formValues,
                                  [field.key]: "Others",
                                  [`${field.key}_other`]:
                                    formValues[`${field.key}_other`] || "",
                                };
                                setFormValues(newValues);
                                refreshDynamicOptions(newValues, selectValues);
                              } else {
                                handleInputChange(field.key, val);
                              }
                            }}
                          >
                            {(() => {
                              const options = [
                                ...(dynamicOptions[field.key] ||
                                  selectMatch.value),
                              ];
                              const currentValue = formValues[field.key];

                            // ✅ If editing & current value not in dropdown, add it temporarily
                            if (
                              currentValue &&
                              !options.includes(currentValue) &&
                              currentValue !== "Others"
                            ) {
                              options.unshift(currentValue);
                            }

                            // ✅ Always ensure "Others" is at the end
                            if (!options.includes("Others")) {
                              options.push("Others");
                            }

                            return options.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ));
                          })()}
                        </Select>

                        {/* ✅ Show input field when "Others" is selected */}
                        {formValues[field.key] === "Others" && (
                          <Input
                            isDisabled={noEditableFields.includes(field.key)}
                            placeholder={`Enter other ${field.label}`}
                            value={formValues[`${field.key}_other`] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormValues((prev) => ({
                                ...prev,
                                [`${field.key}_other`]: val,
                              }));
                            }}
                            onBlur={() => {
                              const customValue =
                                formValues[`${field.key}_other`]?.trim();
                              if (customValue) {
                                setFormValues((prev) => {
                                  const updated = {
                                    ...prev,
                                    [field.key]: customValue,
                                  };
                                  delete updated[`${field.key}_other`];
                                  return updated;
                                });

                                // ✅ Optionally add new value to Redux SelectOptionsArray
                                dispatch(
                                  updateSelectOptions({
                                    key: field.key,
                                    value: [customValue],
                                  })
                                );
                              }
                            }}
                          />
                        )}
                      </Stack>
                    ) : DateFieldsArray.includes(field.key) ? (
                      // ✅ Date field
                      <Input
                        isDisabled={noEditableFields.includes(field.key)}
                        type="date"
                        value={formValues[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                      />
                    ) : ImageUploadArray.includes(field.key) ? (
                      // ✅ Image upload with thumbnail preview
                      <Stack spacing={3}>
                        <Input
                          isDisabled={noEditableFields.includes(field.key)}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              handleInputChange(field.key, {
                                file,
                                previewUrl,
                              });
                            } else {
                              handleInputChange(field.key, null);
                            }
                          }}
                        />
                        {formValues[field.key]?.previewUrl && (
                          <img
                            src={formValues[field.key].previewUrl}
                            alt="Preview"
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #ccc",
                            }}
                          />
                        )}
                      </Stack>
                    ) : TimeArrays.includes(field.key) ? (
                      // ✅ Time field
                      <Input
                        isDisabled={noEditableFields.includes(field.key)}
                        type="time"
                        value={formValues[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                      />
                    ) : NumberFields.includes(field.key) ? (
                      // ✅ Number field
                      <Input
                        isDisabled={noEditableFields.includes(field.key)}
                        type="number"
                        value={formValues[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                      />
                    ) : (
                      // ✅ Default input
                      <Input
                        isDisabled={noEditableFields.includes(field.key)}
                        ref={index === 0 ? initialRef : null}
                        placeholder={field.label}
                        value={formValues[field.key] || ""}
                        type={
                          typeof formValues[field.key] === "string" &&
                          formValues[field.key].startsWith("processId -")
                            ? "password"
                            : "text"
                        }
                        readOnly={
                          typeof formValues[field.key] === "string" &&
                          formValues[field.key].startsWith("processId -")
                        }
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                      />
                    )}
                  </FormControl>
                );
              })}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button ml={3} onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FormDialog;
