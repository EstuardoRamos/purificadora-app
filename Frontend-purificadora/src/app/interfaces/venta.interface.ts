import { Cliente } from './cliente.interface';
import { Usuario } from './usuario.interface';
export interface Venta{
  id_cliente: number;
  fecha_compra: Date;
  total: number;
  id_usuario: number;
  id_fomrma_pago: number;
  Cliente?: Cliente;
  Usuario?: Usuario;
  MetodoPago?: MetodoPago;

}

export interface DetalleVenta{
  id: number;
  id_compra?: number;
  id_producto: number;
  cantidad?: number;
  subtotal?: number;
}

export interface MetodoPago{
  id: number;
  metodo: string;
}
