import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ImportService } from "../services/ImportService";
import { cleanupFile } from "../middleware/upload";
import fs from "fs";

export class ImportController {
  // 下载导入模板
  async downloadTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      if (type !== "crew" && type !== "certificate") {
        res.status(400).json({ error: "Invalid template type" });
        return;
      }

      const templateBuffer = ImportService.generateTemplate(type);
      const filename =
        type === "crew" ? "船员导入模板.xlsx" : "证书导入模板.xlsx";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );

      res.send(templateBuffer);
    } catch (error) {
      console.error("Download template error:", error);
      res.status(500).json({ error: "Failed to generate template" });
    }
  }

  // 验证上传的文件
  async validateFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.body;

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      if (type !== "crew" && type !== "certificate") {
        cleanupFile(req.file.path);
        res.status(400).json({ error: "Invalid import type" });
        return;
      }

      // 读取文件内容
      const fileBuffer = fs.readFileSync(req.file.path);
      const data = ImportService.parseExcelFile(fileBuffer);

      if (!data || data.length === 0) {
        cleanupFile(req.file.path);
        res.status(400).json({ error: "Excel文件为空或格式不正确" });
        return;
      }

      // 验证数据
      let validationResult;
      if (type === "crew") {
        validationResult = await ImportService.validateCrewData(data);
      } else {
        validationResult = await ImportService.validateCertificateData(data);
      }

      // 清理上传的文件
      cleanupFile(req.file.path);

      res.json({
        success: true,
        validation: validationResult,
        previewData: data.slice(0, 5), // 返回前5条数据作为预览
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Validate file error:", error);

      // 清理上传的文件
      if (req.file) {
        cleanupFile(req.file.path);
      }

      res.status(500).json({
        error: "File validation failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 执行数据导入
  async importData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.body;

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      if (type !== "crew" && type !== "certificate") {
        cleanupFile(req.file.path);
        res.status(400).json({ error: "Invalid import type" });
        return;
      }

      // 读取文件内容
      const fileBuffer = fs.readFileSync(req.file.path);
      const data = ImportService.parseExcelFile(fileBuffer);

      if (!data || data.length === 0) {
        cleanupFile(req.file.path);
        res.status(400).json({ error: "Excel文件为空或格式不正确" });
        return;
      }

      // 验证数据
      let validationResult;
      if (type === "crew") {
        validationResult = await ImportService.validateCrewData(data);
      } else {
        validationResult = await ImportService.validateCertificateData(data);
      }

      // 如果验证失败，返回错误
      if (!validationResult.isValid) {
        cleanupFile(req.file.path);
        res.status(400).json({
          error: "Data validation failed",
          validation: validationResult,
        });
        return;
      }

      // 执行导入
      let importResult;
      if (type === "crew") {
        importResult = await ImportService.importCrewData(
          validationResult.validRows,
        );
      } else {
        importResult = await ImportService.importCertificateData(
          validationResult.validRows,
        );
      }

      // 清理上传的文件
      cleanupFile(req.file.path);

      res.json({
        success: true,
        message: importResult.message,
        result: importResult,
      });
    } catch (error) {
      console.error("Import data error:", error);

      // 清理上传的文件
      if (req.file) {
        cleanupFile(req.file.path);
      }

      res.status(500).json({
        error: "Data import failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 获取导入历史
  async getImportHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 这里可以实现导入历史记录功能
      // 目前返回空数组
      res.json({
        success: true,
        history: [],
      });
    } catch (error) {
      console.error("Get import history error:", error);
      res.status(500).json({ error: "Failed to get import history" });
    }
  }
}
