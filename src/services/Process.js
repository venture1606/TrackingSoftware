import React, { useState } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'

import { setMessage } from '../redux/slices/common';

function Process() {

    const URL = 'https://adl-server.onrender.com/api/v1/process';

    const [ loading, setLoading ] = useState(false);
    const dispatch = useDispatch();

    const handlegetAllProcess = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

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
        console.log(rowDataId)
        try {
            const payload = { items, rowDataId };
            const response = await axios.post(`${URL}/data/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            return response.data.process;
            
        } catch (error) {
            console.error("Error adding data:", error);
            dispatch(setMessage({
                status: 'error',
                description: 'Failed to add data.',
                message: error.message
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateData = async ({ rowId, items, id }) => {
        setLoading(true);
        try {
            const payload = { items, rowId };
            const response = await axios.put(`${URL}/data/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.data;
        } catch (error) {
            console.error("Error updating data:", error);
            dispatch(setMessage({
                status: 'error',
                description: 'Failed to update data.',
                message: error.message
            }));
        } finally {
            setLoading(false);
        }
    }

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