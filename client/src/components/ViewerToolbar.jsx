import { motion } from 'framer-motion';
import {
  HiOutlineArrowPath,
  HiOutlineCube,
  HiOutlineViewfinderCircle,
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineSquare3Stack3D,
} from 'react-icons/hi2';

const ViewerToolbar = ({
  onReset,
  onToggleWireframe,
  onToggleAutoRotate,
  onBack,
  wireframe = false,
  autoRotate = false,
  modelName = 'Untitled',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(9, 9, 15, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      {/* Left — Back + Model Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="btn-icon"
          title="Back to Dashboard"
          id="viewer-back-btn"
        >
          <HiOutlineArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <HiOutlineCube style={{ color: 'var(--accent-purple)', fontSize: '1.2rem' }} />
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {modelName}
          </span>
        </div>
      </div>

      {/* Center — Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="btn-icon"
          title="Reset Camera"
          id="viewer-reset-btn"
        >
          <HiOutlineViewfinderCircle />
        </button>

        <button
          onClick={onToggleWireframe}
          className={`btn-icon ${wireframe ? 'active' : ''}`}
          title="Toggle Wireframe"
          id="viewer-wireframe-btn"
        >
          <HiOutlineSquare3Stack3D />
        </button>

        <button
          onClick={onToggleAutoRotate}
          className={`btn-icon ${autoRotate ? 'active' : ''}`}
          title="Toggle Auto-Rotation"
          id="viewer-autorotate-btn"
        >
          <HiOutlineArrowPath />
        </button>
      </div>

      {/* Right — Info */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-help"
          title="Mouse: Left-Click to Orbit, Right-Click to Pan, Scroll to Zoom | Touch: 1-finger Orbit, 2-finger Pan, Pinch to Zoom"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <HiOutlineInformationCircle />
          <span>Orbit · Zoom · Pan</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewerToolbar;
