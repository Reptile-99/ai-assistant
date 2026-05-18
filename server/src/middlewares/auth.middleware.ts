import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import User from '../models/User';
import { ErrorResponse } from './error.middleware';

interface DecodedToken {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as DecodedToken;

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ErrorResponse('Token expired', 401));
    }
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};
