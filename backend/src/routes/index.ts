import { Router } from "express";
import userRoutes from "./userRoutes";
import crewRoutes from "./crewRoutes";
import shipRoutes from "./shipRoutes";
import certificateRoutes from "./certificateRoutes";
import testAuthRoutes from "./testAuthRoutes";
import importRoutes from "./importRoutes";
import statsRoutes from "./statsRoutes";

const router = Router();

// API版本前缀
const API_VERSION = "/api/v1";

// 路由映射
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/crew`, crewRoutes);
router.use(`${API_VERSION}/ships`, shipRoutes);
router.use(`${API_VERSION}/certificates`, certificateRoutes);
router.use(`${API_VERSION}/auth`, testAuthRoutes); // 临时认证路由
router.use(`${API_VERSION}/import`, importRoutes); // 数据导入路由
router.use(`${API_VERSION}/stats`, statsRoutes); // 系统统计路由

// 健康检查
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;
