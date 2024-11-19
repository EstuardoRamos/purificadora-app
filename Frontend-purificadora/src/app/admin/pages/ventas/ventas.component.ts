import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../../interfaces/producto.interface';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
})
export class VentasComponent {

  productos1: Producto[]=[]

  constructor(
    private productoService: ProductosService,
    private router: Router
  ){}
  // Lista de clientes
  clientes = [
    { nombre: 'Juan Pérez', ruta: 'Lunes', coordenadas: '19.432608, -99.133209', estado: 'desabastecido' },
    { nombre: 'Ana García', ruta: 'Lunes', coordenadas: '19.422608, -99.143209', estado: 'desabastecido' },
  ];

  // Productos disponibles
  productos = [
    { nombre: 'Garrafón', precio: 25, cantidad: 0 },
    { nombre: 'Filtro', precio: 50, cantidad: 0 },
    { nombre: 'Cloro', precio: 30, cantidad: 0 },
  ];

  // Columnas mostradas en la tabla
  displayedColumns: string[] = ['nombre', 'ruta', 'coordenadas', 'estado', 'acciones'];

  // Variables para la venta
  clienteSeleccionado: any = null;
  totalVenta = 0;
  venta = {
    metodoPago: 'pago',
  };

  // Control para mostrar el formulario
  mostrarFormularioVenta = false;

  // Seleccionar cliente para registrar venta
  registrarVenta(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.mostrarFormularioVenta = true;
    this.resetVenta();
  }

  // Reiniciar los valores de la venta
  resetVenta() {
    this.productos.forEach((producto) => (producto.cantidad = 0));
    this.totalVenta = 0;
  }

  // Calcular el total de la venta
  calcularTotal() {
    this.totalVenta = this.productos.reduce((total, producto) => {
      return total + producto.precio * producto.cantidad;
    }, 0);
  }

  // Guardar la venta
  guardarVenta() {
    if (this.totalVenta > 0 && this.clienteSeleccionado) {
      alert(`Venta registrada para ${this.clienteSeleccionado.nombre} por $${this.totalVenta}`);
      this.clienteSeleccionado.estado = 'abastecido';
      this.mostrarFormularioVenta = false;
      this.resetVenta();
    } else {
      alert('Agrega productos y selecciona un cliente antes de guardar la venta.');
    }
  }

  // Cancelar la venta
  cancelarVenta() {
    this.mostrarFormularioVenta = false;
    this.resetVenta();
  }


  listarProductos(){
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos1 = data as Producto[];
      },
      error: (error) => {
        console.error(error.error.mensaje);
      }
    })
  }
}
