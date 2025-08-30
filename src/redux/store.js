import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import commonReducer from './slices/common';
import departmentReducer from './slices/department'

const store = configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    department: departmentReducer
  },
});

export default store;