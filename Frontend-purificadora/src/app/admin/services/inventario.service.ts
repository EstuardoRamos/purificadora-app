import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Inventario } from '../../interfaces/inventario.interface';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private baseUrl = environment.baseUrlEnv;
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getInventarios(){
    return this.http.get(`${this.baseUrl}/inventarios`);
  }

  updateInventario(inventario: Inventario, cantidad: number){
    const usuarioId = this.authService.getUsuarioActual()?.id;
    const payload = {
      id_usuario: usuarioId,
      cantidad: cantidad
    };
    return this.http.put(`${this.baseUrl}/inventarios/${inventario.id_producto}`, payload);
  }

  getHistorial(){
    return this.http.get(`${this.baseUrl}/registroInventarios`);
  }

  getClientes(){
    return this.http.get(`${this.baseUrl}/clientes`);
  }
}
