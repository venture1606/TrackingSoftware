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

function FormDialog({
  IndicationText,
  FormArray,
  SelectArray,
  graphFormArray,
  handleSubmit,
  isOpen,          // ✅ controlled by parent
  onClose,         // ✅ controlled by parent
  initialData = {},// ✅ pre-fill values
}) {
  const initialRef = useRef(null)

  // state for regular form fields
  const [formValues, setFormValues] = useState(initialData)
  const [selectValues, setSelectValues] = useState({})

  const [graphData, setGraphData] = useState(
    graphFormArray
      ? graphFormArray.map((g) => ({
          name: g.name,
          data: g.data || [""], // default one row
        }))
      : []
  )

  // whenever initialData changes, reset form values
  useEffect(() => {
    setFormValues(initialData)
  }, [initialData])

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
    const data = {
      ...formValues,
      ...selectValues,
      graph: graphData,
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
                      <option key={i} value={option.toLowerCase()}>
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
                    disabled={formValues[field.key].startsWith("processId -")}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                  />
                </FormControl>
              ))}

            {/* ✅ Graph data entry table */}
            {graphData.length > 0 && (
              <Stack>
                <FormLabel>Graph Data</FormLabel>
                {graphData[0].data.map((_, rowIndex) => (
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
