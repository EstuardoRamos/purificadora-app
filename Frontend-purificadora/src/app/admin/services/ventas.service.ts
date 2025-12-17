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

  getReporteSemanal(desde: string, hasta: string) {
    console.log(desde+" hasta "+hasta);
    
    return this.http.get(`${this.baseUrl}/ventas/reporte-semanal?desde=${desde}&hasta=${hasta}`);
  }

  getReporteIngresos(desde: string, hasta: string) {
    return this.http.get(`${this.baseUrl}/ventas/reporte-ingresos?desde=${desde}&hasta=${hasta}`);
  }

  getUltimaVentaCliente(idCliente: number) {
    return this.http.get(`${this.baseUrl}/ventas/cliente/${idCliente}/ultima`);
  }

  getVentasPendientes() {
    return this.http.get(`${this.baseUrl}/ventas/pendientes`);
  }

  actualizarEstadoVenta(idVenta: number, estado: string) {
    return this.http.put(`${this.baseUrl}/ventas/${idVenta}/estado`, { estado_pago: estado });
  }

  getVentasUsuario(idUsuario: number, desde?: string, hasta?: string) {
    let url = `${this.baseUrl}/ventas/usuario/${idUsuario}`;
    const params: string[] = [];

    if (desde) {
      params.push(`desde=${desde}`);
    }

    if (hasta) {
      params.push(`hasta=${hasta}`);
    }

    if (params.length) {
      url += `?${params.join('&')}`;
    }

    return this.http.get(url);
  }
}
