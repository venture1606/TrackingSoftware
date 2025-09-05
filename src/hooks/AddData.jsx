import React, { useRef, useState, useEffect } from "react";
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
  Select,
  Flex,
  Stack,
} from "@chakra-ui/react";

function AddData({ IndicationText = "Add Data", headers = [], isOpen, onClose, onSave }) {
  const initialRef = useRef(null);

  // initialize state whenever headers change
  const [formData, setFormData] = useState([]);

  useEffect(() => {
    setFormData(headers.map((key) => ({ key, value: "", process: "value" })));
  }, [headers]);

  const handleValueChange = (index, val) => {
    const newData = [...formData];
    newData[index].value = val;
    setFormData(newData);
  };

  const handleProcessChange = (index, val) => {
    const newData = [...formData];
    newData[index].process = val;
    setFormData(newData);
  };

  const handleSave = () => {
    onSave && onSave(formData);
    onClose();
  };

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
          <Stack spacing={4}>
            {formData.map((field, idx) => (
              <Flex key={idx} gap={2} align="center">
                <Input
                  value={field.key}
                  isReadOnly
                  width="150px"
                  placeholder="Key"
                />
                <Input
                  ref={idx === 0 ? initialRef : null}
                  value={field.value}
                  placeholder={`${field.process === "value" ? "Value" : "Type the processId"}`}
                  onChange={(e) => handleValueChange(idx, e.target.value)}
                />
                <Select
                  value={field.process}
                  onChange={(e) => handleProcessChange(idx, e.target.value)}
                  width="150px"
                >
                  <option value="value">Value</option>
                  <option value="processId">Process</option>
                </Select>
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
