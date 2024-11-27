import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { RegistroInventario } from '../../../interfaces/inventario.interface';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../../interfaces/producto.interface';

@Component({
  selector: 'app-historial-inventario',
  templateUrl: './historial-inventario.component.html',
  styleUrls: ['./historial-inventario.component.css'],
})
export class HistorialInventarioComponent implements OnInit {
  historial: RegistroInventario[] = [];
  historialFiltrado: RegistroInventario[] = [];
  productos: Producto[] = []; // Lista de productos para los filtros
  filtroProducto: number | null = null;
  filtroAccion: string | null = null;
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;

  displayedColumns = ['producto', 'accion', 'cantidad', 'fecha', 'usuario'];

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarProductos();
  }

  cargarHistorial(): void {
    this.inventarioService.getHistorial().subscribe({
      next: (data) => {
        this.historial = data as RegistroInventario[];
        this.historialFiltrado = [...this.historial]; // Inicialmente todos los datos
      },
      error: (err) => console.error('Error al cargar el historial', err),
    });
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data as Producto[];
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  aplicarFiltros(): void {
    this.historialFiltrado = this.historial.filter((item) => {
      const cumpleProducto = this.filtroProducto ? item.Producto?.id_producto === this.filtroProducto : true;
     // const cumpleAccion = this.filtroAccion ? item.accion === this.filtroAccion : true;
      const cumpleFechaDesde = this.filtroFechaDesde ? new Date(item.fecha_ingreso) >= this.filtroFechaDesde : true;
      const cumpleFechaHasta = this.filtroFechaHasta ? new Date(item.fecha_ingreso) <= this.filtroFechaHasta : true;

      return cumpleProducto && cumpleFechaDesde && cumpleFechaHasta;
    });
  }
}
