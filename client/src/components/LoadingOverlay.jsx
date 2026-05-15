import { motion } from 'framer-motion';


const LoadingOverlay = ({ progress = 0, message = 'Loading model...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(9, 9, 15, 0.9)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex flex-col items-center gap-6">

        <div className="animate-float" style={{ fontSize: '3rem' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 8L56 22V46L32 60L8 46V22L32 8Z"
              stroke="url(#loadGrad)"
              strokeWidth="2"
              className="animate-pulse-glow"
              style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))' }}
            />
            <path
              d="M32 8V60M8 22L56 46M56 22L8 46"
              stroke="url(#loadGrad)"
              strokeWidth="1"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="loadGrad" x1="8" y1="8" x2="56" y2="60">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>

        <div className="progress-bar" style={{ width: '200px' }}>
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
          />
        </div>
        <p
          className="gradient-text"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}
        >
          {progress}%
        </p>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;
