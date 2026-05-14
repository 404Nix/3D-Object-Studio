import User from '../models/User.js';
import tokenService from '../services/tokenService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      throw new AppError(`A user with this ${field} already exists`, 409);
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokenPair(user._id);

    // Store hashed refresh token
    const hashedToken = tokenService.hashToken(refreshToken);
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashedToken },
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, tokenService.getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokenPair(user._id);

    // Store hashed refresh token, cleanup old tokens
    const hashedToken = tokenService.hashToken(refreshToken);
    user.cleanExpiredTokens();
    user.refreshTokens.push(hashedToken);
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, tokenService.getRefreshCookieOptions());

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove the refresh token from DB
      const hashedToken = tokenService.hashToken(refreshToken);
      await User.findOneAndUpdate(
        { refreshTokens: hashedToken },
        { $pull: { refreshTokens: hashedToken } }
      );
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/auth',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires refresh token cookie)
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken: oldRefreshToken } = req.cookies;

    if (!oldRefreshToken) {
      throw new AppError('Refresh token not found', 401);
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = tokenService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Find user and check if token exists
    const hashedOldToken = tokenService.hashToken(oldRefreshToken);
    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user) {
      throw new AppError('User not found', 401);
    }

    const tokenIndex = user.refreshTokens.indexOf(hashedOldToken);
    if (tokenIndex === -1) {
      // Token reuse detected — clear all refresh tokens (security measure)
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      throw new AppError('Token reuse detected. All sessions invalidated.', 401);
    }

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = tokenService.generateTokenPair(user._id);
    const hashedNewToken = tokenService.hashToken(newRefreshToken);

    // Replace old token with new one
    user.refreshTokens[tokenIndex] = hashedNewToken;
    user.cleanExpiredTokens();
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, tokenService.getRefreshCookieOptions());

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
