import { Component, OnInit } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../../interfaces/venta.interface';

interface VentaPendiente extends Venta {
  id: number;
  total: number;
  fecha?: string;
  estado_pago?: string;
}

@Component({
  selector: 'app-creditos-pendientes',
  templateUrl: './creditos-pendientes.component.html',
  styleUrls: ['./creditos-pendientes.component.css'],
})
export class CreditosPendientesComponent implements OnInit {
  ventasPendientes: VentaPendiente[] = [];
  ventasOriginales: VentaPendiente[] = [];
  textoBusqueda: string = '';
  displayedColumns: string[] = ['id', 'cliente', 'telefono', 'total', 'fecha', 'estado', 'acciones'];
  totalPendiente = 0;
  isLoading = false;
  errorMessage = '';

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentasPendientes();
  }

  cargarVentasPendientes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.ventasService.getVentasPendientes().subscribe({
      next: (data) => {
        this.ventasOriginales = this.normalizarVentas(data as any[]);
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las ventas pendientes', err);
        this.errorMessage = err?.error?.error || 'No fue posible obtener las ventas pendientes.';
        this.ventasPendientes = [];
        this.totalPendiente = 0;
        this.isLoading = false;
      },
    });
  }

  aplicarFiltro(): void {
    let filtrados = [...this.ventasOriginales];

    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((venta) =>
        venta.Cliente?.nombre.toLowerCase().includes(termino)
      );
    }

    this.ventasPendientes = filtrados;
    this.totalPendiente = this.ventasPendientes.reduce((sum, venta) => sum + (venta.total || 0), 0);
  }

  pagarCredito(venta: VentaPendiente): void {
    if (!confirm(`¿Confirmas el pago del crédito de ${venta.Cliente?.nombre}?`)) {
      return;
    }

    this.ventasService.actualizarEstadoVenta(venta.id, 'pagado').subscribe({
      next: () => {
        alert('Crédito actualizado a pagado.');
        this.cargarVentasPendientes();
      },
      error: (err) => {
        console.error('Error al actualizar crédito', err);
        alert(err?.error?.error || 'No se pudo actualizar el crédito.');
      },
    });
  }

  private normalizarVentas(ventas: any[]): VentaPendiente[] {
    return (ventas || []).map((venta) => ({
      ...venta,
      total:
        typeof venta.total === 'number' ? venta.total : parseFloat(venta.total || '0') || 0,
    }));
  }
}
