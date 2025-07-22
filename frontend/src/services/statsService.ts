import apiService from "./apiService";
import type { StatsData } from "../types";

class StatsService {
  // 获取系统统计信息
  async getSystemStats() {
    return await apiService.get<StatsData>("/api/v1/stats");
  }
}

export default new StatsService();
