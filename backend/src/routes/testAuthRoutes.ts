import { Router } from 'express';
import { TestAuthController } from '../controllers/TestAuthController';

const router = Router();
const testAuthController = new TestAuthController();

// 临时登录路由
router.post('/login', testAuthController.login.bind(testAuthController));

export default router;
