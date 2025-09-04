import { createSlice } from "@reduxjs/toolkit";

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    process: '',
    subProcess: {}
  },
  reducers: {
    setProcess: (state, action) => {
      state.process = action.payload;
    },
    setSubProcess: (state, action) => {
      state.subProcess = action.payload;
    },
    setDepartments: (state, action) => {
      state.departments = action.payload;
    }
  },
});

export const { 
  setProcess, 
  setSubProcess,
  setDepartments
} = departmentSlice.actions;

export default departmentSlice.reducer;