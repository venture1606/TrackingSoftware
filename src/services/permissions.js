import { useSelector } from "react-redux";
import { useMemo } from "react";

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
      hasAccessToDepartment,
      hasPermission,
      user,
    };
  }, [user]);
};

export default usePermissions;
