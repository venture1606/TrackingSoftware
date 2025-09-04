import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import FormPage from "./FormPage";
import Loading from "../hooks/Loading";

function SubProcess({ isOpen, onClose, data, loading }) {
  if (!data?.nestedProcess) return null;

  // Transform the nested process for FormPage
  const nested = {
    process: data.nestedProcess.process,
    header: data.nestedProcess.headers,
    value: data.nestedProcess.data.map((row) =>
      row.items.map((cell) => ({
        key: cell.key,
        value: cell.value,
        process: cell.process || null,
      }))
    ),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{nested.process}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Render nested process table */}
          {loading 
            ? <Loading /> : 
            <FormPage process={nested} />
          }
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default SubProcess;
