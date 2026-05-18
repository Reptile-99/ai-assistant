import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ErrorResponse } from '../middlewares/error.middleware';
import { sendTokenResponse, generateAccessToken } from '../utils/auth';
import { AuthRequest } from '../types/express';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Save refresh token to user before response (or just generate it)
    const refreshToken = sendTokenResponse(user, 201, res);
    
    user.refreshTokens.push(refreshToken);
    await user.save();
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const refreshToken = sendTokenResponse(user, 200, res);

    // Save refresh token to user (manage multiple devices if needed, here we just append)
    user.refreshTokens.push(refreshToken);
    await user.save();
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public (uses cookie)
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new ErrorResponse('No refresh token provided', 401));
    }

    // Find user by refresh token
    const user = await User.findOne({ refreshTokens: token });

    if (!user) {
      return next(new ErrorResponse('Invalid refresh token', 403));
    }

    // Verify token
    jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err || user._id.toString() !== decoded.id) {
        return next(new ErrorResponse('Invalid refresh token', 403));
      }

      const accessToken = generateAccessToken(user._id);
      res.json({ success: true, accessToken });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout / Clear Cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Remove refresh token from DB
      await User.findOneAndUpdate(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } }
      );
    }

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
