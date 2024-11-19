import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private baseUrl = environment.baseUrlEnv;

  constructor(
    private http: HttpClient
  ) { }

  getProductos(){
    return this.http.get(`${this.baseUrl}/productos/`);
  }

  obtenerProductoId(){
    return this.http.get(`${this.baseUrl}/productos/1`);
  }

  crearProducto(producto: Producto){

    return this.http.post(`${this.baseUrl}/productos/`, producto);
  }

  updateProducto(producto: Producto){
    return this.http.put(`${this.baseUrl}/productos/${producto.id_producto}`, producto);
  }

  deleteProducto(id: number){
    return this.http.delete(`${this.baseUrl}/productos/${id}`);
  }

}
