import React, { useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'

import { setMessage } from '../redux/slices/common';
import { setAllProcesses } from '../redux/slices/department';

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

  return {
    loading,
    handlegetAllProcess,
    handleGetSingleProcess,
    handleGetProcessbyDepartmentId,
    handleAddData,
    handleUpdateData,
    handleDeleteData
  } 
}

export default Process