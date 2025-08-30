import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setMessage } from '../redux/slices/common'
import { setToken, setUserDetails, setLogin } from '../redux/slices/auth'

function Auth() {

  const URL = 'http://localhost:3008/api/v1/user'

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false)
  const [isOtpCorrect, setisOtpCorrect] = useState(false);
  const [isPasswordReset, setisPasswordReset] = useState(false);

  const handleRegister = async (credentials) => {
    setLoading(true);
    try{
      const response = await axios.post(`${URL}/register`, credentials)
      const { token, user } = response.data

      dispatch(setToken(token))
      dispatch(setUserDetails(user))
      dispatch(setMessage({ 
        status: 'success', 
        description: 'Account Registered Successfully', 
        message: 'Created' 
      }));

    } catch (error) {
      console.log(error)
      dispatch(setMessage({ 
        status: 'error', 
        description: 'Account Registration Failed', 
        message: error.response?.data?.message 
      }));
      
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
        if (!credentials.email || !credentials.password) {
            dispatch(setMessage({ status: 'error', description: 'Please enter both email and password.', message: 'Invalid credentials' }));
            return;
        }

        const response = await axios.post(`${URL}/login`, credentials, {
            withCredentials: true
        });

        const { token, user } = response.data;
        
        dispatch(setToken(token));
        dispatch(setUserDetails(user));
        dispatch(setLogin(true));
        dispatch(setMessage({
            status: 'success', 
            description: 'Logged In Succesfully',
            message: `Welcome ${user.firstName}`
        }));
        
        navigate('/');

    } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || 'An error occurred';
        const errorStatus = error.response.status;
        
        dispatch(setMessage({ 
            status: 'error',
            description: errorMessage, 
            message: `Error ${errorStatus}` 
        }));

    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
        await axios.get(`${URL}/logout`, {
            withCredentials: true
        });
        
        dispatch(setMessage({ 
            status: 'success', 
            description: 'Logged Out Successfully', 
            message: 'Goodbye' 
        }));
        
        dispatch(setLogin(false));

    } catch (error) {
        console.log(error);
        dispatch(setMessage({ 
            status: 'error', 
            description: 'Logout Failed', 
            message: 'Error' 
        }));
    } finally {
        setLoading(false);
    }
  }

  const handleForgotPassword = async (credentials) => {
    setLoading(true);
    localStorage.setItem('resetEmail', credentials.email);

    try {
      const response = await axios.post(`${URL}/forgotpassword`, { email: credentials.email });
            
            dispatch(setMessage({ 
                status: 'success',
                description: response.data.message,
                message: 'OTP sent'
            }));

            setisOtpCorrect(true)

    } catch (error) {
        console.log(error);
        dispatch(setMessage({ 
            status: 'error', 
            description: 'Forgot Password Failed', 
            message: 'Error' 
        }));
    } finally {
        setLoading(false);
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleLogout,
    handleForgotPassword,
    loading,
  }
}

export default Auth