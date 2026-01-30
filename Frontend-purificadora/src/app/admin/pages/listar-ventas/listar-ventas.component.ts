import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../../interfaces/venta.interface';

@Component({
  selector: 'app-listar-ventas',
  templateUrl: './listar-ventas.component.html',
  styleUrls: ['./listar-ventas.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListarVentasComponent implements OnInit {
  ventas: Venta[] = [];
  ventasOriginales: Venta[] = []; // Copia de seguridad para filtrar localmente
  // Columnas para la vista principal minimalista
  displayedColumns: string[] = ['id', 'cliente', 'metodoPago', 'total', 'fecha', 'estado_pago', 'acciones'];
  expandedElement: Venta | null = null;

  // Filtros de fecha
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  filtroPago: 'todos' | 'pago' | 'credito' = 'todos';
  textoBusqueda: string = ''; // Variable para el buscador
  totalFiltrado: number = 0;
  todasLasVentasCargadas: boolean = false; // Bandera para saber si tenemos todo el historial

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
        this.ventasOriginales = data as Venta[];
        this.todasLasVentasCargadas = false; // Solo tenemos datos del día
        this.aplicarFiltros();
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
        this.ventasOriginales = data as Venta[];
        this.todasLasVentasCargadas = true; // Ya tenemos todo el historial
        this.aplicarFiltros();
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
        this.ventasOriginales = data as Venta[];
        this.todasLasVentasCargadas = false; // Es un rango específico, no todo
        this.aplicarFiltros();
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

  // Método unificado de filtrado (Pago + Buscador)
  aplicarFiltros(): void {
    let filtradas = [...this.ventasOriginales];

    // 1. Filtro por Método de Pago
    if (this.filtroPago !== 'todos') {
      filtradas = filtradas.filter((venta) => {
        const metodo = venta.MetodoPago?.metodo?.toLowerCase() || '';
        if (this.filtroPago === 'pago') return metodo.includes('pago');
        return metodo.includes('crédito') || metodo.includes('credito');
      });
    }

    // 2. Filtro por Buscador (Nombre del Cliente)
    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase().trim();
      filtradas = filtradas.filter((venta) =>
        venta.Cliente?.nombre.toLowerCase().includes(termino)
      );
    }

    this.ventas = filtradas;
    this.calcularTotal();
  }

  // Busca en todo el historial si no se encuentra en la vista actual
  buscarGlobalmente(): void {
    // Si hay texto y aún no hemos cargado todo el historial, lo cargamos
    if (this.textoBusqueda && !this.todasLasVentasCargadas) {
      this.listarTodasLasVentas();
    }
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
