import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';
import commonReducer from './slices/common';
import departmentReducer from './slices/department'
import productReducer from './slices/product';

const store = configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    department: departmentReducer,
    product: productReducer
  },
});

export default store;