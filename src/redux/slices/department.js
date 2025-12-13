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
    detailingProducts: [],
    // Add loading/error states if needed, but keeping simple for now
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
    },
    // Optimistic / Granular Reducers
    addProcessToStore: (state, action) => {
        // Optimistically add to allProcesses if it matches the shape
        if (action.payload) {
             state.allProcesses.push(action.payload);
        }
    },
    updateProcessInStore: (state, action) => {
        const updated = action.payload;
        if(updated && updated._id) {
            const index = state.allProcesses.findIndex(p => p._id === updated._id);
            if(index !== -1) {
                state.allProcesses[index] = updated;
            }
            // Also update detailingProducts if it matches
            if(state.detailingProducts?._id === updated._id) {
                 state.detailingProducts = updated;
            }
        }
    },
    deleteProcessFromStore: (state, action) => {
        const idToDelete = action.payload;
        state.allProcesses = state.allProcesses.filter(p => p._id !== idToDelete);
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
  setDetailingProducts,
  addProcessToStore,
  updateProcessInStore,
  deleteProcessFromStore
} = departmentSlice.actions;

export default departmentSlice.reducer;