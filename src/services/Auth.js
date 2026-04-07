import { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setAllUsers,
  setToken,
  setUserDetails,
  setLogin,
  setLogout,
} from "../redux/slices/auth";
import { setMessage } from "../redux/slices/common";

const URL = process.env.REACT_APP_AUTH_URL;

export const useAllUsers = (enabled = true) => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await axios.get(`${URL}/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.result;
    },
    enabled,
    onSuccess: (data) => {
      dispatch(setAllUsers(data));
    },
  });
};

function Auth() {
  const userDetails = useSelector((state) => state.auth.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isOtpCorrect, setisOtpCorrect] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRegister = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(`${URL}/register`, credentials);
      const { token, user } = response.data;

      dispatch(setToken(token));
      dispatch(setUserDetails(user));
      dispatch(
        setMessage({
          status: "success",
          description: "Account Registered Successfully",
          message: `Welcome ${user.userName}`,
        }),
      );
      return true;
    } catch (error) {
      console.log(error);
      dispatch(
        setMessage({
          status: "error",
          description: "Account Registration Failed",
          message: error.response?.data?.message || "An error occurred",
        }),
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreateAccount = async (credentials) => {
    setLoading(true);
    try {
      // Use the registration endpoint but DON'T update current session
      await axios.post(`${URL}/register`, credentials);

      dispatch(
        setMessage({
          status: "success",
          description: "New Account Provisioned Successfully",
          message: "Creation Success",
        }),
      );
      return true;
    } catch (error) {
      console.log(error);
      dispatch(
        setMessage({
          status: "error",
          description:
            error.response?.data?.message || "Account Creation Failed",
          message: "Creation Error",
        }),
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      if (!credentials.email || !credentials.password) {
        dispatch(
          setMessage({
            status: "error",
            description: "Please enter both email and password.",
            message: "Invalid credentials",
          }),
        );
        return;
      }

      const response = await axios.post(`${URL}/login`, credentials, {
        withCredentials: true,
      });

      const { token, user } = response.data;

      dispatch(setToken(token));
      dispatch(setUserDetails(user));
      dispatch(setLogin(true));
      dispatch(
        setMessage({
          status: "success",
          description: "Logged In Succesfully",
          message: `Welcome ${user.name}`,
        }),
      );

      navigate("/");
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      const errorStatus = error.response.status;

      dispatch(
        setMessage({
          status: "error",
          description: errorMessage,
          message: `Error ${errorStatus}`,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${URL}/logout`, {
        withCredentials: true,
      });

      dispatch(
        setMessage({
          status: "success",
          description: "Logged Out Successfully",
          message: `${userDetails?.userName || "User"} Goodbye`,
        }),
      );

      startTransition(() => {
        dispatch(setLogout());
      });
    } catch (error) {
      console.log(error);
      dispatch(
        setMessage({
          status: "error",
          description: "Logout Failed",
          message: error.response?.data?.message || "Error",
        }),
      );
      // Still logout locally if API fails
      startTransition(() => {
        dispatch(setLogout());
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (credentials) => {
    setLoading(true);
    localStorage.setItem("resetEmail", credentials.email);

    try {
      const response = await axios.post(`${URL}/forgotpassword`, {
        email: credentials.email,
      });

      dispatch(
        setMessage({
          status: "success",
          description: response.data.message,
          message: "OTP sent",
        }),
      );

      setisOtpCorrect(true);
    } catch (error) {
      console.log(error);
      dispatch(
        setMessage({
          status: "error",
          description: "Forgot Password Failed",
          message: "Error",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllUser = async () => {
    // This is now legacy, using useAllUsers hook instead
  };

  const handleDeleteUser = async (email) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${URL}/delete`, {
        data: { email },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      dispatch(
        setMessage({
          status: "success",
          description: response.data.message,
          message: "Account Deleted",
        }),
      );
      return true;
    } catch (error) {
      console.log(error);
      dispatch(
        setMessage({
          status: "error",
          description: error.response?.data?.message || "Deletion Failed",
          message: "Error",
        }),
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    handleLogin,
    handleLogout,
    handleDeleteUser,
    handleAdminCreateAccount,
    handleForgotPassword,
    handleGetAllUser,
    loading,
    isOtpCorrect,
  };
}

export default Auth;
