import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/slices/common";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";

// Importing Api
import Auth, { useUserDetails } from "../services/Auth";
import { usePermissions } from "../services/permissions";
import { PROCESS_MAPPINGS } from "../utils/processMappings";

// Importing common components
import Loading from "../hooks/Loading";

function EditAccount() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleUpdateUser, loading } = Auth();
  const { isAdmin } = usePermissions();
  
  const { data: userToEdit, isLoading: isFetchingUser } = useUserDetails(id);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    employeeId: "",
    role: "",
    department: [],
    accessLevel: "",
    processAccess: [],
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Populate form with user details
  useEffect(() => {
    if (userToEdit) {
      setForm({
        email: userToEdit.email || "",
        password: "", // Don't show password
        name: userToEdit.name || "",
        employeeId: userToEdit.employeeId || "",
        role: userToEdit.role || "",
        department: Array.isArray(userToEdit.department)
          ? userToEdit.department
          : userToEdit.department
            ? [userToEdit.department]
            : [],
        accessLevel: userToEdit.accessLevel || "",
        processAccess: Array.isArray(userToEdit.processAccess)
          ? userToEdit.processAccess
          : userToEdit.processAccess
            ? [userToEdit.processAccess]
            : [],
      });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (deptValue) => {
    setForm((prev) => {
      const currentDepts = prev.department || [];
      const isRemoving = currentDepts.includes(deptValue);
      const newDepts = isRemoving
        ? currentDepts.filter((d) => d !== deptValue)
        : [...currentDepts, deptValue];

      // Automatically sync process access
      let newProcessAccess = [...(prev.processAccess || [])];
      const deptProcesses = PROCESS_MAPPINGS.filter(
        (p) => p.dept === deptValue,
      ).map((p) => p.id);

      if (isRemoving) {
        // Remove all processes belonging to this department
        newProcessAccess = newProcessAccess.filter(
          (pid) => !deptProcesses.includes(pid),
        );
      } else {
        // Add all processes belonging to this department
        newProcessAccess = Array.from(
          new Set([...newProcessAccess, ...deptProcesses]),
        );
      }

      return { ...prev, department: newDepts, processAccess: newProcessAccess };
    });
  };

  const handleProcessChange = (processId) => {
    setForm((prev) => {
      const currentAccess = prev.processAccess || [];
      const newAccess = currentAccess.includes(processId)
        ? currentAccess.filter((id) => id !== processId)
        : [...currentAccess, processId];
      return { ...prev, processAccess: newAccess };
    });
  };

  const allPossibleDepts = [
    "design",
    "quality",
    "production",
    "sales",
    "purchase",
    "maintainance",
    "stores",
    "hr",
  ];

  const deptCheckboxes = [
    { value: "design", label: "Design and Development" },
    { value: "quality", label: "Quality Assurance" },
    { value: "production", label: "Production Management" },
    { value: "sales", label: "Sales & Marketing" },
    { value: "purchase", label: "Procurement & Stores" },
    { value: "maintainance", label: "Facility Management" },
    { value: "stores", label: "Stores Management" },
    { value: "hr", label: "Human Resources" },
  ];

  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    if (!form.email.toLowerCase().endsWith("@adlhre.com")) {
      dispatch(
        setMessage({
          status: "error",
          description: "Please use a valid company email address (@adlhre.com)",
          message: "Invalid Domain",
        }),
      );
      return;
    }

    if (form.department.length === 0 || !form.accessLevel) {
      dispatch(
        setMessage({
          status: "error",
          description:
            "Please select at least one Department and an Access Level",
          message: "Missing Fields",
        }),
      );
      return;
    }

    const success = await handleUpdateUser(id, form);
    if (success) {
      // Invalidate queries to refresh the user list and current user details
      queryClient.invalidateQueries(["allUsers"]);
      queryClient.invalidateQueries(["userDetails", id]);
      navigate("/admin"); 
    }
  };

  if (loading || isFetchingUser) return <Loading />;
  if (!isAdmin) return null;

  return (
    <div className="AppRightContainer">
      <Box p={6} maxW="1200px" mx="auto">
        <VStack align="flex-start" spacing={1} mb={8}>
          <Heading size="lg" color="brand.900" fontWeight="800">
            User Management
          </Heading>
          <Text color={subTextColor}>
            Administrative portal to update and modify existing system users.
          </Text>
        </VStack>

        <Box
          bg={bgColor}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          overflow="hidden"
        >
          <Box
            p={6}
            borderBottom="1px solid"
            borderColor={borderColor}
            bg="gray.50"
          >
            <HStack spacing={4}>
              <Icon
                icon="mdi:account-edit"
                fontSize="24px"
                color="var(--primary-color)"
              />
              <Heading size="md">Edit User Account: {userToEdit?.name}</Heading>
            </HStack>
          </Box>

          <form onSubmit={handleUpdateAccount}>
            <VStack spacing={8} p={8} align="stretch">
              {/* Personal Information */}
              <VStack align="stretch" spacing={4}>
                <Heading
                  size="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="gray.500"
                >
                  Authentication & Identity
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Full Name</FormLabel>
                    <Input
                      name="name"
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={handleChange}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Business Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      placeholder="user@adlhre.com"
                      value={form.email}
                      onChange={handleChange}
                      borderRadius="lg"
                      isReadOnly
                      bg="gray.50"
                      cursor="not-allowed"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600">New Password (Optional)</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Leave blank to keep current"
                      value={form.password}
                      onChange={handleChange}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Employee ID</FormLabel>
                    <Input
                      name="employeeId"
                      placeholder="ADL-XXX"
                      value={form.employeeId}
                      onChange={handleChange}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600">
                      Professional Designation
                    </FormLabel>
                    <Input
                      name="role"
                      placeholder="e.g. Production Manager"
                      value={form.role}
                      onChange={handleChange}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600">
                      System Authorization Level
                    </FormLabel>
                    <Select
                      name="accessLevel"
                      placeholder="Select Level"
                      value={form.accessLevel}
                      onChange={handleChange}
                      borderRadius="lg"
                    >
                      <option value="read">
                        Review & Insight (Read Access)
                      </option>
                      <option value="create">
                        Operational Contributor (Creating Access)
                      </option>
                      <option value="edit">
                        Operational Controller (Editing Access)
                      </option>
                      <option value="admin">
                        Administrative Management (Full Access)
                      </option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>

              <Divider />

              {/* Departmental Access */}
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                  <Heading
                    size="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="gray.500"
                  >
                    Departmental Scope Authorization
                  </Heading>
                  <Checkbox
                    isChecked={
                      form.department.length === allPossibleDepts.length
                    }
                    isIndeterminate={
                      form.department.length > 0 &&
                      form.department.length < allPossibleDepts.length
                    }
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        department: isChecked ? allPossibleDepts : [],
                        processAccess: isChecked
                          ? PROCESS_MAPPINGS.map((p) => p.id)
                          : [],
                      }));
                    }}
                    colorScheme="blue"
                  >
                    Select All Departments
                  </Checkbox>
                </Flex>

                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="xl"
                  border="1px dashed"
                  borderColor="gray.200"
                >
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                    {deptCheckboxes.map((dept) => (
                      <Checkbox
                        key={dept.value}
                        isChecked={form.department.includes(dept.value)}
                        onChange={() => handleDepartmentChange(dept.value)}
                        colorScheme="blue"
                      >
                        <Text fontSize="sm" fontWeight="600">
                          {dept.label}
                        </Text>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>

              <Divider />

              {/* Process Access */}
              <VStack align="stretch" spacing={6}>
                <Heading
                  size="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="gray.500"
                >
                  Process Specific Authorization
                </Heading>

                {deptCheckboxes
                  .filter((dept) => form.department.includes(dept.value))
                  .map((dept) => {
                    const deptProcesses = PROCESS_MAPPINGS.filter(
                      (p) => p.dept === dept.value,
                    );
                    if (deptProcesses.length === 0) return null;

                    return (
                      <Box
                        key={dept.value}
                        p={5}
                        bg="white"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.100"
                      >
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="xs" color="blue.600">
                              {dept.label} Processes
                            </Heading>
                            <Checkbox
                              size="sm"
                              isChecked={deptProcesses.every((p) =>
                                form.processAccess.includes(p.id),
                              )}
                              isIndeterminate={
                                deptProcesses.some((p) =>
                                  form.processAccess.includes(p.id),
                                ) &&
                                !deptProcesses.every((p) =>
                                  form.processAccess.includes(p.id),
                                )
                              }
                              onChange={(e) => {
                                const ids = deptProcesses.map((p) => p.id);
                                setForm((prev) => {
                                  let newAccess = [...prev.processAccess];
                                  if (e.target.checked) {
                                    newAccess = Array.from(
                                      new Set([...newAccess, ...ids]),
                                    );
                                  } else {
                                    newAccess = newAccess.filter(
                                      (id) => !ids.includes(id),
                                    );
                                  }
                                  return { ...prev, processAccess: newAccess };
                                });
                              }}
                            >
                              Select All {dept.label}
                            </Checkbox>
                          </HStack>
                          <Divider />
                          <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={3}
                          >
                            {deptProcesses.map((process) => (
                              <Checkbox
                                key={process.id}
                                isChecked={form.processAccess.includes(
                                  process.id,
                                )}
                                onChange={() => handleProcessChange(process.id)}
                                colorScheme="green"
                                size="sm"
                              >
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="xs" fontWeight="700">
                                    {process.p}
                                  </Text>
                                  <Text fontSize="10px" color="gray.500">
                                    {process.id}
                                  </Text>
                                </VStack>
                              </Checkbox>
                            ))}
                          </SimpleGrid>
                        </VStack>
                      </Box>
                    );
                  })}

                {form.department.length === 0 && (
                  <Box
                    p={8}
                    textAlign="center"
                    bg="gray.50"
                    borderRadius="xl"
                    border="1px dashed"
                    borderColor="gray.200"
                  >
                    <Icon
                      icon="mdi:lock-outline"
                      fontSize="32px"
                      style={{ margin: "0 auto", color: "#CBD5E0" }}
                    />
                    <Text mt={2} color="gray.500" fontSize="sm">
                      Select departments above to configure specific process
                      access
                    </Text>
                  </Box>
                )}
              </VStack>

              <Flex justify="flex-end" pt={4} gap={4}>
                <Button
                  size="lg"
                  variant="ghost"
                  px={12}
                  borderRadius="xl"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  colorScheme="blue"
                  px={12}
                  borderRadius="xl"
                  leftIcon={<Icon icon="mdi:account-check" />}
                  boxShadow="lg"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  transition="all 0.2s"
                >
                  Update Account Details
                </Button>
              </Flex>
            </VStack>
          </form>
        </Box>
      </Box>
    </div>
  );
}

export default EditAccount;
