import React, { useState } from 'react'
import axios from 'axios';
import { useDispatch } from 'react-redux';

import { setProducts, setSingleProduct } from '../redux/slices/product';
import { setMessage } from '../redux/slices/common';

function Product() {

    const URL = 'https://adl-server.onrender.com/api/v1/product';

    const dispatch = useDispatch();
    const [ loading, setLoading ] = useState(false);

  const handleGetAllProducts = async () => {
    setLoading(true);
    try {
      // Fetch products from API
      const response = await axios.get(`${URL}/all`);
    //   console.log(response.data.data)
      dispatch(setProducts(response.data.data));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSingleProduct = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL}/${id}`);
      dispatch(setSingleProduct(response.data.data));
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    setLoading(true);
    try {
        const response = await axios.post(`${URL}/create`, productData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log(response.data);

        dispatch(setMessage({ 
            status: 'success', 
            description: 'Product created successfully!',
            message: `${response.data.data.name || 'productName'} has been created.`
        }));
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    setLoading(true);
    try {
      const response = await axios.put(`${URL}/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      dispatch(setMessage({ 
          status: 'success', 
          description: 'Product deleted successfully!',
          message: `${response.data.data.name || 'productName'} has been deleted.`
      }));

    } catch (error) {
      
        console.error("Error deleting product:", error);
        
    } finally {
      setLoading(false);
    }
  };

  const handleAddGraphData = async ({ newData, id }) => {
    setLoading(true);
    try {
        const response = await axios.post(`${URL}/graph/${id}`, newData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        dispatch(setSingleProduct(response.data.data));
    } catch (error) {
        console.error("Error adding graph data:", error);
        dispatch(setMessage({ 
            status: 'error', 
            description: 'Failed to add graph data.',
            message: error.message
        }));
    } finally {
        setLoading(false);
    }
  };

  return {
    handleGetAllProducts,
    handleGetSingleProduct,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddGraphData,
    loading
  }
}

export default Product