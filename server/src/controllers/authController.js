import User from "../models/User.js";
import tokenService from "../services/tokenService.js";
import { AppError } from "../middleware/errorHandler.js";


export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      throw new AppError(`A user with this ${field} already exists`, 409);
    }
    const user = await User.create({ username, email, password });
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user._id,
    );
    const hashedToken = tokenService.hashToken(refreshToken);
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashedToken },
    });
    res.cookie(
      "refreshToken",
      refreshToken,
      tokenService.getRefreshCookieOptions(),
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      "+password +refreshTokens",
    );
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user._id,
    );
    const hashedToken = tokenService.hashToken(refreshToken);
    user.cleanExpiredTokens();
    user.refreshTokens.push(hashedToken);
    await user.save({ validateBeforeSave: false });
    res.cookie(
      "refreshToken",
      refreshToken,
      tokenService.getRefreshCookieOptions(),
    );
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const hashedToken = tokenService.hashToken(refreshToken);
      await User.findOneAndUpdate(
        { refreshTokens: hashedToken },
        { $pull: { refreshTokens: hashedToken } },
      );
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/api/auth",
    });
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const refresh = async (req, res, next) => {
  try {
    const { refreshToken: oldRefreshToken } = req.cookies;
    if (!oldRefreshToken) {
      throw new AppError("Refresh token not found", 401);
    }
    let decoded;
    try {
      decoded = tokenService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
    const hashedOldToken = tokenService.hashToken(oldRefreshToken);
    const user = await User.findById(decoded.userId).select("+refreshTokens");
    if (!user) {
      throw new AppError("User not found", 401);
    }
    const tokenIndex = user.refreshTokens.indexOf(hashedOldToken);
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      throw new AppError(
        "Token reuse detected. All sessions invalidated.",
        401,
      );
    }
    const { accessToken, refreshToken: newRefreshToken } =
      tokenService.generateTokenPair(user._id);
    const hashedNewToken = tokenService.hashToken(newRefreshToken);
    user.refreshTokens[tokenIndex] = hashedNewToken;
    user.cleanExpiredTokens();
    await user.save({ validateBeforeSave: false });
    res.cookie(
      "refreshToken",
      newRefreshToken,
      tokenService.getRefreshCookieOptions(),
    );
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



export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
