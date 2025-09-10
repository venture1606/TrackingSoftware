import { createSlice } from "@reduxjs/toolkit";

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    process: '',
    subProcess: {},
    tableData: {},
    mainTableData: {},
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
    },
    setTableData: (state, action) => {
      state.tableData = action.payload;
    },
    setMainTableData: (state, action) => {
      state.mainTableData = action.payload;
    },
  },
});

export const { 
  setProcess, 
  setSubProcess,
  setDepartments,
  setTableData,
  setMainTableData
} = departmentSlice.actions;

export default departmentSlice.reducer;