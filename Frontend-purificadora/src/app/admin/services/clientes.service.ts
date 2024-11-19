import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = environment.baseUrlEnv;
  constructor(
    private http: HttpClient,
  ) { }

  obtenerClientes(){
    return this.http.get(`${this.baseUrl}/clientes`);
  }

  obtenerClienteId(){
    return this.http.get(`${this.baseUrl}/clientes/1`);
  }

  crearCliente(){
    return this.http.post(`${this.baseUrl}/clientes`, {})
  }

  updateCliente(){
    return this.http.put(`${this.baseUrl}/clientes/1`, {})
  }
}
