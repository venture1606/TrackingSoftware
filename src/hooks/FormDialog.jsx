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
} from "@chakra-ui/react"

/**
 * mode:
 *  - "form"         → normal fields only (no graph)
 *  - "create-graph" → X/Y axis + rows (graph creation)
 *  - "edit-graph"   → edit existing series (graph editing)
 */

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
  const initialRef = useRef(null)

  // state for regular form fields
  const [formValues, setFormValues] = useState(initialData)
  const [selectValues, setSelectValues] = useState({})

  // state for graph editing
  const [graphData, setGraphData] = useState(
    graphFormArray
      ? graphFormArray.map((g) => ({
          name: g.name,
          data: g.data || [""],
        }))
      : []
  )

  // reset form values if initialData changes
  useEffect(() => {
    setFormValues(initialData)
  }, [initialData])

  useEffect(() => {
    // prefill selectValues from initialData if keys match
    if (SelectArray) {
      const initialSelects = {};
      SelectArray.forEach(field => {
        if (initialData[field.key] !== undefined) {
          initialSelects[field.key] = initialData[field.key];
        }
      });
      setSelectValues(initialSelects);
    }
  }, [initialData, SelectArray]);


  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field, value) => {
    setSelectValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleGraphChange = (seriesIndex, dataIndex, value) => {
    setGraphData((prev) =>
      prev.map((s, i) =>
        i === seriesIndex
          ? {
              ...s,
              data: s.data.map((d, j) =>
                j === dataIndex ? Number(value) : d
              ),
            }
          : s
      )
    )
  }

  const addGraphRow = () => {
    setGraphData((prev) =>
      prev.map((s) => ({
        ...s,
        data: [...s.data, ""],
      }))
    )
  }

  const handleSave = () => {
    let data

    if (mode === "edit-graph") {
      data = { ...formValues, ...selectValues, graph: graphData }
    } else if (mode === "create-graph") {
      const rows = formValues.graphRows || []
      const xValues = rows.map((r) => r.x)
      const yValues = rows.map((r) => r.y)

      data = {
        ...formValues,
        ...selectValues,
        graph: [
          { name: formValues.xAxis || "X", data: xValues },
          { name: formValues.yAxis || "Y", data: yValues },
        ],
      }
    } else {
      // mode === "form"
      data = { ...formValues, ...selectValues }
    }

    handleSubmit(data)
    onClose()
  }

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="4xl"
      maxH="70vh" overflowY="auto"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{IndicationText}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack gap="4">
            {/* ✅ Render select dropdowns */}
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

            {/* ✅ Render text inputs */}
            {FormArray &&
              FormArray.map((field, index) => (
                <FormControl key={index}>
                  <FormLabel>{field.label}</FormLabel>
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
                </FormControl>
              ))}

            {/* ✅ Graph Sections */}
            {mode === "edit-graph" && (
              <Stack>
                <FormLabel>Graph Data</FormLabel>
                {graphData[0]?.data.map((_, rowIndex) => (
                  <Flex key={rowIndex} gap={4}>
                    {graphData.map((series, seriesIndex) => (
                      <FormControl key={seriesIndex}>
                        <FormLabel>
                          {series.name} (Row {rowIndex + 1})
                        </FormLabel>
                        <Input
                          type="number"
                          value={series.data[rowIndex]}
                          onChange={(e) =>
                            handleGraphChange(
                              seriesIndex,
                              rowIndex,
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                    ))}
                  </Flex>
                ))}
                <Button mt={2} onClick={addGraphRow}>
                  + Add Row
                </Button>
              </Stack>
            )}

            {mode === "create-graph" && (
              <Stack>
                <FormControl>
                  <FormLabel>X-Axis Name</FormLabel>
                  <Input
                    placeholder="Enter X-Axis name"
                    value={formValues.xAxis || ""}
                    onChange={(e) =>
                      handleInputChange("xAxis", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Y-Axis Name</FormLabel>
                  <Input
                    placeholder="Enter Y-Axis name"
                    value={formValues.yAxis || ""}
                    onChange={(e) =>
                      handleInputChange("yAxis", e.target.value)
                    }
                  />
                </FormControl>

                <FormLabel mt={4}>Graph Data</FormLabel>
                {formValues.graphRows?.map((row, index) => (
                  <Flex key={index} gap={4}>
                    <FormControl>
                      <FormLabel>
                        {formValues.xAxis || "X"} (Row {index + 1})
                      </FormLabel>
                      <Input
                        type="number"
                        value={row.x}
                        onChange={(e) => {
                          const newRows = [...formValues.graphRows]
                          newRows[index].x = Number(e.target.value)
                          handleInputChange("graphRows", newRows)
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        {formValues.yAxis || "Y"} (Row {index + 1})
                      </FormLabel>
                      <Input
                        type="number"
                        value={row.y}
                        onChange={(e) => {
                          const newRows = [...formValues.graphRows]
                          newRows[index].y = Number(e.target.value)
                          handleInputChange("graphRows", newRows)
                        }}
                      />
                    </FormControl>
                  </Flex>
                ))}

                <Button
                  mt={2}
                  onClick={() => {
                    const newRows = formValues.graphRows
                      ? [...formValues.graphRows, { x: "", y: "" }]
                      : [{ x: "", y: "" }]
                    handleInputChange("graphRows", newRows)
                  }}
                >
                  + Add Row
                </Button>
              </Stack>
            )}
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
