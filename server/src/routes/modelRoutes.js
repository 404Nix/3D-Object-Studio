import { Router } from 'express';
import { body } from 'express-validator';
import {
  uploadModel,
  getModels,
  getModelById,
  deleteModel,
  saveState,
  getState,
} from '../controllers/modelController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(auth);


router.post('/upload', uploadLimiter, upload.single('model'), uploadModel);


router.get('/', getModels);


router.get('/:id', getModelById);


router.delete('/:id', deleteModel);


router.post(
  '/:id/state',
  validate([
    body('cameraPosition')
      .optional()
      .isObject()
      .withMessage('Camera position must be an object with x, y, z'),
    body('cameraTarget')
      .optional()
      .isObject()
      .withMessage('Camera target must be an object with x, y, z'),
    body('zoom').optional().isNumeric().withMessage('Zoom must be a number'),
    body('objectRotation')
      .optional()
      .isObject()
      .withMessage('Object rotation must be an object with x, y, z'),
    body('wireframe').optional().isBoolean().withMessage('Wireframe must be boolean'),
    body('autoRotate').optional().isBoolean().withMessage('Auto-rotate must be boolean'),
  ]),
  saveState
);


router.get('/:id/state', getState);

export default router;
