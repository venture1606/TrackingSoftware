import React, { useState } from 'react'

import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { setMessage } from '../redux/slices/common';
import { setDepartments } from '../redux/slices/department';

function Department() {
    const [loading, setLoading] = useState(false);
    const departments = useSelector((state) => state.department.departments);
    const dispatch = useDispatch();

    const URL = 'http://localhost:3008/api/v1/department';

    const handleGetAllDepartments = async () => {
        if (departments.length > 0) return;
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/all`);

            dispatch(setMessage({
                status: 'success',
                description: 'Departments fetched successfully',
                message: 'Fetched'
            }))

            dispatch(setDepartments(response.data.data));

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

  return {
    loading,
    handleGetAllDepartments
  }
}

export default Department