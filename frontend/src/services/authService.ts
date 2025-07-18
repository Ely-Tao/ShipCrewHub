import apiService from "./apiService";
import type { LoginRequest, LoginResponse, User } from "../types";

class AuthService {
  private readonly TOKEN_KEY = "token";
  private readonly USER_KEY = "user";

  // 登录
  async login(credentials: LoginRequest) {
    const response = await apiService.post<LoginResponse>(
      "/api/v1/auth/login",
      credentials
    );

    if (response.success && response.data) {
      // 存储token和用户信息
      // 后端返回的数据结构：{ message, token, user }
      const loginData = response.data as any;
      localStorage.setItem(this.TOKEN_KEY, loginData.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(loginData.user));
      return response;
    }

    return response;
  }

  // 注册
  async register(userData: any) {
    return await apiService.post("/api/v1/users/register", userData);
  }

  // 登出
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // 只在不是登录页面时才跳转
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    return await apiService.get<User>("/api/v1/users/me");
  }

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string) {
    return await apiService.put("/api/v1/users/change-password", {
      currentPassword,
      newPassword,
    });
  }

  // 获取存储的token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // 获取存储的用户信息
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // 简单的token过期检查
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        // Token已过期，清除本地存储
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      // Token格式错误，清除本地存储
      this.logout();
      return false;
    }
  }

  // 检查用户权限
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user ? user.role === role : false;
  }

  // 检查用户是否有任一权限
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.hasRole("admin");
  }

  // 检查是否为HR管理员
  isHRManager(): boolean {
    return this.hasAnyRole(["admin", "hr_manager"]);
  }

  // 检查是否为船舶管理员
  isShipManager(): boolean {
    return this.hasAnyRole(["admin", "ship_manager"]);
  }
}

export default new AuthService();
