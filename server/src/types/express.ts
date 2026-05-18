import { Request } from 'express';

export interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: IUser | null;
}
