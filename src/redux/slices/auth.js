import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  userDetails: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  notifications: [],
  allUsers: [],
  SelectOptionsArray: [],
  groupItem: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.isLoggedIn = action.payload;
      localStorage.setItem('isLoggedIn', action.payload ? 'true' : 'false');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setLogout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userDetails = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('isLoggedIn', 'false');
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setSelectOptionsArray: (state, action) => {
      state.SelectOptionsArray = action.payload;
    },
    setGroupItem: (state, action) => {
      state.groupItem = action.payload;
    },
    updateGroupItem: (state, action) => {
      const { key, value } = action.payload;

      const existing = state.groupItem.find(
        (item) => item.key.toLowerCase() === key.toLowerCase()
      );

      if (existing) {
        // merge new unique values
        existing.value = Array.from(new Set([...existing.value, ...value]));
      } else {
        // add a new key if it doesn’t exist
        state.groupItem.push({ key, value });
      }
    },
    updateSelectOptions: (state, action) => {
      const { key, value } = action.payload;

      const existing = state.SelectOptionsArray.find(
        (item) => item.key.toLowerCase() === key.toLowerCase()
      );

      if (existing) {
        // merge new unique values
        existing.value = Array.from(new Set([...existing.value, ...value]));
      } else {
        // add a new key if it doesn’t exist
        state.SelectOptionsArray.push({ key, value });
      }
    },
  },
});

export const { 
  setLogin, 
  setToken, 
  setUserDetails, 
  setLogout,
  setAllUsers,
  setSelectOptionsArray,
  updateSelectOptions,
  setGroupItem,
  updateGroupItem
} = authSlice.actions;

export default authSlice.reducer;
