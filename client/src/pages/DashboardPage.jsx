import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCube,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import { fetchModels, deleteModel } from '../store/modelsSlice.js';
import ModelCard from '../components/ModelCard.jsx';
import UploadModal from '../components/UploadModal.jsx';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { models, isLoading } = useSelector((state) => state.models);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Are you sure you want to delete this model?')) return;
      try {
        await dispatch(deleteModel(id)).unwrap();
        toast.success('Model deleted');
      } catch (err) {
        toast.error(err || 'Delete failed');
      }
    },
    [dispatch]
  );

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(9, 9, 15, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <path d="M32 8L56 22V46L32 60L8 46V22L32 8Z" stroke="url(#dashGrad)" strokeWidth="2.5" fill="none" />
                <path d="M32 8V60M8 22L56 46M56 22L8 46" stroke="url(#dashGrad)" strokeWidth="1.5" opacity="0.5" />
                <circle cx="32" cy="32" r="3" fill="url(#dashGrad)" />
                <defs>
                  <linearGradient id="dashGrad" x1="8" y1="8" x2="56" y2="60">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-bold text-lg gradient-text hidden sm:block">
                3D Object Studio
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {user?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Sign out"
                id="dashboard-logout-btn"
              >
                <HiOutlineArrowRightOnRectangle />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              My Models
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {models.length} model{models.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary"
            id="dashboard-upload-btn"
          >
            <HiOutlinePlus style={{ fontSize: '1.1rem' }} />
            Upload Model
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton mb-4" style={{ height: '160px' }} />
                <div className="skeleton mb-2" style={{ height: '20px', width: '70%' }} />
                <div className="skeleton" style={{ height: '16px', width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && models.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="animate-float mb-6">
              <HiOutlineCube style={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              No models yet
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Upload your first .glb file to get started
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary"
              id="empty-upload-btn"
            >
              <HiOutlinePlus />
              Upload Your First Model
            </button>
          </motion.div>
        )}

        {/* Model Grid */}
        {!isLoading && models.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {models.map((model, index) => (
                <ModelCard
                  key={model._id}
                  model={model}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
};

export default DashboardPage;
