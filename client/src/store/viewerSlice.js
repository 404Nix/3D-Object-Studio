import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// ─── Async Thunks ─────────────────────────────────────
export const loadViewerState = createAsyncThunk(
  'viewer/loadState',
  async (modelId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/models/${modelId}/state`);
      return data.data.interactionState;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load state');
    }
  }
);

export const saveViewerState = createAsyncThunk(
  'viewer/saveState',
  async ({ modelId, state }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/models/${modelId}/state`, state);
      return data.data.interactionState;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save state');
    }
  }
);

// ─── Default State ────────────────────────────────────
const defaultInteractionState = {
  cameraPosition: { x: 5, y: 5, z: 5 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  zoom: 1,
  objectRotation: { x: 0, y: 0, z: 0 },
  wireframe: false,
  autoRotate: false,
};

// ─── Slice ────────────────────────────────────────────
const viewerSlice = createSlice({
  name: 'viewer',
  initialState: {
    interactionState: { ...defaultInteractionState },
    isLoading: false,
    isDirty: false,
    error: null,
  },
  reducers: {
    updateCameraPosition: (state, action) => {
      state.interactionState.cameraPosition = action.payload;
      state.isDirty = true;
    },
    updateCameraTarget: (state, action) => {
      state.interactionState.cameraTarget = action.payload;
      state.isDirty = true;
    },
    updateZoom: (state, action) => {
      state.interactionState.zoom = action.payload;
      state.isDirty = true;
    },
    updateObjectRotation: (state, action) => {
      state.interactionState.objectRotation = action.payload;
      state.isDirty = true;
    },
    toggleWireframe: (state) => {
      state.interactionState.wireframe = !state.interactionState.wireframe;
      state.isDirty = true;
    },
    toggleAutoRotate: (state) => {
      state.interactionState.autoRotate = !state.interactionState.autoRotate;
      state.isDirty = true;
    },
    resetViewerState: (state) => {
      state.interactionState = { ...defaultInteractionState };
      state.isDirty = true;
    },
    markClean: (state) => {
      state.isDirty = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadViewerState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadViewerState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interactionState = { ...defaultInteractionState, ...action.payload };
        state.isDirty = false;
      })
      .addCase(loadViewerState.rejected, (state) => {
        state.isLoading = false;
        state.interactionState = { ...defaultInteractionState };
      });

    builder
      .addCase(saveViewerState.fulfilled, (state) => {
        state.isDirty = false;
      });
  },
});

export const {
  updateCameraPosition,
  updateCameraTarget,
  updateZoom,
  updateObjectRotation,
  toggleWireframe,
  toggleAutoRotate,
  resetViewerState,
  markClean,
} = viewerSlice.actions;

export default viewerSlice.reducer;
