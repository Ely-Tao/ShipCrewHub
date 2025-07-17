import { Router } from 'express';
import userRoutes from './userRoutes';
import crewRoutes from './crewRoutes';
import shipRoutes from './shipRoutes';

const router = Router();

// API版本前缀
const API_VERSION = '/api/v1';

// 路由映射
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/crew`, crewRoutes);
router.use(`${API_VERSION}/ships`, shipRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
