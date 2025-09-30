export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}