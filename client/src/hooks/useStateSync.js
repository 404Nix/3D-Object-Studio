import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveViewerState, markClean } from '../store/viewerSlice.js';

const useStateSync = (modelId) => {
  const dispatch = useDispatch();
  const { interactionState, isDirty } = useSelector((state) => state.viewer);
  const timerRef = useRef(null);
  const stateRef = useRef(interactionState);

  useEffect(() => {
    stateRef.current = interactionState;
  }, [interactionState]);

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
