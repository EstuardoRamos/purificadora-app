import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private baseUrl = environment.baseUrlEnv;

  constructor(
    private http: HttpClient
  ) { }

  getProductos(){
    return this.http.get(`${this.baseUrl}/productos/categoria/1`);
  }

  registrarVenta(venta: any){
    console.log(venta);

    return this.http.post(`${this.baseUrl}/ventas/`, venta);
  }

  getVentas(){
    return this.http.get(`${this.baseUrl}/ventas/`);
  }

  getVentasPorFecha(fecha: string){
    return this.http.get(`${this.baseUrl}/ventas/fecha?fecha_inicio=${fecha}`);
  }

  getVentasPorRango(fechaInicio: any, fechaFin: any){
    return this.http.get(`${this.baseUrl}/ventas/fecha?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
  }
}
