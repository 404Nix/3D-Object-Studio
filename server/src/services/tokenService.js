import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Token Service — handles JWT access and refresh token lifecycle.
 */
const tokenService = {
  /**
   * Generate a short-lived access token.
   */
  generateAccessToken(userId) {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });
  },

  /**
   * Generate a long-lived refresh token.
   */
  generateRefreshToken(userId) {
    return jwt.sign({ userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });
  },

  /**
   * Verify an access token. Returns decoded payload or throws.
   */
  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  },

  /**
   * Verify a refresh token. Returns decoded payload or throws.
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  },

  /**
   * Hash a refresh token for storage (don't store raw tokens in DB).
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /**
   * Generate both access + refresh tokens and return them.
   */
  generateTokenPair(userId) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  },

  /**
   * Cookie options for refresh token.
   */
  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth',
    };
  },
};

export default tokenService;
