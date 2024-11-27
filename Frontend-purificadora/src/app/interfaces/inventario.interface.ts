import { Producto } from './producto.interface';
import { Usuario } from './usuario.interface';
export interface Inventario{
  id?:number;
  id_producto?: number;
  Producto: Producto;
  cantidad?: number;
  //estado?: string;
}

export interface RegistroInventario{
  id?:number;
  id_producto?:number;
  cantidad: number;
  fecha_ingreso:Date;
  id_empleado?: number
  Producto?:Producto;
  Usuario?:Usuario;
}
