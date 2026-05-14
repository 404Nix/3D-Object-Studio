import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refresh, getMe } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  validate([
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3-30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase, one uppercase, and one number'),
  ]),
  register
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  validate([
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

/**
 * POST /api/auth/logout
 */
router.post('/logout', logout);

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', refresh);

/**
 * GET /api/auth/me
 */
router.get('/me', auth, getMe);

export default router;
