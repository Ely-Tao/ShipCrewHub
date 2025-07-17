import apiService from './apiService';
import type { User, PaginatedResponse, SearchParams } from '../types';

class UserService {
  // 获取用户列表
  async getUsers(params?: SearchParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiService.get<PaginatedResponse<User>>(url);
  }

  // 获取单个用户
  async getUser(userId: number) {
    return await apiService.get<User>(`/api/v1/users/${userId}`);
  }

  // 创建用户
  async createUser(userData: Partial<User>) {
    return await apiService.post('/api/v1/users', userData);
  }

  // 更新用户
  async updateUser(userId: number, userData: Partial<User>) {
    return await apiService.put(`/api/v1/users/${userId}`, userData);
  }

  // 删除用户
  async deleteUser(userId: number) {
    return await apiService.delete(`/api/v1/users/${userId}`);
  }

  // 批量删除用户
  async batchDeleteUsers(userIds: number[]) {
    return await apiService.post('/api/v1/users/batch-delete', { userIds });
  }

  // 重置用户密码
  async resetPassword(userId: number, newPassword: string) {
    return await apiService.put(`/api/v1/users/${userId}/reset-password`, { newPassword });
  }

  // 启用/禁用用户
  async toggleUserStatus(userId: number, status: 'active' | 'inactive') {
    return await apiService.put(`/api/v1/users/${userId}/status`, { status });
  }
}

export default new UserService();
