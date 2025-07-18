import { Router } from 'express';
import { CertificateController } from '../controllers/CertificateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const certificateController = new CertificateController();

// 应用身份验证中间件到所有路由
router.use(authenticateToken);

// 证书路由
router.get('/crew/:crewId', certificateController.getCertificatesByCrewId.bind(certificateController));
router.get('/expiring', certificateController.getExpiringCertificates.bind(certificateController));
router.get('/:certificateId', certificateController.getCertificateById.bind(certificateController));
router.post('/', certificateController.createCertificate.bind(certificateController));
router.put('/:certificateId', certificateController.updateCertificate.bind(certificateController));
router.delete('/:certificateId', certificateController.deleteCertificate.bind(certificateController));
router.post('/batch-delete', certificateController.deleteCertificates.bind(certificateController));
router.post('/:certificateId/renew', certificateController.renewCertificate.bind(certificateController));

export default router;
