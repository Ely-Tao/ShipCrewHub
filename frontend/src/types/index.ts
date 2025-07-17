// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// 船舶列表响应
export interface ShipListResponse {
  ships: Ship[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// 船员列表响应
export interface CrewListResponse {
  crews: CrewMember[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export type UserRole = 'admin' | 'hr_manager' | 'ship_manager' | 'user';
export type UserStatus = 'active' | 'inactive';

// 登录请求和响应
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// 船舶相关类型
export interface Ship {
  id: number;
  name: string;
  ship_number: string;
  ship_type: string;
  capacity: number;
  status: ShipStatus;
  crew_count?: number;
  created_at: string;
  updated_at?: string;
}

export type ShipStatus = 'active' | 'inactive' | 'maintenance';

// 船员相关类型
export interface CrewMember {
  id: number;
  name: string;
  gender: Gender;
  birth_date: string;
  id_card: string;
  marital_status: MaritalStatus;
  nationality: string;
  hometown: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  education: Education;
  school?: string;
  major?: string;
  join_date: string;
  ship_id?: number;
  ship_name?: string;
  ship_number?: string;
  department: Department;
  salary_grade: string;
  status: PersonStatus;
  created_at: string;
  updated_at?: string;
}

export type Gender = 'male' | 'female';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Education = 'primary' | 'junior' | 'senior' | 'college' | 'bachelor' | 'master' | 'doctor';
export type Department = 'deck' | 'engine' | 'catering' | 'general';
export type PersonStatus = 'active' | 'inactive' | 'on_leave';

// 证书类型
export interface Certificate {
  id: number;
  crew_id: number;
  certificate_type: CertificateType;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  status: CertificateStatus;
  created_at: string;
  updated_at?: string;
}

export type CertificateType = 'seamans_book' | 'deck_officer' | 'engine_officer' | 'medical' | 'safety' | 'special';
export type CertificateStatus = 'active' | 'expired' | 'revoked';

// 请假记录类型
export interface LeaveRecord {
  id: number;
  crew_id: number;
  crew_name?: string;
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string;
  status: LeaveStatus;
  approver_id?: number;
  approver_name?: string;
  approve_date?: string;
  comments?: string;
  created_at: string;
  updated_at?: string;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// 岸基人员类型
export interface ShorePersonnel {
  id: number;
  name: string;
  gender: Gender;
  birth_date: string;
  id_card: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  join_date: string;
  salary_grade: string;
  status: PersonStatus;
  created_at: string;
  updated_at?: string;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

// 表格列配置
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  render?: (value: any, record: any) => React.ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: string }>;
}

// 表单字段类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  rules?: any[];
}

// 统计数据类型
export interface StatsData {
  totalShips: number;
  totalCrew: number;
  totalShorePersonnel: number;
  pendingLeaves: number;
  expiringCertificates: number;
}

// 过滤器类型
export interface FilterOptions {
  [key: string]: any;
}

// 搜索参数
export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: FilterOptions;
}

// 批量操作
export interface BulkOperation {
  action: string;
  ids: number[];
  data?: any;
}
