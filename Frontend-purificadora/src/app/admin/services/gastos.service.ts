import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Gasto } from '../../interfaces/gasto.interface';

@Injectable({
  providedIn: 'root',
})
export class GastosService {
  private baseUrl = environment.baseUrlEnv;

  constructor(private http: HttpClient) {}

  crearGasto(gasto: Gasto) {
    return this.http.post(`${this.baseUrl}/gastos`, gasto);
  }

  actualizarGasto(id: number, gasto: Partial<Gasto>) {
    return this.http.put(`${this.baseUrl}/gastos/${id}`, gasto);
  }

  eliminarGasto(id: number) {
    return this.http.delete(`${this.baseUrl}/gastos/${id}`);
  }

  getGastos() {
    return this.http.get<Gasto[]>(`${this.baseUrl}/gastos`);
  }

  getReporteGastos(desde: string, hasta: string) {
    return this.http.get(`${this.baseUrl}/gastos/reporte?desde=${desde}&hasta=${hasta}`);
  }
}
