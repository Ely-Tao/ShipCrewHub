import apiService from './apiService';
import type { CrewMember, CrewListResponse, SearchParams, BulkOperation } from '../types';

class CrewService {
  // 获取船员列表
  async getCrewList(params?: SearchParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('name', params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/crew${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiService.get<CrewListResponse>(url);
  }

  // 获取单个船员信息
  async getCrewById(crewId: number) {
    return await apiService.get<CrewMember>(`/api/v1/crew/${crewId}`);
  }

  // 创建船员
  async createCrew(crewData: Partial<CrewMember>) {
    return await apiService.post('/api/v1/crew', crewData);
  }

  // 更新船员信息
  async updateCrew(crewId: number, crewData: Partial<CrewMember>) {
    return await apiService.put(`/api/v1/crew/${crewId}`, crewData);
  }

  // 删除船员
  async deleteCrew(crewId: number) {
    return await apiService.delete(`/api/v1/crew/${crewId}`);
  }

  // 批量操作船员
  async bulkUpdateCrew(operation: BulkOperation) {
    return await apiService.post('/api/v1/crew/bulk-update', operation);
  }

  // 分配船员到船舶
  async assignCrewToShip(crewIds: number[], shipId: number) {
    return await this.bulkUpdateCrew({
      action: 'assign_ship',
      ids: crewIds,
      data: { ship_id: shipId },
    });
  }

  // 批量修改船员状态
  async batchChangeStatus(crewIds: number[], status: string) {
    return await this.bulkUpdateCrew({
      action: 'change_status',
      ids: crewIds,
      data: { status },
    });
  }

  // 批量修改船员部门
  async batchUpdateDepartment(crewIds: number[], department: string) {
    return await this.bulkUpdateCrew({
      action: 'update_department',
      ids: crewIds,
      data: { department },
    });
  }

  // 导出船员数据
  async exportCrewData(params?: SearchParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/crew/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiService.get(url, { responseType: 'blob' });
  }

  // 导入船员数据
  async importCrewData(file: File, onProgress?: (progress: number) => void) {
    return await apiService.upload('/api/v1/crew/import', file, onProgress);
  }
}

export default new CrewService();
