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
      
      // 确保 page 和 limit 是正确的数字
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 10));
      const offsetNum = (pageNum - 1) * limitNum;

      let whereClause = '1=1';
      const filterParams: any[] = [];

      if (name) {
        whereClause += ' AND name LIKE ?';
        filterParams.push(`%${name}%`);
      }

      if (ship_id) {
        whereClause += ' AND ship_id = ?';
        filterParams.push(ship_id);
      }

      if (department) {
        whereClause += ' AND department = ?';
        filterParams.push(department);
      }

      if (status) {
        whereClause += ' AND status = ?';
        filterParams.push(status);
      }

      const connection = await pool.getConnection();
      try {
        // 暂时使用字符串插值来避免参数绑定问题
        const listQuery = `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ship_info s ON ci.ship_id = s.id
           WHERE ${whereClause}
           ORDER BY ci.created_at DESC 
           LIMIT ${limitNum} OFFSET ${offsetNum}`;
        
        console.log('Executing crew query:', listQuery);
        console.log('With params:', filterParams);
        
        const [crews] = await connection.execute<any[]>(listQuery, filterParams);

        // 获取总数 - 只传递过滤参数
        const countQuery = `SELECT COUNT(*) as total FROM crew_info WHERE ${whereClause}`;
        const [countResult] = await connection.execute<any[]>(countQuery, filterParams);

        const total = countResult[0].total;

        res.json({
          crews,
          pagination: {
            current: pageNum,
            pageSize: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
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
           LEFT JOIN ship_info s ON ci.ship_id = s.id
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
      console.log('Creating crew with data:', JSON.stringify(crewData, null, 2));

      // 验证必填字段
      const requiredFields = ['name', 'gender', 'birth_date', 'id_card', 'phone', 'department'];
      for (const field of requiredFields) {
        if (!crewData[field]) {
          console.log(`Missing required field: ${field}`);
          res.status(400).json({ error: `${field} is required` });
          return;
        }
      }

      const connection = await pool.getConnection();
      try {
        // 值转换映射
        const genderMap: { [key: string]: string } = {
          'male': '男',
          'female': '女'
        };

        const maritalStatusMap: { [key: string]: string } = {
          'single': '未婚',
          'married': '已婚',
          'divorced': '离异',
          'widowed': '丧偶'
        };

        const educationMap: { [key: string]: string } = {
          'primary': '小学',
          'junior': '初中',
          'senior': '高中',
          'vocational': '中专',
          'college': '大专',
          'bachelor': '本科',
          'master': '硕士',
          'doctor': '博士'
        };

        const departmentMap: { [key: string]: string } = {
          'deck': '甲板部',
          'engine': '机舱部'
        };

        // 转换值
        const convertedData = {
          ...crewData,
          gender: genderMap[crewData.gender] || crewData.gender,
          marital_status: crewData.marital_status ? (maritalStatusMap[crewData.marital_status] || crewData.marital_status) : '未婚',
          education: crewData.education ? (educationMap[crewData.education] || crewData.education) : null,
          department: departmentMap[crewData.department] || crewData.department
        };

        console.log('Converted data:', JSON.stringify(convertedData, null, 2));

        // 检查身份证号是否已存在
        const [existingCrew] = await connection.execute<any[]>(
          'SELECT id FROM crew_info WHERE id_card = ?',
          [convertedData.id_card]
        );

        if (existingCrew.length > 0) {
          res.status(409).json({ error: 'Crew member with this ID card already exists' });
          return;
        }

        // 准备插入参数
        const insertParams = [
          convertedData.name,
          convertedData.gender,
          convertedData.birth_date,
          convertedData.id_card,
          convertedData.marital_status || '未婚',
          convertedData.nationality || 'Chinese',
          convertedData.hometown || '',  // 不能为 null
          convertedData.phone,
          convertedData.emergency_contact_name || '',  // 不能为 null
          convertedData.emergency_contact_phone || '',  // 不能为 null
          convertedData.education || '高中',  // 不能为 null，默认高中
          convertedData.school || null,  // 可以为 null
          convertedData.major || null,   // 可以为 null
          convertedData.join_date ? new Date(convertedData.join_date) : new Date(),
          convertedData.ship_id || null,  // 可以为 null
          convertedData.department,
          convertedData.salary_grade || '1',  // 不能为 null，默认等级1
          convertedData.status || 'active'
        ];

        console.log('Insert parameters:', insertParams);

        // 插入船员信息
        const [result] = await connection.execute<any>(
          `INSERT INTO crew_info (
            name, gender, birth_date, id_card, marital_status, nationality, 
            hometown, phone, emergency_contact_name, emergency_contact_phone,
            education, school, major, join_date, ship_id, department, 
            salary_grade, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          insertParams
        );

        const crewId = result.insertId;

        // 获取新创建的船员信息
        const [newCrew] = await connection.execute<any[]>(
          `SELECT 
            ci.*, 
            s.name as ship_name,
            s.ship_number
           FROM crew_info ci
           LEFT JOIN ship_info s ON ci.ship_id = s.id
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
           LEFT JOIN ship_info s ON ci.ship_id = s.id
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
