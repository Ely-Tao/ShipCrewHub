// 基础数据库接口
export interface BaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
}

// 用户相关类型
export interface User extends BaseEntity {
  username: string;
  password: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  last_login?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  SHIP_MANAGER = 'ship_manager',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// 船员信息类型
export interface CrewInfo extends BaseEntity {
  name: string;
  gender: Gender;
  birth_date: Date;
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
  join_date: Date;
  ship_id?: number;
  department: ShipDepartment;
  salary_grade: string;
  status: PersonStatus;
}

// 岸基人员信息类型
export interface ShoreBasedInfo extends BaseEntity {
  name: string;
  gender: Gender;
  birth_date: Date;
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
  join_date: Date;
  department_id: number;
  position: string;
  salary_grade: string;
  annual_leave_days: number;
  status: PersonStatus;
}

// 休假记录类型
export interface LeaveRecord extends BaseEntity {
  person_id: number;
  person_type: PersonType;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approved_by?: number;
  approved_at?: Date;
}

// 证书信息类型
export interface Certificate extends BaseEntity {
  person_id: number;
  person_type: PersonType;
  certificate_name: string;
  certificate_number: string;
  issuing_authority: string;
  issue_date: Date;
  expiry_date?: Date;
  certificate_level?: string;
  status: CertificateStatus;
}

// 船舶信息类型
export interface ShipInfo extends BaseEntity {
  name: string;
  ship_number: string;
  ship_type: string;
  capacity?: number;
  status: ShipStatus;
}

// 部门信息类型
export interface DepartmentInfo extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  status: DepartmentStatus;
}

// 薪资等级类型
export interface SalaryGrade extends BaseEntity {
  grade_name: string;
  grade_code: string;
  min_salary: number;
  max_salary: number;
  description?: string;
  status: SalaryGradeStatus;
}

// 枚举类型定义
export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export enum MaritalStatus {
  SINGLE = '未婚',
  MARRIED = '已婚',
  DIVORCED = '离异',
  WIDOWED = '丧偶'
}

export enum Education {
  PRIMARY = '小学',
  JUNIOR = '初中',
  SENIOR = '高中',
  VOCATIONAL = '中专',
  COLLEGE = '大专',
  BACHELOR = '本科',
  MASTER = '硕士',
  DOCTOR = '博士'
}

export enum ShipDepartment {
  DECK = '甲板部',
  ENGINE = '机舱部'
}

export enum PersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum PersonType {
  CREW = 'crew',
  SHORE_BASED = 'shore_based'
}

export enum LeaveType {
  ANNUAL = '年假',
  SICK = '病假',
  PERSONAL = '事假',
  OTHER = '其他'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum CertificateStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export enum ShipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SalaryGradeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 查询过滤器类型
export interface QueryFilter {
  [key: string]: any;
}

// 数据库操作结果类型
export interface DatabaseResult {
  affectedRows: number;
  insertId?: number;
  changedRows?: number;
}
