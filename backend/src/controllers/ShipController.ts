import { Request, Response } from 'express';
import { pool } from '../config/database.pool';
import { AuthRequest } from '../middleware/auth';

export class ShipController {
  // 获取船舶列表
  async getShipList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        name, 
        ship_number, 
        type, 
        status 
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause = '1=1';
      const params: any[] = [];

      if (name) {
        whereClause += ' AND name LIKE ?';
        params.push(`%${name}%`);
      }

      if (ship_number) {
        whereClause += ' AND ship_number LIKE ?';
        params.push(`%${ship_number}%`);
      }

      if (type) {
        whereClause += ' AND type = ?';
        params.push(type);
      }

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const connection = await pool.getConnection();
      try {
        // 获取船舶列表及船员数量
        const [ships] = await connection.execute<any[]>(
          `SELECT 
            s.*,
            COUNT(ci.id) as crew_count
           FROM ships s
           LEFT JOIN crew_info ci ON s.id = ci.ship_id AND ci.status = 'active'
           WHERE ${whereClause}
           GROUP BY s.id
           ORDER BY s.created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, Number(limit), offset]
        );

        // 获取总数
        const [countResult] = await connection.execute<any[]>(
          `SELECT COUNT(*) as total FROM ships WHERE ${whereClause}`,
          params
        );

        const total = countResult[0].total;

        res.json({
          ships,
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
      console.error('Get ship list error:', error);
      res.status(500).json({ error: 'Failed to get ship list' });
    }
  }

  // 获取单个船舶信息
  async getShipById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { shipId } = req.params;

      const connection = await pool.getConnection();
      try {
        // 获取船舶基本信息
        const [ships] = await connection.execute<any[]>(
          `SELECT 
            s.*,
            COUNT(ci.id) as crew_count
           FROM ships s
           LEFT JOIN crew_info ci ON s.id = ci.ship_id AND ci.status = 'active'
           WHERE s.id = ?
           GROUP BY s.id`,
          [shipId]
        );

        if (ships.length === 0) {
          res.status(404).json({ error: 'Ship not found' });
          return;
        }

        // 获取船员列表
        const [crew] = await connection.execute<any[]>(
          `SELECT id, name, department, phone, join_date, status
           FROM crew_info 
           WHERE ship_id = ? AND status = 'active'
           ORDER BY department, name`,
          [shipId]
        );

        res.json({
          ...ships[0],
          crew
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get ship by ID error:', error);
      res.status(500).json({ error: 'Failed to get ship information' });
    }
  }

  // 添加船舶
  async createShip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const shipData = req.body;

      // 验证必填字段
      const requiredFields = ['name', 'ship_number', 'type'];
      for (const field of requiredFields) {
        if (!shipData[field]) {
          res.status(400).json({ error: `${field} is required` });
          return;
        }
      }

      const connection = await pool.getConnection();
      try {
        // 检查船舶编号是否已存在
        const [existingShip] = await connection.execute<any[]>(
          'SELECT id FROM ships WHERE ship_number = ?',
          [shipData.ship_number]
        );

        if (existingShip.length > 0) {
          res.status(409).json({ error: 'Ship number already exists' });
          return;
        }

        // 插入船舶信息
        const [result] = await connection.execute<any>(
          `INSERT INTO ships (
            name, ship_number, type, tonnage, build_year, 
            flag_country, classification_society, imo_number, 
            call_sign, max_crew, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            shipData.name,
            shipData.ship_number,
            shipData.type,
            shipData.tonnage,
            shipData.build_year,
            shipData.flag_country,
            shipData.classification_society,
            shipData.imo_number,
            shipData.call_sign,
            shipData.max_crew,
            shipData.status || 'active'
          ]
        );

        const shipId = result.insertId;

        // 获取新创建的船舶信息
        const [newShip] = await connection.execute<any[]>(
          'SELECT * FROM ships WHERE id = ?',
          [shipId]
        );

        res.status(201).json({
          message: 'Ship created successfully',
          ship: newShip[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create ship error:', error);
      res.status(500).json({ error: 'Failed to create ship' });
    }
  }

  // 更新船舶信息
  async updateShip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { shipId } = req.params;
      const updateData = req.body;

      const connection = await pool.getConnection();
      try {
        // 检查船舶是否存在
        const [existingShip] = await connection.execute<any[]>(
          'SELECT id FROM ships WHERE id = ?',
          [shipId]
        );

        if (existingShip.length === 0) {
          res.status(404).json({ error: 'Ship not found' });
          return;
        }

        // 如果更新船舶编号，检查是否与其他船舶重复
        if (updateData.ship_number) {
          const [duplicateCheck] = await connection.execute<any[]>(
            'SELECT id FROM ships WHERE ship_number = ? AND id != ?',
            [updateData.ship_number, shipId]
          );

          if (duplicateCheck.length > 0) {
            res.status(409).json({ error: 'Ship number already exists' });
            return;
          }
        }

        // 构建更新SQL
        const allowedFields = [
          'name', 'ship_number', 'type', 'tonnage', 'build_year',
          'flag_country', 'classification_society', 'imo_number',
          'call_sign', 'max_crew', 'status'
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
        params.push(shipId);

        // 执行更新
        await connection.execute(
          `UPDATE ships SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        // 获取更新后的船舶信息
        const [updatedShip] = await connection.execute<any[]>(
          'SELECT * FROM ships WHERE id = ?',
          [shipId]
        );

        res.json({
          message: 'Ship updated successfully',
          ship: updatedShip[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update ship error:', error);
      res.status(500).json({ error: 'Failed to update ship' });
    }
  }

  // 删除船舶
  async deleteShip(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { shipId } = req.params;

      const connection = await pool.getConnection();
      try {
        // 检查船舶是否存在
        const [existingShip] = await connection.execute<any[]>(
          'SELECT id FROM ships WHERE id = ?',
          [shipId]
        );

        if (existingShip.length === 0) {
          res.status(404).json({ error: 'Ship not found' });
          return;
        }

        // 检查是否有船员分配到这艘船
        const [assignedCrew] = await connection.execute<any[]>(
          'SELECT COUNT(*) as count FROM crew_info WHERE ship_id = ? AND status = "active"',
          [shipId]
        );

        if (assignedCrew[0].count > 0) {
          res.status(400).json({ 
            error: 'Cannot delete ship with active crew members. Please reassign crew first.' 
          });
          return;
        }

        // 软删除：将状态设置为inactive
        await connection.execute(
          'UPDATE ships SET status = "inactive", updated_at = NOW() WHERE id = ?',
          [shipId]
        );

        res.json({ message: 'Ship deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete ship error:', error);
      res.status(500).json({ error: 'Failed to delete ship' });
    }
  }

  // 获取船舶统计信息
  async getShipStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const connection = await pool.getConnection();
      try {
        // 获取各种统计信息
        const [totalShips] = await connection.execute<any[]>(
          'SELECT COUNT(*) as total FROM ships WHERE status = "active"'
        );

        const [shipsByType] = await connection.execute<any[]>(
          'SELECT type, COUNT(*) as count FROM ships WHERE status = "active" GROUP BY type'
        );

        const [crewStats] = await connection.execute<any[]>(
          `SELECT 
            s.id, s.name, s.ship_number, s.max_crew,
            COUNT(ci.id) as current_crew
           FROM ships s
           LEFT JOIN crew_info ci ON s.id = ci.ship_id AND ci.status = 'active'
           WHERE s.status = 'active'
           GROUP BY s.id
           ORDER BY s.name`
        );

        res.json({
          totalShips: totalShips[0].total,
          shipsByType,
          crewStats
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get ship stats error:', error);
      res.status(500).json({ error: 'Failed to get ship statistics' });
    }
  }
}
