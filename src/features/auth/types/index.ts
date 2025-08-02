// Пользователь из сессии (минимальный набор)
export interface SessionUserDto {
  id: number;
  email: string;
  role: string;
}

// Полный пользователь (например, из админки)
export interface User {
  id: number;
  email: string;
  password: string; // можно удалить, если не нужен
  role: string;
  state: string;
}

export interface UserCreateDto {
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

// Больше не нужно:
export interface LoginResponse {
  message: string;
  status: number;
}

// Состояние авторизации в хранилище
export interface AuthState {
  user: SessionUserDto | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "failed";
  error: string | null;
  loginErrorMessage?: string;
  registerErrorMessage?: string;
  isSessionChecked: boolean;
}
