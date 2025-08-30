import { createSlice } from "@reduxjs/toolkit";

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    process: ''
  },
  reducers: {
    setProcess: (state, action) => {
      state.process = action.payload;
    },
  },
});

export const { setProcess } = departmentSlice.actions;

export default departmentSlice.reducer;
