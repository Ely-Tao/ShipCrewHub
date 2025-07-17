import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types/index';

export interface AuthRequest extends Request {
  user?: User;
}

// 临时的用户数据，和TestAuthController中的保持一致
const tempUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@shipcrewdb.com',
    password: 'admin', // 简化版，直接使用明文密码
    role: UserRole.ADMIN,
    status: 'active'
  },
  {
    id: 2,
    username: 'hr_manager',
    email: 'hr@shipcrewdb.com',
    password: 'password',
    role: UserRole.HR_MANAGER,
    status: 'active'
  }
];

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { id: number };

    // 从临时用户数据中查找用户
    const user = tempUsers.find(u => u.id === decoded.id && u.status === 'active');

    if (!user) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    req.user = user as User;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireHRManager = requireRole([UserRole.ADMIN, UserRole.HR_MANAGER]);
export const requireShipManager = requireRole([UserRole.ADMIN, UserRole.SHIP_MANAGER]);
