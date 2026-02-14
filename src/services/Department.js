import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/slices/common";
import { setDepartments } from "../redux/slices/department";

const URL = process.env.REACT_APP_DEPARTMENT_URL;

export const useDepartments = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get(`${URL}/all`);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(
        setMessage({
          status: "success",
          description: "Departments fetched successfully",
          message: "Fetched",
        }),
      );
      dispatch(setDepartments(data));
    },
    refetchOnWindowFocus: false,
  });
};

function Department() {
  return {};
}

export default Department;
