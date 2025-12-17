import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private baseUrl = environment.baseUrlEnv;

  constructor(private http: HttpClient) {}

  getUsuarios() {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }

  getUsuarioPorId(id: number) {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${id}`);
  }

  crearUsuario(usuario: any) {
    return this.http.post(`${this.baseUrl}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: any) {
    return this.http.put(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`);
  }

  cambiarContrasena(id: number, currentPassword: string, newPassword: string) {
    return this.http.put(`${this.baseUrl}/usuarios/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  }
}
