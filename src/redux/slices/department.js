import { createSlice } from "@reduxjs/toolkit";

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    process: [],
    subProcess: {},
    tableData: {},
    mainTableData: {},
    allProcesses: [],
    detailingProducts: []
  },
  reducers: {
    setProcess: (state, action) => {
      state.process = action.payload.map(item => ({
        id: item._id,
        process: item.process,
        processId: item.processId
      }));
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
    setAllProcesses: (state, action) => {
      state.allProcesses = action.payload;
    },
    setDetailingProducts: (state, action) => {
      state.detailingProducts = action.payload;
    }
  },
});

export const { 
  setProcess, 
  setSubProcess,
  setDepartments,
  setTableData,
  setMainTableData,
  setAllProcesses,
  setDetailingProducts
} = departmentSlice.actions;

export default departmentSlice.reducer;