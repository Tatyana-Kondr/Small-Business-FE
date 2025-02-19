export interface User {
    id: number;
    email: string;
    password: string;
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
  
  export interface LoginResponse {
    accessToken: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    status: "idle" | "loading" | "failed";
    error: string | null;
    loginErrorMessage?: string;
    registerErrorMessage?: string;
  }
  
    

  