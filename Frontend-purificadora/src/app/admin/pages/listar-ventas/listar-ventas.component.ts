import { Component, OnInit } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../../interfaces/venta.interface';

@Component({
  selector: 'app-listar-ventas',
  templateUrl: './listar-ventas.component.html',
  styleUrls: ['./listar-ventas.component.css'],
})
export class ListarVentasComponent implements OnInit {
  ventas: Venta[] = [];
  displayedColumns: string[] = ['id', 'cliente', 'usuario', 'metodoPago', 'total', 'fecha', 'acciones'];

  // Filtros de fecha
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.listarVentasDelDia();
  }

  // Listar ventas del día actual
  listarVentasDelDia(): void {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    this.ventasService.getVentasPorFecha(fechaActual).subscribe({
      next: (data) => {
        this.ventas = data as Venta[];
      },
      error: (err) => console.error('Error al cargar las ventas del día', err),
    });
  }

  // Listar todas las ventas
  listarTodasLasVentas(): void {
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data as Venta[];
      },
      error: (err) => console.error('Error al cargar todas las ventas', err),
    });
  }

  // Listar ventas por fecha o rango de fechas
  filtrarPorFechas(): void {
    const fechaInicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fechaFin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    if (!fechaInicio && !fechaFin) {
      alert('Por favor, selecciona al menos una fecha.');
      return;
    }

    this.ventasService.getVentasPorRango(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.ventas = data as Venta[];
      },
      error: (err) => console.error('Error al filtrar las ventas', err),
    });
  }

  // Ver detalle de una venta
  verDetalle(venta: Venta): void {
    alert(`Detalles de la venta ID: ${venta}`);
  }
}
