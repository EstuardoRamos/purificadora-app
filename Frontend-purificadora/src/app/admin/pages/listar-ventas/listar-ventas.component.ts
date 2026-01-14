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
  filtroPago: 'todos' | 'pago' | 'credito' = 'todos';
  totalFiltrado: number = 0;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.listarVentasDelDia();
  }

  // Listar ventas del día actual
  listarVentasDelDia(): void {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hoy);
    fin.setHours(23, 59, 59, 999);
    const fechaInicio = inicio.toISOString().split('T')[0];
    const fechaFin = fin.toISOString().split('T')[0];

    this.ventasService.getVentasPorRango(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.ventas = this.filtrarPorMetodoPago(data as Venta[]);
        this.calcularTotal();
      },
      error: (err) => {
        console.error('Error al cargar las ventas del día', err);
        this.ventas = [];
        this.totalFiltrado = 0;
      },
    });
  }

  // Listar todas las ventas
  listarTodasLasVentas(): void {
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = this.filtrarPorMetodoPago(data as Venta[]);
        this.calcularTotal();
      },
      error: (err) => console.error('Error al cargar todas las ventas', err),
    });
  }

  // Listar ventas por fecha o rango de fechas
  filtrarPorFechas(): void {
    const fechaInicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fechaFin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    if (!fechaInicio && !fechaFin) {
      this.listarTodasLasVentas();
      return;
    }

    this.ventasService.getVentasPorRango(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.ventas = this.filtrarPorMetodoPago(data as Venta[]);
        this.calcularTotal();
      },
      error: (err) => {
        if (err?.error?.error) {
          alert(err.error.error);
        }
        this.ventas = [];
        this.totalFiltrado = 0;
        console.error('Error al filtrar las ventas', err);
      },
    });
  }

  // Ver detalle de una venta
  verDetalle(venta: Venta): void {
    alert(`Detalles de la venta ID: ${venta}`);
  }

  onMetodoPagoChange(): void {
    if (this.fechaInicio || this.fechaFin) {
      this.filtrarPorFechas();
    } else {
      this.listarTodasLasVentas();
    }
  }

  private filtrarPorMetodoPago(ventas: Venta[]): Venta[] {
    if (this.filtroPago === 'todos') {
      return ventas || [];
    }

    return (ventas || []).filter((venta) => {
      const metodo = venta.MetodoPago?.metodo?.toLowerCase() || '';
      if (this.filtroPago === 'pago') {
        return metodo.includes('pago');
      }
      return metodo.includes('crédito') || metodo.includes('credito');
    });
  }

  private calcularTotal(): void {
    this.totalFiltrado = this.ventas.reduce((sum, venta) => {
      const total = typeof venta.total === 'number' ? venta.total : parseFloat(`${venta.total}`) || 0;
      return sum + total;
    }, 0);
  }


  eliminarVenta(venta: Venta): void {
    const mensaje = `¿Estás seguro de que deseas eliminar la venta #${venta}?\n\nEsta acción devolverá los productos al inventario y no se puede deshacer.`;
    
    if (confirm(mensaje)) {
      this.ventasService.eliminarVenta(venta.id!).subscribe({
        next: () => {
          alert('Venta eliminada con éxito y stock restaurado.');
          // Refrescamos la lista actual para que desaparezca la venta eliminada
          this.filtrarPorFechas(); 
        },
        error: (err) => {
          console.error('Error al eliminar la venta', err);
          alert('No se pudo eliminar la venta: ' + (err.error?.error || err.message));
        }
      });
    }
  }
}
