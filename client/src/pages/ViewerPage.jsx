import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchModelById } from '../store/modelsSlice.js';
import {
  loadViewerState,
  saveViewerState,
  toggleWireframe,
  toggleAutoRotate,
  resetViewerState,
  updateCameraPosition,
  updateCameraTarget,
  updateObjectRotation,
} from '../store/viewerSlice.js';
import useThreeScene from '../hooks/useThreeScene.js';
import useStateSync from '../hooks/useStateSync.js';
import ViewerToolbar from '../components/ViewerToolbar.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentModel } = useSelector((state) => state.models);
  const { interactionState } = useSelector((state) => state.viewer);

  const {
    containerRef,
    isLoading: isModelLoading,
    loadProgress,
    error: modelError,
    loadModel,
    resetCamera,
    setWireframe,
    setAutoRotate,
    applyState,
    getState,
  } = useThreeScene();

  const { forceSave } = useStateSync(id);
  const [isInitialized, setIsInitialized] = useState(false);
  const stateAppliedRef = useRef(false);

  // Fetch model metadata
  useEffect(() => {
    if (id) {
      dispatch(fetchModelById(id));
      dispatch(loadViewerState(id));
    }
  }, [id, dispatch]);

  // Load the 3D model once metadata is available
  useEffect(() => {
    if (currentModel && !isInitialized) {
      let modelUrl = currentModel.s3Url;

      // For local storage, prepend the API base URL
      if (currentModel.storageType === 'local') {
        const base = API_BASE.replace('/api', '');
        modelUrl = `${base}${currentModel.s3Url}`;
      }

      loadModel(modelUrl).then(() => {
        setIsInitialized(true);
      });
    }
  }, [currentModel, isInitialized, loadModel]);

  // Apply saved state after model loads
  useEffect(() => {
    if (isInitialized && interactionState && !stateAppliedRef.current) {
      applyState(interactionState);
      stateAppliedRef.current = true;
    }
  }, [isInitialized, interactionState, applyState]);

  // Periodic state capture for persistence
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      const state = getState();
      if (state) {
        dispatch(updateCameraPosition(state.cameraPosition));
        dispatch(updateCameraTarget(state.cameraTarget));
        dispatch(updateObjectRotation(state.objectRotation));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isInitialized, getState, dispatch]);

  // Save state on unmount
  useEffect(() => {
    return () => {
      forceSave();
    };
  }, [forceSave]);

  // ─── Handlers ──────────────────────────────────────
  const handleReset = useCallback(() => {
    resetCamera();
    dispatch(resetViewerState());
    applyState({
      cameraPosition: { x: 5, y: 5, z: 5 },
      cameraTarget: { x: 0, y: 0, z: 0 },
    });
    toast.success('Camera reset');
  }, [resetCamera, dispatch, applyState]);

  const handleToggleWireframe = useCallback(() => {
    const newVal = !interactionState.wireframe;
    setWireframe(newVal);
    dispatch(toggleWireframe());
  }, [interactionState.wireframe, setWireframe, dispatch]);

  const handleToggleAutoRotate = useCallback(() => {
    const newVal = !interactionState.autoRotate;
    setAutoRotate(newVal);
    dispatch(toggleAutoRotate());
  }, [interactionState.autoRotate, setAutoRotate, dispatch]);

  const handleBack = useCallback(() => {
    forceSave();
    navigate('/dashboard');
  }, [navigate, forceSave]);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isModelLoading && (
          <LoadingOverlay progress={loadProgress} message="Loading 3D model..." />
        )}
      </AnimatePresence>

      {/* Error */}
      {modelError && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
            <p className="text-lg font-semibold mb-2" style={{ color: '#ef4444' }}>
              Failed to load model
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{modelError}</p>
            <button onClick={handleBack} className="btn-primary mt-4">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <ViewerToolbar
        onReset={handleReset}
        onToggleWireframe={handleToggleWireframe}
        onToggleAutoRotate={handleToggleAutoRotate}
        onBack={handleBack}
        wireframe={interactionState.wireframe}
        autoRotate={interactionState.autoRotate}
        modelName={currentModel?.originalName || 'Loading...'}
      />

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ paddingTop: '56px' /* toolbar height */ }}
        id="three-canvas-container"
      />
    </div>
  );
};

export default ViewerPage;
