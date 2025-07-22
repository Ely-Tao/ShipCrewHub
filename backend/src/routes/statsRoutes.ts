import { Router } from "express";
import { StatsController } from "../controllers/StatsController";
import { authenticateToken } from "../middleware/tempAuth";

const router = Router();
const statsController = new StatsController();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取系统统计信息
router.get("/", statsController.getSystemStats.bind(statsController));

export default router;
