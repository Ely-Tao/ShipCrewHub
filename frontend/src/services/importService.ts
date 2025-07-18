import apiService from "./apiService";
import type { ApiResponse } from "../types";

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: unknown;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportError[];
  validRows: Record<string, unknown>[];
  totalRows: number;
  validCount: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  totalCount: number;
  errors: ImportError[];
  duplicates: Record<string, unknown>[];
}

export interface ImportResponse {
  success: boolean;
  validation?: ImportValidationResult;
  result?: ImportResult;
  previewData?: Record<string, unknown>[];
  filename?: string;
  message?: string;
}

class ImportService {
  private baseUrl = "/api/v1/import";

  // 下载导入模板
  async downloadTemplate(type: "crew" | "certificate"): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/template/${type}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`下载模板失败: ${response.statusText}`);
    }

    return await response.blob();
  }

  // 验证上传的文件
  async validateFile(
    file: File,
    type: "crew" | "certificate"
  ): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`${this.baseUrl}/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "文件验证失败");
    }

    return await response.json();
  }

  // 执行数据导入
  async importData(
    file: File,
    type: "crew" | "certificate"
  ): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`${this.baseUrl}/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "数据导入失败");
    }

    return await response.json();
  }

  // 获取导入历史
  async getImportHistory(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return await apiService.get<Record<string, unknown>[]>(
      `${this.baseUrl}/history`
    );
  }

  // 解析Excel文件（前端预览）
  async parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
    const XLSX = await import("xlsx");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: null,
          }) as Record<string, unknown>[];

          resolve(jsonData);
        } catch {
          reject(new Error("Excel文件解析失败"));
        }
      };

      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsBinaryString(file);
    });
  }

  // 生成Excel文件（前端导出）
  async generateExcelFile(data: Record<string, unknown>[]): Promise<Blob> {
    const XLSX = await import("xlsx");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  // 下载文件
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // 验证文件格式
  validateFileType(file: File): boolean {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    return allowedTypes.includes(file.type);
  }

  // 验证文件大小
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // 格式化错误信息
  formatErrors(errors: ImportError[]): string {
    if (errors.length === 0) return "";

    const groupedErrors: { [key: string]: ImportError[] } = {};
    errors.forEach((error) => {
      const key = `第${error.row}行`;
      if (!groupedErrors[key]) {
        groupedErrors[key] = [];
      }
      groupedErrors[key].push(error);
    });

    return Object.entries(groupedErrors)
      .map(([row, rowErrors]) => {
        const errorMessages = rowErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");
        return `${row}: ${errorMessages}`;
      })
      .join("\n");
  }

  // 获取字段映射
  getFieldMapping(type: "crew" | "certificate"): { [key: string]: string } {
    if (type === "crew") {
      return {
        name: "姓名",
        gender: "性别",
        birth_date: "出生日期",
        id_number: "身份证号",
        phone: "联系电话",
        email: "邮箱",
        nationality: "国籍",
        hometown: "籍贯",
        marital_status: "婚姻状况",
        education: "学历",
        department: "部门",
        position: "职位",
        join_date: "入职日期",
        status: "状态",
        ship_id: "船舶ID",
      };
    } else {
      return {
        crew_id: "船员ID",
        certificate_type: "证书类型",
        certificate_number: "证书编号",
        issue_date: "签发日期",
        expiry_date: "到期日期",
        issuing_authority: "签发机构",
        status: "状态",
      };
    }
  }
}

export default new ImportService();
