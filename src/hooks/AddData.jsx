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
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";

import ItemsData from "../utils/ItemsData";

function AddData({
  IndicationText = "Add Data",
  headers = [],
  isOpen,
  onClose,
  onSave,
}) {
  const { DefaultHeaderAndProcessId } = ItemsData;
  const initialRef = useRef(null);

  const [formData, setFormData] = useState([]);

  // Initialize formData whenever headers change
  useEffect(() => {
    const mappedData = headers.map((key) => {
      const match = DefaultHeaderAndProcessId.find(
        (item) => item.tableHeader === key
      );

      if (match) {
        return { key, value: match.processId, process: "processId" };
      }
      return { key, value: "", process: "value" };
    });

    setFormData(mappedData);
  }, [headers, DefaultHeaderAndProcessId]);

  const handleValueChange = (index, val) => {
    const newData = [...formData];
    newData[index].value = val;
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
        <ModalBody pb={4}>
          <Stack spacing={4}>
            {formData.map((field, idx) => (
              <Flex key={idx} gap={3} align="center">
                {/* Key column */}
                <Input
                  value={field.key}
                  isReadOnly
                  width="200px"
                  placeholder="Key"
                />

                {/* If processId → show read-only text, else → editable input */}
                {field.process === "processId" ? (
                  <Input
                    value={field.value}
                    isReadOnly
                    placeholder="ProcessId"
                  />
                ) : (
                  <Input
                    ref={idx === 0 ? initialRef : null}
                    value={field.value}
                    placeholder="Value"
                    onChange={(e) => handleValueChange(idx, e.target.value)}
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
