import { Request, Response } from 'express';
import { pool } from '../config/database.pool';
import { AuthRequest } from '../middleware/auth';

export class CertificateController {
  // 获取船员证书列表
  async getCertificatesByCrewId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { crewId } = req.params;

      const connection = await pool.getConnection();
      try {
        const [certificates] = await connection.execute<any[]>(
          `SELECT 
            id,
            crew_id,
            certificate_type,
            certificate_number,
            issue_date,
            expiry_date,
            issuing_authority,
            status,
            file_url,
            created_at,
            updated_at
           FROM certificates 
           WHERE crew_id = ?
           ORDER BY created_at DESC`,
          [crewId]
        );

        res.json(certificates);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get certificates by crew ID error:', error);
      res.status(500).json({ error: 'Failed to get certificates' });
    }
  }

  // 获取证书详情
  async getCertificateById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;

      const connection = await pool.getConnection();
      try {
        const [certificates] = await connection.execute<any[]>(
          `SELECT * FROM certificates WHERE id = ?`,
          [certificateId]
        );

        if (certificates.length === 0) {
          res.status(404).json({ error: 'Certificate not found' });
          return;
        }

        res.json(certificates[0]);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get certificate by ID error:', error);
      res.status(500).json({ error: 'Failed to get certificate' });
    }
  }

  // 创建证书
  async createCertificate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const certificateData = req.body;
      console.log('Creating certificate with data:', JSON.stringify(certificateData, null, 2));

      // 验证必填字段
      const requiredFields = ['crew_id', 'certificate_type', 'certificate_number', 'issue_date', 'expiry_date', 'issuing_authority'];
      for (const field of requiredFields) {
        if (!certificateData[field]) {
          console.log(`Missing required field: ${field}`);
          res.status(400).json({ error: `${field} is required` });
          return;
        }
      }

      const connection = await pool.getConnection();
      try {
        // 检查证书编号是否已存在
        const [existingCert] = await connection.execute<any[]>(
          'SELECT id FROM certificates WHERE certificate_number = ? AND crew_id = ?',
          [certificateData.certificate_number, certificateData.crew_id]
        );

        if (existingCert.length > 0) {
          res.status(409).json({ error: 'Certificate number already exists for this crew member' });
          return;
        }

        // 插入证书信息
        const [result] = await connection.execute<any>(
          `INSERT INTO certificates (
            crew_id, certificate_type, certificate_number, 
            issue_date, expiry_date, issuing_authority, 
            status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            certificateData.crew_id,
            certificateData.certificate_type,
            certificateData.certificate_number,
            certificateData.issue_date,
            certificateData.expiry_date,
            certificateData.issuing_authority,
            certificateData.status || 'active'
          ]
        );

        const certificateId = result.insertId;

        // 获取新创建的证书信息
        const [newCertificate] = await connection.execute<any[]>(
          'SELECT * FROM certificates WHERE id = ?',
          [certificateId]
        );

        res.status(201).json({
          message: 'Certificate created successfully',
          certificate: newCertificate[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Create certificate error:', error);
      res.status(500).json({ error: 'Failed to create certificate' });
    }
  }

  // 更新证书
  async updateCertificate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;
      const updateData = req.body;

      const connection = await pool.getConnection();
      try {
        // 检查证书是否存在
        const [existingCert] = await connection.execute<any[]>(
          'SELECT id, crew_id FROM certificates WHERE id = ?',
          [certificateId]
        );

        if (existingCert.length === 0) {
          res.status(404).json({ error: 'Certificate not found' });
          return;
        }

        // 如果更新证书编号，检查是否与其他证书重复
        if (updateData.certificate_number) {
          const [duplicateCheck] = await connection.execute<any[]>(
            'SELECT id FROM certificates WHERE certificate_number = ? AND crew_id = ? AND id != ?',
            [updateData.certificate_number, existingCert[0].crew_id, certificateId]
          );

          if (duplicateCheck.length > 0) {
            res.status(409).json({ error: 'Certificate number already exists for this crew member' });
            return;
          }
        }

        // 构建更新SQL
        const allowedFields = [
          'certificate_type', 'certificate_number', 'issue_date', 
          'expiry_date', 'issuing_authority', 'status', 'file_url'
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
        params.push(certificateId);

        // 执行更新
        await connection.execute(
          `UPDATE certificates SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        // 获取更新后的证书信息
        const [updatedCertificate] = await connection.execute<any[]>(
          'SELECT * FROM certificates WHERE id = ?',
          [certificateId]
        );

        res.json({
          message: 'Certificate updated successfully',
          certificate: updatedCertificate[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update certificate error:', error);
      res.status(500).json({ error: 'Failed to update certificate' });
    }
  }

  // 删除证书
  async deleteCertificate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;

      const connection = await pool.getConnection();
      try {
        // 检查证书是否存在
        const [existingCert] = await connection.execute<any[]>(
          'SELECT id FROM certificates WHERE id = ?',
          [certificateId]
        );

        if (existingCert.length === 0) {
          res.status(404).json({ error: 'Certificate not found' });
          return;
        }

        // 删除证书记录
        await connection.execute(
          'DELETE FROM certificates WHERE id = ?',
          [certificateId]
        );

        res.json({ message: 'Certificate deleted successfully' });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete certificate error:', error);
      res.status(500).json({ error: 'Failed to delete certificate' });
    }
  }

  // 批量删除证书
  async deleteCertificates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'Invalid certificate IDs' });
        return;
      }

      const connection = await pool.getConnection();
      try {
        const placeholders = ids.map(() => '?').join(',');
        
        await connection.execute(
          `DELETE FROM certificates WHERE id IN (${placeholders})`,
          ids
        );

        res.json({ 
          message: 'Certificates deleted successfully',
          deleted_count: ids.length
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Batch delete certificates error:', error);
      res.status(500).json({ error: 'Failed to delete certificates' });
    }
  }

  // 证书续期
  async renewCertificate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;
      const { new_expiry_date, new_issue_date } = req.body;

      if (!new_expiry_date) {
        res.status(400).json({ error: 'New expiry date is required' });
        return;
      }

      const connection = await pool.getConnection();
      try {
        // 检查证书是否存在
        const [existingCert] = await connection.execute<any[]>(
          'SELECT * FROM certificates WHERE id = ?',
          [certificateId]
        );

        if (existingCert.length === 0) {
          res.status(404).json({ error: 'Certificate not found' });
          return;
        }

        // 更新证书日期
        const updateFields = ['expiry_date = ?', 'status = ?', 'updated_at = NOW()'];
        const updateParams = [new_expiry_date, 'active'];

        if (new_issue_date) {
          updateFields.splice(1, 0, 'issue_date = ?');
          updateParams.splice(1, 0, new_issue_date);
        }

        updateParams.push(certificateId);

        await connection.execute(
          `UPDATE certificates SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );

        // 获取更新后的证书信息
        const [renewedCertificate] = await connection.execute<any[]>(
          'SELECT * FROM certificates WHERE id = ?',
          [certificateId]
        );

        res.json({
          message: 'Certificate renewed successfully',
          certificate: renewedCertificate[0]
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Renew certificate error:', error);
      res.status(500).json({ error: 'Failed to renew certificate' });
    }
  }

  // 获取即将过期的证书
  async getExpiringCertificates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query;

      const connection = await pool.getConnection();
      try {
        const [certificates] = await connection.execute<any[]>(
          `SELECT 
            c.*,
            ci.name as crew_name
           FROM certificates c
           LEFT JOIN crew_info ci ON c.crew_id = ci.id
           WHERE c.expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
           AND c.expiry_date >= NOW()
           AND c.status = 'active'
           ORDER BY c.expiry_date ASC`,
          [days]
        );

        res.json(certificates);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get expiring certificates error:', error);
      res.status(500).json({ error: 'Failed to get expiring certificates' });
    }
  }
}
