import { Router } from "express";
import { ImportController } from "../controllers/ImportController";
import { authenticateToken } from "../middleware/auth";
import { uploadSingle } from "../middleware/upload";

const router = Router();
const importController = new ImportController();

// 应用身份验证中间件到所有路由
router.use(authenticateToken);

// 下载导入模板
router.get(
  "/template/:type",
  importController.downloadTemplate.bind(importController),
);

// 验证上传的文件（不执行导入）
router.post(
  "/validate",
  uploadSingle,
  importController.validateFile.bind(importController),
);

// 执行数据导入
router.post(
  "/import",
  uploadSingle,
  importController.importData.bind(importController),
);

// 获取导入历史
router.get(
  "/history",
  importController.getImportHistory.bind(importController),
);

export default router;
