import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveViewerState, markClean } from '../store/viewerSlice.js';

/**
 * Hook that debounces interaction state saves to the backend.
 * Saves 2 seconds after the last state change.
 */
const useStateSync = (modelId) => {
  const dispatch = useDispatch();
  const { interactionState, isDirty } = useSelector((state) => state.viewer);
  const timerRef = useRef(null);
  const stateRef = useRef(interactionState);

  // Keep ref updated
  useEffect(() => {
    stateRef.current = interactionState;
  }, [interactionState]);

  // Debounced save
  useEffect(() => {
    if (!isDirty || !modelId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      dispatch(
        saveViewerState({
          modelId,
          state: stateRef.current,
        })
      );
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, modelId, dispatch, interactionState]);

  // Force save (e.g., on unmount)
  const forceSave = useCallback(() => {
    if (isDirty && modelId) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      dispatch(
        saveViewerState({
          modelId,
          state: stateRef.current,
        })
      );
    }
  }, [isDirty, modelId, dispatch]);

  return { forceSave };
};

export default useStateSync;
