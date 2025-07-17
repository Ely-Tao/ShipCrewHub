import { Router } from 'express';
import { CrewController } from '../controllers/CrewController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types/index';

const router = Router();
const crewController = new CrewController();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取船员列表
router.get('/', crewController.getCrewList.bind(crewController));

// 获取单个船员信息
router.get('/:crewId', crewController.getCrewById.bind(crewController));

// 添加船员（需要管理员或HR权限）
router.post('/', 
  authorizeRole([UserRole.ADMIN, UserRole.HR_MANAGER]), 
  crewController.createCrew.bind(crewController)
);

// 更新船员信息（需要管理员或HR权限）
router.put('/:crewId', 
  authorizeRole([UserRole.ADMIN, UserRole.HR_MANAGER]), 
  crewController.updateCrew.bind(crewController)
);

// 删除船员（需要管理员权限）
router.delete('/:crewId', 
  authorizeRole([UserRole.ADMIN]), 
  crewController.deleteCrew.bind(crewController)
);

// 批量操作船员（需要管理员或HR权限）
router.post('/bulk-update', 
  authorizeRole([UserRole.ADMIN, UserRole.HR_MANAGER]), 
  crewController.bulkUpdateCrew.bind(crewController)
);

export default router;
