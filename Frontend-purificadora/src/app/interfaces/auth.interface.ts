export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  tipo: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: AuthUser;
}
