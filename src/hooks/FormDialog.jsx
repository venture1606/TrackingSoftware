import React, { useRef, useState, useEffect } from "react"
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
  CheckboxGroup
} from "@chakra-ui/react"
import { useSelector, useDispatch } from "react-redux"

import ItemsData from "../utils/ItemsData"
import { updateSelectOptions } from "../redux/slices/auth"

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
  const detailingProducts = useSelector((state) => state.department.detailingProducts);
  const SelectOptionsArray = useSelector((state) => state.auth.SelectOptionsArray) || ItemsData.SelectOptionsArray;

  const { 
    DefaultSelectProcess, ArrayValuesProcess, ImageUploadArray, DateFieldsArray
  } = ItemsData;

  const [formValues, setFormValues] = useState(initialData)
  const [selectValues, setSelectValues] = useState({})
  const [graphData, setGraphData] = useState(
    graphFormArray
      ? graphFormArray.map((g) => ({
          name: g.name,
          data: g.data || [""],
        }))
      : []
  )

  // Reset on initialData change
  useEffect(() => {
    setFormValues(initialData)
  }, [initialData])

  useEffect(() => {
    if (SelectArray) {
      const initialSelects = {}
      SelectArray.forEach(field => {
        if (initialData[field.key] !== undefined) {
          initialSelects[field.key] = initialData[field.key]
        }
      })
      setSelectValues(initialSelects)
    }
  }, [initialData, SelectArray])

  const handleInputChange = (field, value, subIndex = null) => {
    setFormValues((prev) => {
      if (subIndex !== null && Array.isArray(prev[field])) {
        const updated = [...prev[field]]
        updated[subIndex] = value
        return { ...prev, [field]: updated }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleSelectChange = (field, value) => {
    setSelectValues((prev) => ({ ...prev, [field]: value }))
  }

  // Array helpers
  const handleAddArrayInput = (field) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }))
  }

  const handleRemoveArrayInput = (field, subIndex) => {
    setFormValues((prev) => {
      const updated = [...(prev[field] || [])]
      updated.splice(subIndex, 1)
      if (updated.length === 0) updated.push("")
      return { ...prev, [field]: updated }
    })
  }

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
        <ModalHeader>{IndicationText}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack gap="4">
            {/* Select dropdowns from SelectArray */}
            {SelectArray &&
              SelectArray.map((field, index) => (
                <FormControl key={index}>
                  <FormLabel>{field.label}</FormLabel>
                  <Select
                    placeholder={`Select ${field.label}`}
                    value={selectValues[field.key] || ""}
                    onChange={(e) =>
                      handleSelectChange(field.key, e.target.value)
                    }
                  >
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
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
                        value={formValues["DETAILING PRODUCT"] || []}
                        onChange={(selectedRowIds) =>
                          handleInputChange("DETAILING PRODUCT", selectedRowIds)
                        }
                      >
                        <Stack direction="row" wrap="wrap">
                          {detailingProducts?.data?.map((row) => {
                            const subPartLabel = row.items.find((item) => item.key === "SUB PARTS")?.value;
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
                        {(Array.isArray(formValues[field.key]) ? formValues[field.key] : [""]).map((val, subIdx) => (
                          <Flex key={subIdx} gap={2} align="center">
                            <Input
                              value={val}
                              placeholder={`Enter ${field.label}`}
                              onChange={(e) =>
                                handleInputChange(field.key, e.target.value, subIdx)
                              }
                            />
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleRemoveArrayInput(field.key, subIdx)}
                            >
                              Remove
                            </Button>
                            {subIdx === (formValues[field.key]?.length || 1) - 1 && (
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
                          placeholder={`Select ${field.label}`}
                          value={
                            formValues[field.key] === "Others" ? "Others" : formValues[field.key] || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;

                            if (val === "Others") {
                              // keep showing input field
                              setFormValues((prev) => ({
                                ...prev,
                                [field.key]: "Others",
                                [`${field.key}_other`]: prev[`${field.key}_other`] || "",
                              }));
                            } else {
                              setFormValues((prev) => {
                                const updated = { ...prev, [field.key]: val };
                                delete updated[`${field.key}_other`];
                                return updated;
                              });
                            }
                          }}
                        >
                          {(() => {
                            const options = [...selectMatch.value];
                            const currentValue = formValues[field.key];

                            // ✅ If editing & current value not in dropdown, add it temporarily
                            if (currentValue && !options.includes(currentValue) && currentValue !== "Others") {
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
                              const customValue = formValues[`${field.key}_other`]?.trim();
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
                                dispatch(updateSelectOptions({
                                  key: field.key,
                                  value: [customValue]
                                }));
                              }
                            }}
                          />
                        )}
                      </Stack>
                    ) : DateFieldsArray.includes(field.key) ? (
                      // ✅ Date field
                      <Input
                        type="date"
                        value={formValues[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                      />
                    ) : ImageUploadArray.includes(field.key) ? (
                      // ✅ Image upload with thumbnail preview
                      <Stack spacing={3}>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              handleInputChange(field.key, { file, previewUrl });
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
                    ) : (
                      // ✅ Default input
                      <Input
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
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
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
  )
}

export default FormDialog
