// src/types.ts
export interface AuthResponse {
    token: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface UserProfile{
    name: string;
    email: string;
    id: string;
    createdAt: string;
}

export interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export interface userDetailsTypes {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}