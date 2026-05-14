import tokenService from '../services/tokenService.js';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the user to req.user.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const decoded = tokenService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('User not found. Token may be invalid.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(error);
  }
};

export default auth;
