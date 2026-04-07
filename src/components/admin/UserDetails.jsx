import React, { useMemo, useState } from "react";
import {
  Box,
  Spinner,
  Flex,
  Text,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useQueryClient } from "@tanstack/react-query";

import { useAllUsers } from "../../services/Auth";
import AdminTableView from "../../hooks/AdminTableView";
import { usePermissions } from "../../services/permissions";
import Auth from "../../services/Auth";
import ConfirmDialog from "../ConfirmDialog";

const UserDetails = () => {
  const queryClient = useQueryClient();
  const { data: allUsers, isLoading } = useAllUsers();
  const { isAdmin: currentUserIsAdmin } = usePermissions();
  const { handleDeleteUser } = Auth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState(null);

  const onDeleteClick = (email) => {
    setUserToDelete(email);
    onOpen();
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      const success = await handleDeleteUser(userToDelete);
      if (success) {
        queryClient.invalidateQueries(["allUsers"]);
      }
    }
    onClose();
  };

  const formattedUsers = useMemo(() => {
    if (!Array.isArray(allUsers) || allUsers.length === 0) return [];

    return allUsers.map((user, index) => {
      const deptLabels = {
        design: "Design & Development",
        quality: "Quality Assurance",
        production: "Manufacturing",
        sales: "Sales",
        purchase: "Procurement",
        maintainance: "Maintenance",
        stores: "Stores Management",
        hr: "Human Resources",
      };

      const departments = Array.isArray(user.department)
        ? user.department
            .map((d) => deptLabels[d.toLowerCase()] || d)
            .join(", ")
        : user.department || "-";

      const accessLabel = user.accessLevel
        ? user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1)
        : "-";

      const showDelete = currentUserIsAdmin && user.accessLevel !== "admin";

      return [
        { key: "SL.NO", value: index + 1 || "-" },
        { key: "FULL NAME", value: user.name || "-" },
        { key: "EMPLOYEE ID", value: user.employeeId || "-" },
        { key: "ROLE", value: user.role || "-" },
        { key: "EMAIL", value: user.email || "-" },
        { key: "DEPARTMENTS", value: departments },
        { key: "ACCESS LEVEL", value: accessLabel },
        {
          key: "DATE",
          value: user.date ? new Date(user.date).toLocaleDateString() : "-",
        },
        {
          key: "ACTIONS",
          value: showDelete ? (
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteClick(user.email)}
              aria-label="Delete User"
            />
          ) : (
            "-"
          ),
        },
      ];
    });
  }, [allUsers, currentUserIsAdmin]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!formattedUsers.length) {
    return <Text p={4}>No users found.</Text>;
  }

  return (
    <Box w="100%">
      <AdminTableView DetailsArray={formattedUsers} TableContent={"users"} />
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for ${userToDelete}? This action cannot be undone.`}
      />
    </Box>
  );
};

export default UserDetails;
