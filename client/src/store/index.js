import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import modelsReducer from './modelsSlice.js';
import viewerReducer from './viewerSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    models: modelsReducer,
    viewer: viewerReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
