import React, { useRef, useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  Box,
  Progress,
} from "@chakra-ui/react";

const SecureConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  colorScheme = "blue",
  holdTime = 5,
}) => {
  const cancelRef = useRef();
  const [secondsLeft, setSecondsLeft] = useState(holdTime);

  useEffect(() => {
    let timer;
    if (isOpen && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  // Reset timer when dialog closes/opens
  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(holdTime);
    }
  }, [isOpen, holdTime]);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay backdropFilter="blur(4px)">
        <AlertDialogContent borderRadius="2xl" mx={4} p={1}>
          <AlertDialogHeader fontSize="xl" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mb={4}>{message}</Text>
            {secondsLeft > 0 && (
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Confirm button will enable in {secondsLeft} seconds...
                </Text>
                <Progress
                  value={((holdTime - secondsLeft) / holdTime) * 100}
                  size="xs"
                  colorScheme={colorScheme}
                  borderRadius="full"
                />
              </Box>
            )}
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              borderRadius="lg"
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={colorScheme}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              isDisabled={secondsLeft > 0}
              borderRadius="lg"
              px={8}
              transition="all 0.2s"
              _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default SecureConfirmDialog;
