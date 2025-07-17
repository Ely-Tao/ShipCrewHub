import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.pool';
import { AuthRequest } from '../middleware/auth';
import { User, UserRole } from '../types/index';

export class UserController {
  // 用户注册
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // 验证必填字段
      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      // 检查用户名和邮箱是否已存在
      const connection = await pool.getConnection();
      try {
        const [existingUsers] = await connection.execute<any[]>(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [username, email]
        );

        if (existingUsers.length > 0) {
          res.status(409).json({ error: 'Username or email already exists' });
          return;
        }

        // 加密密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 创建用户
        const [result] = await connection.execute<any>(
          `INSERT INTO users (username, email, password, role, status, created_at) 
           VALUES (?, ?, ?, ?, 'active', NOW())`,
          [username, email, hashedPassword, role]
        );

        const userId = result.insertId;

        // 返回用户信息（不包含密码）
        const [newUser] = await connection.execute<any[]>(
          'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?',
          [userId]
        );

        res.status(201).json({
          message: 'User created successfully',
          user: newUser[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // 用户登录
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const connection = await pool.getConnection();
      try {
        // 查找用户
        const [users] = await connection.execute<any[]>(
          'SELECT * FROM users WHERE username = ? AND status = "active"',
          [username]
        );

        if (users.length === 0) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        const user = users[0];

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        // 生成JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          jwtSecret,
          { expiresIn: '24h' }
        );

        // 更新最后登录时间
        await connection.execute(
          'UPDATE users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

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
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }

  // 获取用户列表（管理员权限）
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, role, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = '1=1';
      const params: any[] = [];

      if (role) {
        whereClause += ' AND role = ?';
        params.push(role);
      }

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const connection = await pool.getConnection();
      try {
        // 获取用户列表
        const [users] = await connection.execute<any[]>(
          `SELECT id, username, email, role, status, created_at, last_login 
           FROM users 
           WHERE ${whereClause}
           ORDER BY created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, Number(limit), offset]
        );

        // 获取总数
        const [countResult] = await connection.execute<any[]>(
          `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
          params
        );

        const total = countResult[0].total;

        res.json({
          users,
          pagination: {
            current: Number(page),
            pageSize: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  // 更新用户信息
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { username, email, role, status } = req.body;

      const connection = await pool.getConnection();
      try {
        // 检查用户是否存在
        const [existingUsers] = await connection.execute<any[]>(
          'SELECT id FROM users WHERE id = ?',
          [userId]
        );

        if (existingUsers.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        // 检查用户名和邮箱是否被其他用户使用
        if (username || email) {
          const [duplicateCheck] = await connection.execute<any[]>(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
          );

          if (duplicateCheck.length > 0) {
            res.status(409).json({ error: 'Username or email already exists' });
            return;
          }
        }

        // 构建更新SQL
        const updates: string[] = [];
        const params: any[] = [];

        if (username) {
          updates.push('username = ?');
          params.push(username);
        }
        if (email) {
          updates.push('email = ?');
          params.push(email);
        }
        if (role) {
          updates.push('role = ?');
          params.push(role);
        }
        if (status) {
          updates.push('status = ?');
          params.push(status);
        }

        if (updates.length === 0) {
          res.status(400).json({ error: 'No fields to update' });
          return;
        }

        updates.push('updated_at = NOW()');
        params.push(userId);

        // 执行更新
        await connection.execute(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        // 获取更新后的用户信息
        const [updatedUser] = await connection.execute<any[]>(
          'SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE id = ?',
          [userId]
        );

        res.json({
          message: 'User updated successfully',
          user: updatedUser[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // 删除用户
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const connection = await pool.getConnection();
      try {
        // 检查用户是否存在
        const [existingUsers] = await connection.execute<any[]>(
          'SELECT id FROM users WHERE id = ?',
          [userId]
        );

        if (existingUsers.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        // 软删除：将状态设置为inactive
        await connection.execute(
          'UPDATE users SET status = "inactive", updated_at = NOW() WHERE id = ?',
          [userId]
        );

        res.json({ message: 'User deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // 修改密码
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      const connection = await pool.getConnection();
      try {
        // 获取用户当前密码
        const [users] = await connection.execute<any[]>(
          'SELECT password FROM users WHERE id = ?',
          [userId]
        );

        if (users.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        // 验证当前密码
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isCurrentPasswordValid) {
          res.status(401).json({ error: 'Current password is incorrect' });
          return;
        }

        // 加密新密码
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 更新密码
        await connection.execute(
          'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
          [hashedNewPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}
