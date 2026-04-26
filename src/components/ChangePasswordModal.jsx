import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  CircularProgress,
  CircularProgressLabel,
  Box,
} from "@chakra-ui/react";
import Auth from "../services/Auth";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { handleUpdatePassword } = Auth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCountingDown(true);
  };

  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      performPasswordChange();
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  const performPasswordChange = async () => {
    setIsLoading(true);
    const success = await handleUpdatePassword(formData);
    setIsLoading(false);
    if (success) {
      onClose();
      // Reset state
      setFormData({ oldPassword: "", password: "", confirmPassword: "" });
      setCountdown(10);
    } else {
      // Allow retry
      setCountdown(10);
    }
  };

  const handleModalClose = () => {
    if (!isCountingDown && !isLoading) {
      onClose();
      setFormData({ oldPassword: "", password: "", confirmPassword: "" });
      setCountdown(10);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" p={2}>
        <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
          Change Password
        </ModalHeader>
        <ModalCloseButton isDisabled={isCountingDown || isLoading} />
        <ModalBody>
          {isCountingDown || isLoading ? (
            <VStack spacing={6} py={8} textAlign="center">
              <Box position="relative">
                <CircularProgress
                  value={(countdown / 10) * 100}
                  color="blue.400"
                  size="120px"
                  thickness="8px"
                  capIsRound
                >
                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                    {isLoading ? "..." : countdown}
                  </CircularProgressLabel>
                </CircularProgress>
              </Box>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="semibold" color="blue.600">
                  {isLoading ? "Updating Security Credentials..." : "Securing Your Account"}
                </Text>
                <Text color="gray.500">
                  Please wait while we prepare to update your password. This ensures a secure session transition.
                </Text>
              </VStack>
              <Text fontSize="sm" fontStyle="italic" color="orange.400">
                Note: Password gonna change in a few moments.
              </Text>
            </VStack>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Previous Password</FormLabel>
                  <Input
                    name="oldPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    borderRadius="lg"
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  mt={4}
                  size="lg"
                  borderRadius="lg"
                >
                  Update Password
                </Button>
              </VStack>
            </form>
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
