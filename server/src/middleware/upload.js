import multer from 'multer';
import { AppError } from './errorHandler.js';
import env from '../config/env.js';

/**
 * Multer configuration for .glb file uploads.
 * Uses memory storage (buffer) for S3 upload or local write.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only .glb files
  const allowedMimes = ['model/gltf-binary', 'application/octet-stream'];
  const ext = file.originalname.toLowerCase().split('.').pop();

  if (ext === 'glb' || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only .glb files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 50MB default
    files: 1,
  },
});

export default upload;
