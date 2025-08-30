import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    mode : false,
    message: '',
};

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {
        setMessage: (state, action) => {
            state.status = action.payload.status;
            state.description = action.payload.description || '';
            state.message = action.payload.message;
        },
        clearMessage: (state) => {
            state.status = '';
            state.description = '';
            state.message = '';
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { 
    setMessage, 
    clearMessage, 
    setMode, 
    setLoading 
} = commonSlice.actions;

export default commonSlice.reducer;