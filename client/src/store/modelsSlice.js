import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchModels = createAsyncThunk(
  'models/fetchModels',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/models?page=${page}&limit=${limit}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch models');
    }
  }
);

export const fetchModelById = createAsyncThunk(
  'models/fetchModelById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/models/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch model');
    }
  }
);

export const uploadModel = createAsyncThunk(
  'models/uploadModel',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('model', file);

      const { data } = await api.post('/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const deleteModel = createAsyncThunk(
  'models/deleteModel',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/models/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Delete failed');
    }
  }
);

const modelsSlice = createSlice({
  name: 'models',
  initialState: {
    models: [],
    currentModel: null,
    pagination: null,
    isLoading: false,
    isUploading: false,
    error: null,
  },
  reducers: {
    clearCurrentModel: (state) => {
      state.currentModel = null;
    },
    clearModelsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch models
    builder
      .addCase(fetchModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.models = action.payload.models;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch model by ID
    builder
      .addCase(fetchModelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModel = action.payload.model;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Upload model
    builder
      .addCase(uploadModel.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadModel.fulfilled, (state, action) => {
        state.isUploading = false;
        state.models.unshift(action.payload.model);
      })
      .addCase(uploadModel.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });

    // Delete model
    builder
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurrentModel, clearModelsError } = modelsSlice.actions;
export default modelsSlice.reducer;
