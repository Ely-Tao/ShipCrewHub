import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRole, authorizeOwnerOrAdmin } from '../middleware/auth';
import { UserRole } from '../types/index';

const router = Router();
const userController = new UserController();

// 公开路由
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// 需要认证的路由
router.get('/me', authenticateToken, userController.getCurrentUser.bind(userController));
router.put('/change-password', authenticateToken, userController.changePassword.bind(userController));

// 管理员权限路由
router.get('/', authenticateToken, authorizeRole([UserRole.ADMIN, UserRole.HR_MANAGER]), userController.getUsers.bind(userController));
router.put('/:userId', authenticateToken, authorizeOwnerOrAdmin, userController.updateUser.bind(userController));
router.delete('/:userId', authenticateToken, authorizeRole([UserRole.ADMIN]), userController.deleteUser.bind(userController));

export default router;
