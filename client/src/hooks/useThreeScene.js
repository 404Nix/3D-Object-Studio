import { useEffect, useRef, useState, useCallback } from 'react';
import SceneManager from '../three/SceneManager.js';
import ModelLoader from '../three/ModelLoader.js';

/**
 * React hook wrapping the Three.js SceneManager and ModelLoader.
 */
const useThreeScene = () => {
  const containerRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const modelLoaderRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  // ─── Initialize Scene ───────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    sceneManagerRef.current = new SceneManager(containerRef.current);
    modelLoaderRef.current = new ModelLoader();

    return () => {
      if (modelLoaderRef.current) {
        modelLoaderRef.current.dispose();
      }
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, []);

  // ─── Load Model ─────────────────────────────────────
  const loadModel = useCallback(async (url) => {
    if (!sceneManagerRef.current || !modelLoaderRef.current) return;

    setIsLoading(true);
    setLoadProgress(0);
    setError(null);

    try {
      // Dispose previous model
      modelLoaderRef.current.dispose();

      const model = await modelLoaderRef.current.load(url, (progress) => {
        setLoadProgress(progress);
      });

      sceneManagerRef.current.setModel(model);
      setIsLoading(false);
      setLoadProgress(100);
    } catch (err) {
      setError(err.message || 'Failed to load model');
      setIsLoading(false);
    }
  }, []);

  // ─── Controls ───────────────────────────────────────
  const resetCamera = useCallback(() => {
    sceneManagerRef.current?.resetCamera();
  }, []);

  const setWireframe = useCallback((enabled) => {
    sceneManagerRef.current?.setWireframe(enabled);
  }, []);

  const setAutoRotate = useCallback((enabled) => {
    sceneManagerRef.current?.setAutoRotate(enabled);
  }, []);

  const applyState = useCallback((state) => {
    sceneManagerRef.current?.applyState(state);
  }, []);

  const getState = useCallback(() => {
    return sceneManagerRef.current?.getState() || null;
  }, []);

  return {
    containerRef,
    isLoading,
    loadProgress,
    error,
    loadModel,
    resetCamera,
    setWireframe,
    setAutoRotate,
    applyState,
    getState,
    sceneManager: sceneManagerRef,
  };
};

export default useThreeScene;
