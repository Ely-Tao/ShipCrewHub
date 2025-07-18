import apiService from './apiService';
import type { Certificate, ApiResponse } from '../types';

class CertificateService {
  private baseUrl = '/api/v1/certificates';

  // 获取船员证书列表
  async getCertificatesByCrewId(crewId: number): Promise<ApiResponse<Certificate[]>> {
    return await apiService.get<Certificate[]>(`${this.baseUrl}/crew/${crewId}`);
  }

  // 获取证书详情
  async getCertificateById(certificateId: number): Promise<ApiResponse<Certificate>> {
    return await apiService.get<Certificate>(`${this.baseUrl}/${certificateId}`);
  }

  // 创建证书
  async createCertificate(certificateData: Partial<Certificate>): Promise<ApiResponse<Certificate>> {
    return await apiService.post<Certificate>(this.baseUrl, certificateData);
  }

  // 更新证书
  async updateCertificate(certificateId: number, certificateData: Partial<Certificate>): Promise<ApiResponse<Certificate>> {
    return await apiService.put<Certificate>(`${this.baseUrl}/${certificateId}`, certificateData);
  }

  // 删除证书
  async deleteCertificate(certificateId: number): Promise<ApiResponse<void>> {
    return await apiService.delete(`${this.baseUrl}/${certificateId}`);
  }

  // 批量删除证书
  async deleteCertificates(certificateIds: number[]): Promise<ApiResponse<void>> {
    return await apiService.post(`${this.baseUrl}/batch-delete`, { ids: certificateIds });
  }

  // 获取即将过期的证书
  async getExpiringCertificates(days = 30): Promise<ApiResponse<Certificate[]>> {
    return await apiService.get<Certificate[]>(`${this.baseUrl}/expiring?days=${days}`);
  }

  // 续期证书
  async renewCertificate(certificateId: number, renewData: { new_expiry_date: string; new_issue_date?: string }): Promise<ApiResponse<Certificate>> {
    return await apiService.post<Certificate>(`${this.baseUrl}/${certificateId}/renew`, renewData);
  }

  // 上传证书文件
  async uploadCertificateFile(certificateId: number, file: File): Promise<ApiResponse<{ file_url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return await apiService.post(`${this.baseUrl}/${certificateId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new CertificateService();
