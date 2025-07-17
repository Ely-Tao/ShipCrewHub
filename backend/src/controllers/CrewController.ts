import { Request, Response } from 'express';
import { pool } from '../config/database.pool';
import { AuthRequest } from '../middleware/auth';
import { CrewInfo } from '../types/index';

export class CrewController {
  // 获取船员列表
  async getCrewList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        name, 
        ship_id, 
        department, 
        status 
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = '1=1';
      const params: any[] = [];

      if (name) {
        whereClause += ' AND name LIKE ?';
        params.push(`%${name}%`);
      }

      if (ship_id) {
        whereClause += ' AND ship_id = ?';
        params.push(ship_id);
      }

      if (department) {
        whereClause += ' AND department = ?';
        params.push(department);
      }

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const connection = await pool.getConnection();
      try {
        // 获取船员列表
        const [crews] = await connection.execute<any[]>(
          `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ships s ON ci.ship_id = s.id
           WHERE ${whereClause}
           ORDER BY ci.created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, Number(limit), offset]
        );

        // 获取总数
        const [countResult] = await connection.execute<any[]>(
          `SELECT COUNT(*) as total FROM crew_info WHERE ${whereClause}`,
          params
        );

        const total = countResult[0].total;

        res.json({
          crews,
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
      console.error('Get crew list error:', error);
      res.status(500).json({ error: 'Failed to get crew list' });
    }
  }

  // 获取单个船员信息
  async getCrewById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { crewId } = req.params;

      const connection = await pool.getConnection();
      try {
        const [crews] = await connection.execute<any[]>(
          `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ships s ON ci.ship_id = s.id
           WHERE ci.id = ?`,
          [crewId]
        );

        if (crews.length === 0) {
          res.status(404).json({ error: 'Crew member not found' });
          return;
        }

        res.json(crews[0]);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get crew by ID error:', error);
      res.status(500).json({ error: 'Failed to get crew information' });
    }
  }

  // 添加船员
  async createCrew(req: AuthRequest, res: Response): Promise<void> {
    try {
      const crewData = req.body;

      // 验证必填字段
      const requiredFields = ['name', 'gender', 'birth_date', 'id_card', 'phone', 'department'];
      for (const field of requiredFields) {
        if (!crewData[field]) {
          res.status(400).json({ error: `${field} is required` });
          return;
        }
      }

      const connection = await pool.getConnection();
      try {
        // 检查身份证号是否已存在
        const [existingCrew] = await connection.execute<any[]>(
          'SELECT id FROM crew_info WHERE id_card = ?',
          [crewData.id_card]
        );

        if (existingCrew.length > 0) {
          res.status(409).json({ error: 'Crew member with this ID card already exists' });
          return;
        }

        // 插入船员信息
        const [result] = await connection.execute<any>(
          `INSERT INTO crew_info (
            name, gender, birth_date, id_card, marital_status, nationality, 
            hometown, phone, emergency_contact_name, emergency_contact_phone,
            education, school, major, join_date, ship_id, department, 
            salary_grade, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            crewData.name,
            crewData.gender,
            crewData.birth_date,
            crewData.id_card,
            crewData.marital_status || 'single',
            crewData.nationality || 'Chinese',
            crewData.hometown,
            crewData.phone,
            crewData.emergency_contact_name,
            crewData.emergency_contact_phone,
            crewData.education,
            crewData.school,
            crewData.major,
            crewData.join_date || new Date(),
            crewData.ship_id,
            crewData.department,
            crewData.salary_grade,
            crewData.status || 'active'
          ]
        );

        const crewId = result.insertId;

        // 获取新创建的船员信息
        const [newCrew] = await connection.execute<any[]>(
          `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ships s ON ci.ship_id = s.id
           WHERE ci.id = ?`,
          [crewId]
        );

        res.status(201).json({
          message: 'Crew member created successfully',
          crew: newCrew[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create crew error:', error);
      res.status(500).json({ error: 'Failed to create crew member' });
    }
  }

  // 更新船员信息
  async updateCrew(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { crewId } = req.params;
      const updateData = req.body;

      const connection = await pool.getConnection();
      try {
        // 检查船员是否存在
        const [existingCrew] = await connection.execute<any[]>(
          'SELECT id FROM crew_info WHERE id = ?',
          [crewId]
        );

        if (existingCrew.length === 0) {
          res.status(404).json({ error: 'Crew member not found' });
          return;
        }

        // 如果更新身份证号，检查是否与其他人重复
        if (updateData.id_card) {
          const [duplicateCheck] = await connection.execute<any[]>(
            'SELECT id FROM crew_info WHERE id_card = ? AND id != ?',
            [updateData.id_card, crewId]
          );

          if (duplicateCheck.length > 0) {
            res.status(409).json({ error: 'ID card already exists' });
            return;
          }
        }

        // 构建更新SQL
        const allowedFields = [
          'name', 'gender', 'birth_date', 'id_card', 'marital_status', 
          'nationality', 'hometown', 'phone', 'emergency_contact_name', 
          'emergency_contact_phone', 'education', 'school', 'major', 
          'join_date', 'ship_id', 'department', 'salary_grade', 'status'
        ];

        const updates: string[] = [];
        const params: any[] = [];

        for (const field of allowedFields) {
          if (updateData[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(updateData[field]);
          }
        }

        if (updates.length === 0) {
          res.status(400).json({ error: 'No fields to update' });
          return;
        }

        updates.push('updated_at = NOW()');
        params.push(crewId);

        // 执行更新
        await connection.execute(
          `UPDATE crew_info SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        // 获取更新后的船员信息
        const [updatedCrew] = await connection.execute<any[]>(
          `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ships s ON ci.ship_id = s.id
           WHERE ci.id = ?`,
          [crewId]
        );

        res.json({
          message: 'Crew member updated successfully',
          crew: updatedCrew[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update crew error:', error);
      res.status(500).json({ error: 'Failed to update crew member' });
    }
  }

  // 删除船员
  async deleteCrew(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { crewId } = req.params;

      const connection = await pool.getConnection();
      try {
        // 检查船员是否存在
        const [existingCrew] = await connection.execute<any[]>(
          'SELECT id FROM crew_info WHERE id = ?',
          [crewId]
        );

        if (existingCrew.length === 0) {
          res.status(404).json({ error: 'Crew member not found' });
          return;
        }

        // 软删除：将状态设置为inactive
        await connection.execute(
          'UPDATE crew_info SET status = "inactive", updated_at = NOW() WHERE id = ?',
          [crewId]
        );

        res.json({ message: 'Crew member deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete crew error:', error);
      res.status(500).json({ error: 'Failed to delete crew member' });
    }
  }

  // 批量操作船员
  async bulkUpdateCrew(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { crewIds, action, data } = req.body;

      if (!crewIds || !Array.isArray(crewIds) || crewIds.length === 0) {
        res.status(400).json({ error: 'crewIds array is required' });
        return;
      }

      const connection = await pool.getConnection();
      try {
        switch (action) {
          case 'assign_ship':
            if (!data.ship_id) {
              res.status(400).json({ error: 'ship_id is required for assign_ship action' });
              return;
            }
            await connection.execute(
              `UPDATE crew_info SET ship_id = ?, updated_at = NOW() WHERE id IN (${crewIds.map(() => '?').join(',')})`,
              [data.ship_id, ...crewIds]
            );
            break;

          case 'change_status':
            if (!data.status) {
              res.status(400).json({ error: 'status is required for change_status action' });
              return;
            }
            await connection.execute(
              `UPDATE crew_info SET status = ?, updated_at = NOW() WHERE id IN (${crewIds.map(() => '?').join(',')})`,
              [data.status, ...crewIds]
            );
            break;

          case 'update_department':
            if (!data.department) {
              res.status(400).json({ error: 'department is required for update_department action' });
              return;
            }
            await connection.execute(
              `UPDATE crew_info SET department = ?, updated_at = NOW() WHERE id IN (${crewIds.map(() => '?').join(',')})`,
              [data.department, ...crewIds]
            );
            break;

          default:
            res.status(400).json({ error: 'Invalid action' });
            return;
        }

        res.json({ message: `Bulk ${action} completed successfully` });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Bulk update crew error:', error);
      res.status(500).json({ error: 'Failed to perform bulk update' });
    }
  }
}
