import apiService from './apiService';
import type { Ship, PaginatedResponse, SearchParams, StatsData } from '../types';

class ShipService {
  // 获取船舶列表
  async getShipList(params?: SearchParams) {
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

    const url = `/api/v1/ships${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiService.get<PaginatedResponse<Ship>>(url);
  }

  // 获取单个船舶信息
  async getShipById(shipId: number) {
    return await apiService.get<Ship>(`/api/v1/ships/${shipId}`);
  }

  // 创建船舶
  async createShip(shipData: Partial<Ship>) {
    return await apiService.post('/api/v1/ships', shipData);
  }

  // 更新船舶信息
  async updateShip(shipId: number, shipData: Partial<Ship>) {
    return await apiService.put(`/api/v1/ships/${shipId}`, shipData);
  }

  // 删除船舶
  async deleteShip(shipId: number) {
    return await apiService.delete(`/api/v1/ships/${shipId}`);
  }

  // 获取船舶统计信息
  async getShipStats() {
    return await apiService.get<StatsData>('/api/v1/ships/stats');
  }

  // 获取船舶选项（用于下拉框）
  async getShipOptions() {
    const response = await apiService.get<{ id: number; name: string; ship_number: string }[]>('/api/v1/ships/options');
    return response;
  }

  // 获取船舶详细信息（包含船员）
  async getShipDetails(shipId: number) {
    return await apiService.get(`/api/v1/ships/${shipId}/details`);
  }

  // 获取船舶的船员列表
  async getShipCrew(shipId: number) {
    return await apiService.get(`/api/v1/ships/${shipId}/crew`);
  }
}

export default new ShipService();
