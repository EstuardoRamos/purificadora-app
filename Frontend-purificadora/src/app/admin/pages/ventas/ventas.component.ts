import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { ProductosService } from '../../services/productos.service';
import { VentasService } from '../../services/ventas.service';
import { Cliente } from '../../../interfaces/cliente.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { Venta, DetalleVenta } from '../../../interfaces/venta.interface';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
})
export class VentasComponent implements OnInit {
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  productosVenta: Producto[] = [];
  displayedColumns: string[] = ['nombre', 'telefono', 'coordenadas', 'estado', 'acciones'];
  clienteSeleccionado: Cliente | null = null;
  totalVenta: number = 0;
  mostrarFormularioVenta: boolean = false;

  // Detalles de la venta
  venta: Venta = {
    id_cliente: 0,
    fecha_compra: new Date(),
    total: 0,
    id_usuario: 1, // Cambiar por el usuario actual autenticado
    id_fomrma_pago: 1, // 1 = Pago, 2 = Crédito
  };

  constructor(
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private ventasService: VentasService
  ) {}

  ngOnInit(): void {
    this.cargarClientesDelDia();
    this.cargarProductos();
  }

  // Cargar clientes según el día actual
  cargarClientesDelDia(): void {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaActual = diasSemana[new Date().getDay()];

    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = (data as Cliente[]).filter((cliente) => cliente.ruta.toLowerCase() === diaActual);
      },
      error: (err) => console.error('Error al cargar los clientes', err),
    });
  }

  // Cargar productos disponibles
  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos=data as Producto[]

      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  // Seleccionar un cliente y abrir el formulario de venta
  registrarVenta(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.venta.id_cliente = cliente.id_cliente!;
    this.mostrarFormularioVenta = true;
    this.resetVenta();
  }

  // Reiniciar detalles de la venta
  resetVenta(): void {
    this.productos.forEach((producto) => (producto.cantidad = 0));
    this.totalVenta = 0;
    this.venta.id_fomrma_pago = 1; // Pago por defecto
  }

  // Calcular el total de la venta
  calcularTotal(): void {
    this.totalVenta = this.productos.reduce((total, producto) => {
      return total + producto.precio * (producto.cantidad || 0);
    }, 0);
    this.venta.total = this.totalVenta; // Actualizar el total en la venta
  }

  // Construir los detalles de la venta
  construirDetalleVenta(){
    return this.productos
      .filter((producto) => producto.cantidad && producto.cantidad > 0);
  }

  // Guardar la venta
  guardarVenta(): void {
    if (this.totalVenta > 0 && this.clienteSeleccionado) {
      //const detallesVenta = this.construirDetalleVenta();
      this.productosVenta = this.construirDetalleVenta();
      const ventaCompleta = {
        id_usuario:2,
        id_metodo_pago: 1,
        id_cliente:this.venta.id_cliente,
        productos: this.productosVenta
      };

      this.ventasService.registrarVenta(ventaCompleta).subscribe({
        next: () => {
          alert(`Venta registrada exitosamente para ${this.clienteSeleccionado!.nombre}`);
          this.clienteSeleccionado!.estado = 'abastecido'; // Actualizar estado local
          this.mostrarFormularioVenta = false;
          this.resetVenta();
        },
        error: (err) => {
          console.error('Error al registrar la venta', err.error)
          alert('Error al registrar la venta: '+ err.error.error)
        }
      });
    } else {
      alert('Agrega productos y selecciona un cliente antes de guardar la venta.');
    }
  }

  // Cancelar la venta
  cancelarVenta(): void {
    this.mostrarFormularioVenta = false;
    this.resetVenta();
  }
}
