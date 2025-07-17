import { Router } from 'express';
import { ShipController } from '../controllers/ShipController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types/index';

const router = Router();
const shipController = new ShipController();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取船舶列表
router.get('/', shipController.getShipList.bind(shipController));

// 获取船舶统计信息
router.get('/stats', shipController.getShipStats.bind(shipController));

// 获取单个船舶信息
router.get('/:shipId', shipController.getShipById.bind(shipController));

// 添加船舶（需要管理员或船舶管理员权限）
router.post('/', 
  authorizeRole([UserRole.ADMIN, UserRole.SHIP_MANAGER]), 
  shipController.createShip.bind(shipController)
);

// 更新船舶信息（需要管理员或船舶管理员权限）
router.put('/:shipId', 
  authorizeRole([UserRole.ADMIN, UserRole.SHIP_MANAGER]), 
  shipController.updateShip.bind(shipController)
);

// 删除船舶（需要管理员权限）
router.delete('/:shipId', 
  authorizeRole([UserRole.ADMIN]), 
  shipController.deleteShip.bind(shipController)
);

export default router;
