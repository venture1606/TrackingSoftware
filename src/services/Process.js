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
            console.log(response.data.data)
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

    const handleAddData = async ({ items, id }) => {
        setLoading(true);
        try {
            const payload = { items };
            const response = await axios.post(`${URL}/data/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Added data:', response.data.process);
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

  return {
    loading,
    handlegetAllProcess,
    handleGetSingleProcess,
    handleGetProcessbyDepartmentId,
    handleAddData
  } 
}

export default Process