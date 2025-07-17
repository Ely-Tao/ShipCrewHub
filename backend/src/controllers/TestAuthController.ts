import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 临时内存数据库，用于测试
const testUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@shipcrewdb.com',
    password: 'admin', // 简化版，直接使用明文密码
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    username: 'hr_manager',
    email: 'hr@shipcrewdb.com',
    password: 'password',
    role: 'hr_manager',
    status: 'active'
  }
];

export class TestAuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      // 查找用户
      const user = testUsers.find(u => u.username === username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // 验证密码 (简化版，直接比较)
      if (user.password !== password) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // 返回响应
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}
