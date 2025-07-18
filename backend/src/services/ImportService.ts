import * as XLSX from "xlsx";
import { pool } from "../config/database.pool";
import { RowDataPacket } from "mysql2";

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportError[];
  validRows: any[];
  totalRows: number;
  validCount: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  totalCount: number;
  errors: ImportError[];
  duplicates: any[];
}

export class ImportService {
  // 船员数据导入模板字段定义
  private static readonly CREW_TEMPLATE_FIELDS = {
    name: { required: true, type: "string", maxLength: 100 },
    gender: { required: true, type: "enum", values: ["male", "female"] },
    birth_date: { required: true, type: "date" },
    id_number: { required: true, type: "string", maxLength: 20 },
    phone: { required: true, type: "phone" },
    email: { required: false, type: "email" },
    nationality: { required: true, type: "string", maxLength: 50 },
    hometown: { required: true, type: "string", maxLength: 100 },
    marital_status: {
      required: true,
      type: "enum",
      values: ["single", "married", "divorced", "widowed"],
    },
    education: {
      required: true,
      type: "enum",
      values: ["primary", "secondary", "college", "university", "postgraduate"],
    },
    department: {
      required: true,
      type: "enum",
      values: ["deck", "engine", "service", "management"],
    },
    position: { required: true, type: "string", maxLength: 100 },
    join_date: { required: true, type: "date" },
    status: {
      required: true,
      type: "enum",
      values: ["active", "inactive", "on_leave"],
    },
    ship_id: { required: false, type: "number" },
  };

  // 证书数据导入模板字段定义
  private static readonly CERTIFICATE_TEMPLATE_FIELDS = {
    crew_id: { required: true, type: "number" },
    certificate_type: {
      required: true,
      type: "enum",
      values: [
        "seamans_book",
        "deck_officer",
        "engine_officer",
        "medical",
        "safety",
        "special",
      ],
    },
    certificate_number: { required: true, type: "string", maxLength: 50 },
    issue_date: { required: true, type: "date" },
    expiry_date: { required: true, type: "date" },
    issuing_authority: { required: true, type: "string", maxLength: 200 },
    status: {
      required: true,
      type: "enum",
      values: ["active", "expired", "revoked"],
    },
  };

  // 解析Excel文件
  static parseExcelFile(buffer: Buffer): any[] {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 转换为JSON，保留原始格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: null,
      });

      return jsonData;
    } catch (error) {
      console.error("Excel parsing error:", error);
      throw new Error("Excel文件解析失败");
    }
  }

  // 生成Excel模板
  static generateTemplate(type: "crew" | "certificate"): Buffer {
    const fields =
      type === "crew"
        ? this.CREW_TEMPLATE_FIELDS
        : this.CERTIFICATE_TEMPLATE_FIELDS;

    // 创建表头
    const headers = Object.keys(fields);
    const descriptions = headers.map((field) => {
      const config = (fields as any)[field];
      let desc = config.required ? "必填" : "可选";
      if (config.type === "enum") {
        desc += ` (${config.values.join("/")})`;
      } else if (config.type === "date") {
        desc += " (YYYY-MM-DD)";
      } else if (config.type === "phone") {
        desc += " (手机号码)";
      } else if (config.type === "email") {
        desc += " (邮箱地址)";
      }
      return desc;
    });

    // 创建示例数据
    const exampleData =
      type === "crew"
        ? {
            name: "张三",
            gender: "male",
            birth_date: "1990-01-01",
            id_number: "123456789012345678",
            phone: "13800138000",
            email: "zhangsan@example.com",
            nationality: "中国",
            hometown: "北京市",
            marital_status: "married",
            education: "university",
            department: "deck",
            position: "大副",
            join_date: "2020-01-01",
            status: "active",
            ship_id: 1,
          }
        : {
            crew_id: 1,
            certificate_type: "seamans_book",
            certificate_number: "SB2024001",
            issue_date: "2024-01-01",
            expiry_date: "2027-01-01",
            issuing_authority: "中华人民共和国海事局",
            status: "active",
          };

    // 创建工作表数据
    const wsData = [headers, descriptions, Object.values(exampleData)];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 设置列宽
    const colWidths = headers.map(() => ({ width: 20 }));
    ws["!cols"] = colWidths;

    // 设置样式（第一行和第二行）
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let R = range.s.r; R <= 1; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        if (R === 0) {
          // 表头行样式
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "CCCCCC" } },
          };
        } else if (R === 1) {
          // 说明行样式
          ws[cellAddress].s = {
            font: { italic: true, sz: 9 },
            fill: { fgColor: { rgb: "F0F0F0" } },
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      type === "crew" ? "船员导入模板" : "证书导入模板",
    );

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  // 验证船员数据
  static async validateCrewData(data: any[]): Promise<ImportValidationResult> {
    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];
    const validRows: any[] = [];
    let validCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 1;
      let isRowValid = true;

      // 验证必填字段
      for (const [field, config] of Object.entries(this.CREW_TEMPLATE_FIELDS)) {
        const value = row[field];

        if (
          config.required &&
          (value === null || value === undefined || value === "")
        ) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}为必填字段`,
            value,
          });
          isRowValid = false;
          continue;
        }

        if (value !== null && value !== undefined && value !== "") {
          // 验证数据类型和格式
          const fieldErrors = this.validateFieldValue(
            field,
            value,
            config,
            rowIndex,
          );
          if (fieldErrors.length > 0) {
            errors.push(...fieldErrors);
            isRowValid = false;
          }
        }
      }

      // 验证业务逻辑
      if (row.birth_date && row.join_date) {
        const birthDate = new Date(row.birth_date);
        const joinDate = new Date(row.join_date);
        const age = joinDate.getFullYear() - birthDate.getFullYear();

        if (age < 16) {
          errors.push({
            row: rowIndex,
            field: "birth_date",
            message: "入职年龄不能小于16岁",
            value: row.birth_date,
          });
          isRowValid = false;
        }
      }

      if (isRowValid) {
        validRows.push({ ...row, _rowIndex: rowIndex });
        validCount++;
      }
    }

    // 检查重复数据
    await this.checkDuplicateCrewData(validRows, errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRows,
      totalRows: data.length,
      validCount,
    };
  }

  // 验证证书数据
  static async validateCertificateData(
    data: any[],
  ): Promise<ImportValidationResult> {
    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];
    const validRows: any[] = [];
    let validCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowIndex = i + 1;
      let isRowValid = true;

      // 验证必填字段
      for (const [field, config] of Object.entries(
        this.CERTIFICATE_TEMPLATE_FIELDS,
      )) {
        const value = row[field];

        if (
          config.required &&
          (value === null || value === undefined || value === "")
        ) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}为必填字段`,
            value,
          });
          isRowValid = false;
          continue;
        }

        if (value !== null && value !== undefined && value !== "") {
          // 验证数据类型和格式
          const fieldErrors = this.validateFieldValue(
            field,
            value,
            config,
            rowIndex,
          );
          if (fieldErrors.length > 0) {
            errors.push(...fieldErrors);
            isRowValid = false;
          }
        }
      }

      // 验证业务逻辑
      if (row.issue_date && row.expiry_date) {
        const issueDate = new Date(row.issue_date);
        const expiryDate = new Date(row.expiry_date);

        if (expiryDate <= issueDate) {
          errors.push({
            row: rowIndex,
            field: "expiry_date",
            message: "到期日期必须晚于签发日期",
            value: row.expiry_date,
          });
          isRowValid = false;
        }
      }

      if (isRowValid) {
        validRows.push({ ...row, _rowIndex: rowIndex });
        validCount++;
      }
    }

    // 检查船员ID是否存在
    await this.checkCrewExists(validRows, errors);

    // 检查重复证书
    await this.checkDuplicateCertificateData(validRows, errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRows,
      totalRows: data.length,
      validCount,
    };
  }

  // 验证字段值
  private static validateFieldValue(
    field: string,
    value: any,
    config: any,
    rowIndex: number,
  ): ImportError[] {
    const errors: ImportError[] = [];

    switch (config.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是字符串`,
            value,
          });
        } else if (config.maxLength && value.length > config.maxLength) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}长度不能超过${config.maxLength}个字符`,
            value,
          });
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是数字`,
            value,
          });
        }
        break;

      case "date":
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是YYYY-MM-DD格式的日期`,
            value,
          });
        } else {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              row: rowIndex,
              field,
              message: `${field}不是有效的日期`,
              value,
            });
          }
        }
        break;

      case "enum":
        if (!config.values.includes(value)) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是以下值之一: ${config.values.join(", ")}`,
            value,
          });
        }
        break;

      case "phone":
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是有效的手机号码`,
            value,
          });
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            row: rowIndex,
            field,
            message: `${field}必须是有效的邮箱地址`,
            value,
          });
        }
        break;
    }

    return errors;
  }

  // 检查船员重复数据
  private static async checkDuplicateCrewData(
    validRows: any[],
    errors: ImportError[],
  ): Promise<void> {
    const connection = await pool.getConnection();
    try {
      for (const row of validRows) {
        // 检查身份证号重复
        const [existing] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM crew_info WHERE id_number = ?",
          [row.id_number],
        );

        if (existing.length > 0) {
          errors.push({
            row: row._rowIndex,
            field: "id_number",
            message: "身份证号已存在",
            value: row.id_number,
          });
        }

        // 检查电话号码重复
        const [existingPhone] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM crew_info WHERE phone = ?",
          [row.phone],
        );

        if (existingPhone.length > 0) {
          errors.push({
            row: row._rowIndex,
            field: "phone",
            message: "手机号码已存在",
            value: row.phone,
          });
        }
      }
    } finally {
      connection.release();
    }
  }

  // 检查船员是否存在
  private static async checkCrewExists(
    validRows: any[],
    errors: ImportError[],
  ): Promise<void> {
    const connection = await pool.getConnection();
    try {
      for (const row of validRows) {
        const [existing] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM crew_info WHERE id = ?",
          [row.crew_id],
        );

        if (existing.length === 0) {
          errors.push({
            row: row._rowIndex,
            field: "crew_id",
            message: "船员ID不存在",
            value: row.crew_id,
          });
        }
      }
    } finally {
      connection.release();
    }
  }

  // 检查证书重复数据
  private static async checkDuplicateCertificateData(
    validRows: any[],
    errors: ImportError[],
  ): Promise<void> {
    const connection = await pool.getConnection();
    try {
      for (const row of validRows) {
        const [existing] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM certificates WHERE certificate_number = ? AND crew_id = ?",
          [row.certificate_number, row.crew_id],
        );

        if (existing.length > 0) {
          errors.push({
            row: row._rowIndex,
            field: "certificate_number",
            message: "证书编号已存在",
            value: row.certificate_number,
          });
        }
      }
    } finally {
      connection.release();
    }
  }

  // 批量导入船员数据
  static async importCrewData(validRows: any[]): Promise<ImportResult> {
    const connection = await pool.getConnection();
    let importedCount = 0;
    const errors: ImportError[] = [];

    try {
      await connection.beginTransaction();

      for (const row of validRows) {
        try {
          await connection.execute(
            `INSERT INTO crew_info (
              name, gender, birth_date, id_number, phone, email, 
              nationality, hometown, marital_status, education, 
              department, position, join_date, status, ship_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              row.name,
              row.gender,
              row.birth_date,
              row.id_number,
              row.phone,
              row.email,
              row.nationality,
              row.hometown,
              row.marital_status,
              row.education,
              row.department,
              row.position,
              row.join_date,
              row.status,
              row.ship_id,
            ],
          );
          importedCount++;
        } catch (error) {
          console.error("Import row error:", error);
          errors.push({
            row: row._rowIndex,
            field: "general",
            message: "数据导入失败",
            value: error instanceof Error ? error.message : String(error),
          });
        }
      }

      await connection.commit();

      return {
        success: true,
        message: `成功导入 ${importedCount} 条船员数据`,
        importedCount,
        totalCount: validRows.length,
        errors,
        duplicates: [],
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 批量导入证书数据
  static async importCertificateData(validRows: any[]): Promise<ImportResult> {
    const connection = await pool.getConnection();
    let importedCount = 0;
    const errors: ImportError[] = [];

    try {
      await connection.beginTransaction();

      for (const row of validRows) {
        try {
          await connection.execute(
            `INSERT INTO certificates (
              crew_id, certificate_type, certificate_number, 
              issue_date, expiry_date, issuing_authority, 
              status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              row.crew_id,
              row.certificate_type,
              row.certificate_number,
              row.issue_date,
              row.expiry_date,
              row.issuing_authority,
              row.status,
            ],
          );
          importedCount++;
        } catch (error) {
          console.error("Import row error:", error);
          errors.push({
            row: row._rowIndex,
            field: "general",
            message: "数据导入失败",
            value: error instanceof Error ? error.message : String(error),
          });
        }
      }

      await connection.commit();

      return {
        success: true,
        message: `成功导入 ${importedCount} 条证书数据`,
        importedCount,
        totalCount: validRows.length,
        errors,
        duplicates: [],
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
