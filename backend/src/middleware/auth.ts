import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.pool';
import { User, UserRole } from '../types/index';

export interface AuthRequest extends Request {
  user?: User;
}

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

    // 从数据库获取用户信息
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute<any[]>(
        'SELECT * FROM users WHERE id = ? AND status = "active"',
        [decoded.id]
      );

      if (rows.length === 0) {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      req.user = rows[0] as User;
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  };
};

export const authorizeOwnerOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // 管理员可以访问所有资源
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // 检查是否为资源所有者
  const resourceUserId = req.params.userId || req.body.userId;
  if (resourceUserId && parseInt(resourceUserId) === req.user.id) {
    next();
    return;
  }

  res.status(403).json({ error: 'Access denied' });
};
