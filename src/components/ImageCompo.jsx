import React, { useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Text,
} from "@chakra-ui/react";

const ImageCompo = ({ imageUrl, onClose }) => {
  const isFileObject = useMemo(() => 
    typeof imageUrl === "object" && imageUrl instanceof File, 
    [imageUrl]
  );

  const imageSrc = useMemo(() => {
    if (!imageUrl) return null;
    return isFileObject ? URL.createObjectURL(imageUrl) : imageUrl;
  }, [imageUrl, isFileObject]);

  const handleClose = () => {
    if (isFileObject && imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    onClose();
  };

  if (!imageUrl) return null;

  return (
    <Modal isOpen={!!imageUrl} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader fontSize="md" fontWeight="bold" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
          Uploaded Image
        </ModalHeader>
        <ModalCloseButton top={3} />
        <ModalBody p={6} display="flex" justifyContent="center" alignItems="center">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="Uploaded Preview"
              borderRadius="lg"
              maxH="70vh"
              objectFit="contain"
              boxShadow="lg"
            />
          ) : (
            <Text color="gray.500">Please reload to see the image</Text>
          )}
        </ModalBody>
        <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" gap={3}>
          <Button size="sm" colorScheme="blue" onClick={handleClose} borderRadius="lg">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageCompo;
