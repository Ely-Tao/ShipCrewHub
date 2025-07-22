import { Response } from "express";
import { pool } from "../config/database.pool";
import { AuthRequest } from "../middleware/auth";

export class StatsController {
  // 获取系统统计信息
  async getSystemStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const connection = await pool.getConnection();
      try {
        // 获取各种统计信息
        const [totalShips] = await connection.execute<any[]>(
          'SELECT COUNT(*) as total FROM ship_info WHERE status = "active"',
        );

        const [totalCrew] = await connection.execute<any[]>(
          "SELECT COUNT(*) as total FROM crew_info",
        );

        const [totalShorePersonnel] = await connection.execute<any[]>(
          'SELECT COUNT(*) as total FROM crew_info WHERE status = "active" AND ship_id IS NULL',
        );

        const [pendingLeaves] = await connection.execute<any[]>(
          'SELECT COUNT(*) as total FROM leave_records WHERE status = "pending"',
        );

        const [expiringCertificates] = await connection.execute<any[]>(
          `SELECT COUNT(*) as total FROM certificates
           WHERE status = "active" AND expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)`,
        );

        res.json({
          success: true,
          data: {
            totalShips: totalShips[0].total,
            totalCrew: totalCrew[0].total,
            totalShorePersonnel: totalShorePersonnel[0].total,
            pendingLeaves: pendingLeaves[0].total,
            expiringCertificates: expiringCertificates[0].total,
          },
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Get system stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get system statistics",
      });
    }
  }
}
