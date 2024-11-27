import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Inventario } from '../../interfaces/inventario.interface';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private baseUrl = environment.baseUrlEnv;
  constructor(
    private http: HttpClient,
  ) { }

  getInventarios(){
    return this.http.get(`${this.baseUrl}/inventarios`);
  }

  updateInventario(inventario: Inventario, cantidad: number){
    console.log({id_usuario:1, cantidad:cantidad});

    return this.http.put(`${this.baseUrl}/inventarios/${inventario.id_producto}`, {id_usuario:2, cantidad:cantidad});
  }

  getHistorial(){
    return this.http.get(`${this.baseUrl}/registroInventarios`);
  }

  getClientes(){
    return this.http.get(`${this.baseUrl}/clientes`);
  }
}
