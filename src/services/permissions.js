import { useSelector } from "react-redux";
import { useMemo } from "react";

/** Shared copy for disabled action buttons when the user lacks access. */
export const ACCESS_DENIED_TOOLTIP =
  "Not accessible. Ask admin for permission.";

/**
 * Build a short reason for why an action is blocked.
 * @param {{ hasProcessAccess?: boolean, isViewer?: boolean, isView?: boolean, action?: string }} opts
 */
export const getAccessDeniedReason = ({
  hasProcessAccess = true,
  isViewer = false,
  isView = false,
  action = "",
} = {}) => {
  if (!hasProcessAccess) {
    return "No access to this process. Ask admin for permission.";
  }
  if (isViewer || isView) {
    return "Read-only access. Ask admin for permission.";
  }
  if (action === "edit" || action === "delete") {
    return "Your access level cannot edit this. Ask admin for permission.";
  }
  if (action === "create") {
    return "Your access level cannot create records. Ask admin for permission.";
  }
  return ACCESS_DENIED_TOOLTIP;
};

/**
 * Custom hook to manage and provide user permissions and accessibility.
 * Extracts data from the Redux auth state (synchronized with localStorage).
 */
export const usePermissions = () => {
  const user = useSelector((state) => state.auth.userDetails);

  return useMemo(() => {
    // Basic flags based on accessLevel
    const isEditor = user?.accessLevel === "edit";
    const isCreator = user?.accessLevel === "create";
    const isViewer = user?.accessLevel === "read";
    const isAdmin = user?.accessLevel === "admin";

    // Accessible departments (stored as an array in the user object)
    const accessibleDepartments = Array.isArray(user?.department)
      ? user.department
      : user?.department
        ? [user.department]
        : [];

    // Accessible processes
    const accessibleProcesses = Array.isArray(user?.processAccess)
      ? user.processAccess
      : [];

    /**
     * Helper to check if a specific department is accessible to the user
     * @param {string} departmentName - The key of the department (e.g., 'design')
     * @returns {boolean}
     */
    const hasAccessToDepartment = (departmentName) => {
      if (!departmentName) return false;
      const normalizedName = departmentName.toLowerCase();

      // Check for direct match or alias matches
      return accessibleDepartments.some((userDept) => {
        const normalizedUserDept = userDept.toLowerCase();
        return (
          normalizedUserDept === normalizedName ||
          (normalizedUserDept === "production" &&
            normalizedName === "manufacturing") ||
          (normalizedUserDept === "maintainance" &&
            normalizedName === "maintenance") ||
          (normalizedUserDept === "hr" && normalizedName === "human resources")
        );
      });
    };

    /**
     * Helper to check if a specific process is accessible to the user
     * @param {string} processId - The ID of the process (e.g., 'DD/R/010')
     * @returns {boolean}
     */
    const hasAccessToProcess = (processId) => {
      if (isAdmin) return true;
      if (!processId) return false;
      return accessibleProcesses.includes(processId);
    };

    /**
     * Helper to check if the user has a specific action permission
     * @param {string} action - 'edit', 'create', or 'read'
     * @returns {boolean}
     */
    const hasPermission = (action) => {
      if (isAdmin || isEditor) return true; // Admins and Editors have full access
      if (action === "create" && (isCreator || isEditor)) return true;
      if (action === "read") return true; // Everyone should have read access if logged in
      return false;
    };

    return {
      isEditor,
      isCreator,
      isViewer,
      isAdmin,
      accessibleDepartments,
      accessibleProcesses,
      hasAccessToDepartment,
      hasAccessToProcess,
      hasPermission,
      user,
    };
  }, [user]);
};

export default usePermissions;
