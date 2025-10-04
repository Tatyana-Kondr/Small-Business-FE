export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

// ========== DTO для пользователя ==========
export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface NewUserDto {
  username: string;
  password: string;
  email?: string; 
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
}

export interface UpdateUserRoleDto {
  role: Role;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}


// ========== DTO для аутентификации ==========
export interface AuthRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  role: Role;
}


// Состояние авторизации в хранилище
export interface AuthState {
  usersList: UserDto[],
  user: UserDto | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "failed";
  error: string | null;
  loginErrorMessage?: string;
  registerErrorMessage?: string;
  isSessionChecked: boolean;
  isAuthenticated: boolean;
}
