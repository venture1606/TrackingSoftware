import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/slices/common";
import { setGroupItem, setSelectOptionsArray } from "../redux/slices/auth";

const URL = process.env.REACT_APP_PROCESS_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const useAllProcesses = (enabled = true) => {
  return useQuery({
    queryKey: ["allProcesses"],
    queryFn: async () => {
      const response = await axios.get(`${URL}/all`, getAuthHeaders());
      return response.data.data;
    },
    enabled,
    onError: (error) => console.log(error),
  });
};

export const useProcessById = (id) => {
  return useQuery({
    queryKey: ["process", id],
    queryFn: async () => {
      const response = await axios.get(`${URL}/${id}`, getAuthHeaders());
      return response.data.data;
    },
    enabled: !!id,
    onError: (error) => console.log(error),
  });
};

export const useProcessesByDepartmentId = (departmentId) => {
  return useQuery({
    queryKey: ["processesByDepartment", departmentId],
    queryFn: async () => {
      const response = await axios.get(
        `${URL}/department/${departmentId}`,
        getAuthHeaders(),
      );
      return response.data.data;
    },
    enabled: !!departmentId,
    onError: (error) => console.log(error),
  });
};

export const useSearchSelectOptions = () => {
  const dispatch = useDispatch();

  // This one is a bit different as it dispatches to redux store for global options.
  // We can treat it as a query that updates redux on success.
  return useQuery({
    queryKey: ["searchSelectOptions"],
    queryFn: async () => {
      const response = await axios.get(`${URL}/search`, getAuthHeaders());
      return response.data;
    },
    onSuccess: (data) => {
      const dynamicOptions = data.data; // [{ key: 'partNo', value: [...] }, ...]
      dispatch(
        setGroupItem({
          groupOfItems: data.groupOfItems,
          groupOfItemList: data.groupOfItemList,
          groupOfVendorList: data.groupOfVendorList,
          groupOfCustomerList: data.groupOfCustomerList,
        }),
      );

      // Hardcoded array logic from original file
      const selectOptionsArray = [
        { key: "MOVE TO", value: ["Scrap", "Rework"] },
        { key: "ACTION PLAN STATUS", value: ["OPEN", "CLOSED"] },
        { key: "ACTION TAKEN", value: ["YES", "NO"] },
        {
          key: "RM",
          value: ["Planning", "In Progress", "Pending", "Completed"],
        },
        {
          key: "INCOMING INSPECTION",
          value: ["In Progress", "Pending", "Completed"],
        },
        { key: "MACHINE", value: ["In Progress", "Pending", "Completed"] },
        { key: "OUT PROCESS", value: ["In Progress", "Pending", "Completed"] },
        { key: "ASSEMBLY", value: ["In Progress", "Pending", "Completed"] },
        {
          key: "PR-STATUS",
          value: ["Under Process", "Completed", "Next Setting"],
        },
        { key: "CALIBRATION", value: ["DONE", "DUE"] },
        { key: "INSTRUMENTS-STATUS", value: ["Active", "Not Using"] },
        { key: "INSPECTION-STATUS", value: ["Pending", "Done"] },
        { key: "DIMENSION", value: ["Okay", "Not Okay"] },
        { key: "DEFECT FOUND", value: ["Yes", "No"] },
        { key: "SHORT QUANITY", value: ["Yes", "No"] },
        { key: "ITEM CHANGED", value: ["Yes", "No"] },
        { key: "REPORT RECEIVED", value: ["Yes", "No"] },
        { key: "CCR STATUS", value: ["OPEN", "CLOSED"] },
        {
          key: "STATUS OF SETTINGS",
          value: ["No", "Under Process", "Completed"],
        },
        {
          key: "QL STATUS",
          value: ["WAITING FOR QUOTE", "WAITING FOR ORDER", "ORDER"],
        },
        { key: "PSR STATUS", value: ["OPEN", "CLOSED"] },
        {
          key: "TRIAL STATUS",
          value: ["WAITING FOR ORDER", "ORDER CONFIRMED", "PRODUCT FAILED"],
        },
        { key: "PR STATUS", value: ["PENDING", "CLOSED"] },
        {
          key: "QC QUALITY INSPECTION",
          value: ["Move to Inspection", "Inspection Done"],
        },
        { key: "PAYMENT", value: ["OPEN", "CLOSED"] },
        { key: "CR STATUS", value: ["OPEN", "CLOSED"] },
        {
          key: "NPD STATUS",
          value: [
            "Not Feasible",
            "Waiting For Order",
            "Order Confirmed",
            "Under Process",
            "Supplied to Customer",
          ],
        },
        {
          key: "ITEM CATEGORY",
          value: [
            "RAW MATERIAL",
            "FINISHED GOOD",
            "SEAL",
            "BALL",
            "INTERNAL SPRING",
            "EXTERNAL SPRING",
          ],
        },
      ];

      dynamicOptions.forEach((dynamicItem) => {
        if (!dynamicItem.value.includes("Others")) {
          dynamicItem.value.push("Others");
        }
        const existing = selectOptionsArray.find(
          (opt) => opt.key.toLowerCase() === dynamicItem.key.toLowerCase(),
        );
        if (existing) {
          dynamicItem.value.forEach((val) => {
            if (!existing.value.includes(val)) {
              existing.value.push(val);
            }
          });
        } else {
          selectOptionsArray.push(dynamicItem);
        }
      });

      dispatch(setSelectOptionsArray(selectOptionsArray));
    },
    refetchOnWindowFocus: false,
  });
};

export const useAddProcessData = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, id, rowDataId }) => {
      let hasFile = items.some((item) => item.value instanceof File);
      let response;
      if (hasFile) {
        const formData = new FormData();
        if (rowDataId) formData.append("rowDataId", rowDataId);

        const itemsForJson = items.map((item) => {
          if (item.value instanceof File) {
            formData.append(item.key, item.value);
            return { ...item, value: "" };
          }
          return item;
        });

        formData.append("items", JSON.stringify(itemsForJson));

        response = await axios.post(`${URL}/data/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const payload = { items, rowDataId };
        response = await axios.post(
          `${URL}/data/${id}`,
          payload,
          getAuthHeaders(),
        );
      }
      return response.data.process;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["process", variables.id]);
      dispatch(
        setMessage({
          status: "success",
          description: "Data added successfully",
          message: "Added",
        }),
      );
    },
    onError: (error) => {
      dispatch(
        setMessage({
          status: "error",
          description: "Failed to add data.",
          message: error.message,
        }),
      );
    },
  });
};

export const useUpdateProcessData = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rowId, items, id }) => {
      const hasFile = items.some((item) => item.value instanceof File);
      let response;
      if (hasFile) {
        const formData = new FormData();
        formData.append("rowId", rowId);
        const itemsForJson = items.map((item) => {
          if (item.value instanceof File) {
            formData.append(item.key, item.value);
            return { ...item, value: "" };
          }
          return item;
        });
        formData.append("items", JSON.stringify(itemsForJson));
        response = await axios.put(`${URL}/data/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const payload = { items, rowId };
        response = await axios.put(
          `${URL}/data/${id}`,
          payload,
          getAuthHeaders(),
        );
      }
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["process", variables.id]);
    },
    onError: (error) => {
      dispatch(
        setMessage({
          status: "error",
          description: "Failed to update data.",
          message: error.message,
        }),
      );
    },
  });
};

export const useDeleteProcessData = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rowId, id, userId }) => {
      const response = await axios.delete(`${URL}/data/${id}`, {
        data: { rowId, userId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["process", variables.id]);
      dispatch(
        setMessage({
          status: "success",
          description: "Data deleted successfully",
          message: "Deleted",
        }),
      );
    },
    onError: (error) => {
      dispatch(
        setMessage({
          status: "error",
          description: "Failed to delete data.",
          message: error.message,
        }),
      );
    },
  });
};

// Default export acting as a hook for backward compatibility if needed,
// though we encourage using individual hooks.
function Process() {
  const addMutation = useAddProcessData();
  const updateMutation = useUpdateProcessData();
  const deleteMutation = useDeleteProcessData();

  const handleGetSingleProcess = async (id) => {
    try {
      const response = await axios.get(`${URL}/${id}`, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      console.error("Error fetching single process:", error);
      throw error;
    }
  };

  return {
    handleAddData: addMutation.mutateAsync,
    handleUpdateData: updateMutation.mutateAsync,
    handleDeleteData: deleteMutation.mutateAsync,
    handleGetSingleProcess,
    loading:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}

export default Process;
