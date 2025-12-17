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

  crearUsuario(usuario: any) {
    return this.http.post(`${this.baseUrl}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: any) {
    return this.http.put(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`);
  }
}
