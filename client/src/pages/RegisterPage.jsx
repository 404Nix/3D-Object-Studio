import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, resetError } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    resetError();
  }, [resetError]);

  const validate = () => {
    const errors = {};
    if (!form.username) errors.username = 'Username is required';
    else if (form.username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      errors.username = 'Only letters, numbers, and underscores';

    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email format';

    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      errors.password = 'Must contain lowercase, uppercase, and number';

    if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      }).unwrap();
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const fields = [
    {
      id: 'register-username',
      label: 'Username',
      type: 'text',
      key: 'username',
      placeholder: 'johndoe',
      autoComplete: 'username',
    },
    {
      id: 'register-email',
      label: 'Email',
      type: 'email',
      key: 'email',
      placeholder: 'you@example.com',
      autoComplete: 'email',
    },
    {
      id: 'register-password',
      label: 'Password',
      type: 'password',
      key: 'password',
      placeholder: '••••••••',
      autoComplete: 'new-password',
    },
    {
      id: 'register-confirm-password',
      label: 'Confirm Password',
      type: 'password',
      key: 'confirmPassword',
      placeholder: '••••••••',
      autoComplete: 'new-password',
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-grid"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div
        className="fixed top-1/3 right-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md relative"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
              <path d="M32 8L56 22V46L32 60L8 46V22L32 8Z" stroke="url(#rgGrad)" strokeWidth="2.5" fill="none" />
              <path d="M32 8V60M8 22L56 46M56 22L8 46" stroke="url(#rgGrad)" strokeWidth="1.5" opacity="0.5" />
              <circle cx="32" cy="32" r="4" fill="url(#rgGrad)" />
              <defs>
                <linearGradient id="rgGrad" x1="8" y1="8" x2="56" y2="60">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Join 3D Object Studio
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
          {fields.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={field.id}
                className="block mb-1.5 text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                className={`input ${formErrors[field.key] ? 'input-error' : ''}`}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                autoComplete={field.autoComplete}
              />
              {formErrors[field.key] && (
                <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {formErrors[field.key]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isLoading}
            id="register-submit-btn"
            style={{ padding: '0.75rem' }}
          >
            {isLoading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent-purple)' }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
