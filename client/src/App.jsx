import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import useAuth from './hooks/useAuth.js';
import { setLoading } from './store/authSlice.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import api from './services/api.js';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ViewerPage = lazy(() => import('./pages/ViewerPage.jsx'));

const PageLoader = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    style={{ background: 'var(--bg-primary)' }}
  >
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="spinner" style={{ width: '2.5rem', height: '2.5rem' }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
    </div>
  </div>
);

function AuthInit() {
  const dispatch = useDispatch();
  const { fetchUser, accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (accessToken && !isAuthenticated) {
        try {
          await fetchUser();
        } catch {
          sessionStorage.removeItem('accessToken');
          dispatch(setLoading(false));
        }
      } else if (!accessToken) {
        try {
          const { data } = await api.post('/auth/refresh');
          sessionStorage.setItem('accessToken', data.data.accessToken);
          await fetchUser();
        } catch {
          dispatch(setLoading(false));
        }
      }
    };

    init();
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewer/:id"
            element={
              <ProtectedRoute>
                <ViewerPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
