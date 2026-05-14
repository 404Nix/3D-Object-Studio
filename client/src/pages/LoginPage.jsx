import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, resetError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    resetError();
  }, [resetError]);

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(form).unwrap();
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-grid"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              <path d="M32 8L56 22V46L32 60L8 46V22L32 8Z" stroke="url(#lgGrad)" strokeWidth="2.5" fill="none" />
              <path d="M32 8V60M8 22L56 46M56 22L8 46" stroke="url(#lgGrad)" strokeWidth="1.5" opacity="0.5" />
              <circle cx="32" cy="32" r="4" fill="url(#lgGrad)" />
              <defs>
                <linearGradient id="lgGrad" x1="8" y1="8" x2="56" y2="60">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text">3D Object Studio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="login-email"
              className="block mb-1.5 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className={`input ${formErrors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            {formErrors.email && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{formErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block mb-1.5 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className={`input ${formErrors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            {formErrors.password && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isLoading}
            id="login-submit-btn"
            style={{ padding: '0.75rem' }}
          >
            {isLoading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium"
            style={{ color: 'var(--accent-purple)' }}
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
