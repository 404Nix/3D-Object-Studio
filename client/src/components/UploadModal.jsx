import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineCloudArrowUp, HiOutlineXMark, HiOutlineCube } from 'react-icons/hi2';
import { uploadModel } from '../store/modelsSlice.js';
import toast from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isUploading } = useSelector((state) => state.models);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'glb') {
      toast.error('Only .glb files are allowed');
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await dispatch(uploadModel(selectedFile)).unwrap();
      toast.success('Model uploaded successfully!');
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast.error(error || 'Upload failed');
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      onClose();
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-strong rounded-2xl p-6 w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Upload 3D Model
            </h2>
            <button
              onClick={handleClose}
              className="btn-icon"
              disabled={isUploading}
              id="upload-close-btn"
            >
              <HiOutlineXMark />
            </button>
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <HiOutlineCube style={{ fontSize: '2.5rem', color: 'var(--accent-purple)' }} />
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formatSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-sm"
                  style={{ color: 'var(--accent-cyan)' }}
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <HiOutlineCloudArrowUp
                  style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}
                />
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Drag & drop your <span className="gradient-text font-semibold">.glb</span> file here
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    or click to browse · Max 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".glb"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-input"
          />

          {/* Upload Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="btn-secondary"
              disabled={isUploading}
              id="upload-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="btn-primary"
              disabled={!selectedFile || isUploading}
              id="upload-submit-btn"
            >
              {isUploading ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <HiOutlineCloudArrowUp />
                  Upload Model
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadModal;
