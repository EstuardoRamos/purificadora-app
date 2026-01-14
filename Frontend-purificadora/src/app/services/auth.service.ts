import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.baseUrlEnv;
  private tokenKey = 'purificadora_token';
  private userKey = 'purificadora_usuario';
  private usuarioSubject = new BehaviorSubject<AuthUser | null>(this.leerUsuarioLocal());

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    const body = {
      correo: payload.correo,
      contrasena: payload.contrasena,
    };

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/usuarios/login`, body)
      .pipe(
        tap((response) => {
          this.guardarSesion(response.token, response.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.usuarioSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsuarioActual(): AuthUser | null {
    return this.usuarioSubject.value;
  }

  getUsuario$() {
    return this.usuarioSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRutaInicio(): string {
    const usuario = this.getUsuarioActual();
    if (!usuario) {
      return '/login';
    }
    return usuario.tipo === 1 ? '/admin/inicio' : '/admin/mis-ventas';
  }

  tieneRol(roles?: number[]): boolean {
    if (!roles || !roles.length) {
      return true;
    }
    const usuario = this.getUsuarioActual();
    if (!usuario) {
      return false;
    }
    const tipo = Number(usuario.tipo);
    return roles.includes(tipo);
  }

  actualizarUsuarioLocal(usuario: AuthUser): void {
    const token = this.getToken();
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    }
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  private guardarSesion(token: string, usuario: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  private leerUsuarioLocal(): AuthUser | null {
    const data = localStorage.getItem(this.userKey);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as AuthUser;
    } catch (error) {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
