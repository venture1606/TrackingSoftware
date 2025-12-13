import React, { useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'

import { setMessage } from '../redux/slices/common';
import { 
    setAllProcesses, 
    setSelectOptionsArray,
    updateProcessInStore,  // New
    setDetailingProducts   // For refreshing active view
} from '../redux/slices/department';
import { setSelectOptionsArray as setAuthSelectOptions } from '../redux/slices/auth';

function Process() {

    const URL = 'https://adl-server.onrender.com/api/v1/process';
    // const URL = 'http://localhost:3008/api/v1/process';

    const allProcesses = useSelector((state) => state.department.allProcesses);

    const [ loading, setLoading ] = useState(false);
    const dispatch = useDispatch();

    const handlegetAllProcess = async () => {
        setLoading(true);
        if (allProcesses.length > 0) return;
        try {
            const response = await axios.get(`${URL}/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            dispatch(setAllProcesses(response.data.data));
            
            dispatch(setMessage({
                status: 'success',
                description: 'Process fetched successfully',
                message: 'Fetched'
            }))

        } catch (error) {
            console.log(error);
            dispatch(setMessage({
                status: 'error',
                description: 'Process fetch failed',
                message: 'Error'
            }))
        } finally {
            setLoading(false);
        }
    }

    const handleGetSingleProcess = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });
            return response.data.data;

        } catch (error) {
            console.log(error);
            dispatch(setMessage({
                status: 'error',
                description: 'Process fetch failed',
                message: 'Error'
            }))
        } finally {
            setLoading(false);
        }
    }

    const handleGetProcessbyDepartmentId = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/department/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });

            return response.data.data;

        } catch (error) {
            console.log(error);
            dispatch(setMessage({
                status: 'error',
                description: 'Process fetch failed',
                message: 'Error'
            }))
        } finally {
            setLoading(false);
        }
    }

    const handleAddData = async ({ items, id, rowDataId }) => {
    setLoading(true);
    try {
        let hasFile = items.some((item) => item.value instanceof File);

        let response;
        if (hasFile) {
            const formData = new FormData();
            if (rowDataId) formData.append("rowDataId", rowDataId);

            // Separate files & JSON
            const itemsForJson = items.map((item) => {
                if (item.value instanceof File) {
                formData.append(item.key, item.value); // send file
                return { ...item, value: "" }; // placeholder for backend
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
            response = await axios.post(`${URL}/data/${id}`, payload, {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
        }

        // ✅ Optimistic Redux Update
        if (response.data.process) {
            dispatch(updateProcessInStore(response.data.process));
        }

        return response.data.process;
    } catch (error) {
        console.error("Error adding data:", error);
        dispatch(
        setMessage({
            status: "error",
            description: "Failed to add data.",
            message: error.message,
        })
        );
    } finally {
        setLoading(false);
    }
    };

    const handleUpdateData = async ({ rowId, items, id }) => {
    setLoading(true);
    try {
        // Check if any field contains a File (for image upload)
        const hasFile = items.some((item) => item.value instanceof File);

        let response;
        if (hasFile) {
        // Build FormData for multipart upload
        const formData = new FormData();
        formData.append("rowId", rowId);

        // Separate items: append files directly, keep others for JSON
        const itemsForJson = items.map((item) => {
            if (item.value instanceof File) {
            formData.append(item.key, item.value); // send file separately
            return { ...item, value: "" };         // backend will replace with Cloudinary URL
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
        // Normal JSON payload (no files)
        const payload = { items, rowId };
        response = await axios.put(`${URL}/data/${id}`, payload, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        }

        // ✅ Optimistic Redux Update
        if (response.data.data) {
             dispatch(updateProcessInStore(response.data.data));
        }

        return response.data.data;
    } catch (error) {
        console.error("Error updating data:", error);
        dispatch(
        setMessage({
            status: "error",
            description: "Failed to update data.",
            message: error.message,
        })
        );
    } finally {
        setLoading(false);
    }
    };

    const handleDeleteData = async ({ rowId, id }) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${URL}/data/${id}`, {
                data: { rowId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // For delete, we might need to re-fetch to get clean state OR manually filter Redux
            // Since we don't have the full process returned here typically, 
            // the 'updateProcessInStore' might be hard to cleaner call without fetching.
            // But we can rely on handleRefreshData if the user calls it.

            dispatch(setMessage({
                status: 'success',
                description: 'Data deleted successfully',
                message: 'Deleted'
            }));

        } catch (error) {
            console.error("Error deleting data:", error);
            dispatch(setMessage({
                status: 'error',
                description: 'Failed to delete data.',
                message: error.message
            }));
        } finally {
            setLoading(false);
        }
    }

    // ✅ New: Robust Refresh Function
    const handleRefreshData = async (id) => {
        setLoading(true);
        try {
             // 1. Fetch fresh data
             const data = await handleGetSingleProcess(id);
             
             // 2. Update Redux List Cache
             dispatch(updateProcessInStore(data));
             
             // 3. Update Active View (if applicable)
             // We can return data so caller updates local state
             return data;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSelectOptions = async () => {
        const response = await axios.get(`${URL}/search`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dynamicOptions = response.data.data; // [{ key: 'partNo', value: [...] }, ...]

        // Your existing hardcoded array
        const selectOptionsArray = [
            { key: "MOVE TO", value: ["Scrap", "Rework"] },
            { key: "ACTION PLAN STATUS", value: ["OPEN", "CLOSED"] },
            { key: "ACTION TAKEN", value: ["YES", "NO"] },
            { key: "RM", value: ["Planning", "In Progress", "Pending", "Completed"] },
            { key: "INCOMING INSPECTION", value: ["In Progress", "Pending", "Completed"] },
            { key: "MACHINE", value: ["In Progress", "Pending", "Completed"] },
            { key: "OUT PROCESS", value: ["In Progress", "Pending", "Completed"] },
            { key: "ASSEMBLY", value: ["In Progress", "Pending", "Completed"] },
            { key: "PR-STATUS", value: ["Under Process", "Completed", "Next Setting"] },
            { key: "CALIBRATION", value: ["DONE", "DUE"] },
            { key: "INSTRUMENTS-STATUS", value: ["Using", "Not Using"] },
            { key: "INSPECTION-STATUS", value: ["Okay", "Not Okay"] },
            { key: "DIMENSION", value: ["Okay", "Not Okay"] },
            { key: "DEFECT FOUND", value: ["Yes", "No"] },
            { key: "SHORT QUANITY", value: ["Yes", "No"] },
            { key: "ITEM CHANGED", value: ["Yes", "No"] },
            { key: "REPORT RECEIVED", value: ["Yes", "No"] },
            { key: "CCR STATUS", value: ["OPEN", "CLOSED"] },
            { key: "QL STATUS", value: ["WAITING FOR CODE", "WAITING FOR ORDER", "ORDER"] },
            { key: "PSR STATUS", value: ["OPEN", "CLOSED"] },
            { key: "TRIAL STATUS", value: ["WAITING FOR ORDER", "ORDER CONFIRMED", "PRODUCT FAILED"] },
            { key: "PR STATUS", value: ["PENDING", "CLOSED"] },
            { key: "QC QUALITY INSPECTION", value: ["Move to Inspection", "Inspection Done"] },
            { key: "PAYMENT", value: ["OPEN", "CLOSED"] },
            { key: "CR STATUS", value: ["OPEN", "CLOSED"] },
            { key: "NPD STATUS", value: ["Not Feasible", "Waiting For Order", "Order Confirmed", "Under Process", "Supplied to Customer"] }
        ];

        // ✅ Merge dynamic values into the hardcoded array
        dynamicOptions.forEach(dynamicItem => {
            // Ensure “Others” is always included
            if (!dynamicItem.value.includes("Others")) {
                dynamicItem.value.push("Others");
            }

            const existing = selectOptionsArray.find(opt => opt.key.toLowerCase() === dynamicItem.key.toLowerCase());
            if (existing) {
                // merge unique values only
                dynamicItem.value.forEach(val => {
                    if (!existing.value.includes(val)) {
                        existing.value.push(val);
                    }
                });
            } else {
                // add new key if it doesn't exist
                selectOptionsArray.push(dynamicItem);
            }
        });

        dispatch(setAuthSelectOptions(selectOptionsArray));
    };

  return {
    loading,
    handlegetAllProcess,
    handleGetSingleProcess,
    handleGetProcessbyDepartmentId,
    handleAddData,
    handleUpdateData,
    handleDeleteData,
    handleSearchSelectOptions,
    handleRefreshData
  } 
}

export default Process