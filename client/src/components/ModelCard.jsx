import { motion } from 'framer-motion';
import { HiOutlineCube, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const ModelCard = ({ model, onDelete, index = 0 }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card group"
      style={{ cursor: 'pointer' }}
    >
      <div
        className="relative flex items-center justify-center rounded-lg mb-4 overflow-hidden"
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-tertiary))',
          border: '1px solid var(--border-color)',
        }}
        onClick={() => navigate(`/viewer/${model._id}`)}
      >
        <div className="animate-float" style={{ opacity: 0.6 }}>
          <HiOutlineCube
            style={{ fontSize: '3rem', color: 'var(--accent-purple)' }}
          />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(168, 85, 247, 0.1)' }}
        >
          <div className="btn-primary" style={{ pointerEvents: 'none' }}>
            <HiOutlineEye />
            View Model
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3
          className="font-semibold truncate"
          style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}
          title={model.originalName}
        >
          {model.originalName}
        </h3>

        <div className="flex items-center justify-between">
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatSize(model.fileSize)}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {formatDate(model.uploadDate || model.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => navigate(`/viewer/${model._id}`)}
            className="btn-primary flex-1"
            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
            id={`view-model-${model._id}`}
          >
            <HiOutlineEye style={{ fontSize: '1rem' }} />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(model._id);
            }}
            className="btn-icon"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
            title="Delete model"
            id={`delete-model-${model._id}`}
          >
            <HiOutlineTrash />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelCard;
