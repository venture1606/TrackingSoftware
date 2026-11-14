import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/slices/common";
import { SERIAL_URL } from "../config/api";

const URL = SERIAL_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const SERIAL_TYPES = {
  ENQUIRE_NUMBER: "ENQUIRE_NUMBER",
};

export const peekSerial = async (type) => {
  const response = await axios.get(
    `${URL}/${encodeURIComponent(type)}/next`,
    getAuthHeaders(),
  );
  return response.data.data;
};

export const allocateSerial = async (type) => {
  const response = await axios.post(
    `${URL}/${encodeURIComponent(type)}/allocate`,
    {},
    getAuthHeaders(),
  );
  return response.data.data;
};

export const usePeekSerial = (type, enabled = true) => {
  return useQuery({
    queryKey: ["serialPeek", type],
    queryFn: () => peekSerial(type),
    enabled: !!type && enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useAllocateSerial = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (type) => allocateSerial(type),
    onError: (error) => {
      dispatch(
        setMessage({
          status: "error",
          description:
            error?.response?.data?.errorMessage ||
            error?.message ||
            "Failed to allocate serial number",
          message: "Error",
        }),
      );
    },
  });
};

export const usePeekSerialMutation = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (type) => peekSerial(type),
    onError: (error) => {
      dispatch(
        setMessage({
          status: "error",
          description:
            error?.response?.data?.errorMessage ||
            error?.message ||
            "Failed to fetch next serial number",
          message: "Error",
        }),
      );
    },
  });
};
