import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getMe,
  clearError,
} from '../store/authSlice.js';


const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error, accessToken } = useSelector(
    (state) => state.auth
  );

  const register = useCallback(
    (credentials) => dispatch(registerUser(credentials)),
    [dispatch]
  );

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  const refresh = useCallback(() => dispatch(refreshToken()), [dispatch]);

  const fetchUser = useCallback(() => dispatch(getMe()), [dispatch]);

  const resetError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    register,
    login,
    logout,
    refresh,
    fetchUser,
    resetError,
  };
};

export default useAuth;
