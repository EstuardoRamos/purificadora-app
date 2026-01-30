import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
export class ListarVentasComponent implements OnInit, OnDestroy {
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
  
  // Variables para el buscador automático (Debounce)
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.listarVentasDelDia();
    
    // Configurar el buscador automático: Espera 600ms después de que dejes de escribir
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(600), 
      distinctUntilChanged() // Solo busca si el texto es diferente al anterior
    ).subscribe(() => {
      this.buscarGlobalmente();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
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

    this.ventasService.getVentasPorRango(fechaInicio, fechaFin, this.textoBusqueda).subscribe({
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
    this.ventasService.getVentas(this.textoBusqueda).subscribe({
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

    this.ventasService.getVentasPorRango(fechaInicio, fechaFin, this.textoBusqueda).subscribe({
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

    // NOTA: El filtro de texto ahora se maneja en el backend al hacer la petición.
    // Aquí solo filtramos localmente por método de pago sobre los resultados que ya trajo el backend.

    this.ventas = filtradas;
    this.calcularTotal();
  }

  // Ejecuta la búsqueda en el backend
  buscarGlobalmente(): void {
    // Dependiendo de la vista actual, recargamos los datos con el filtro de búsqueda
    if (this.fechaInicio && this.fechaFin) {
      this.filtrarPorFechas();
    } else if (!this.todasLasVentasCargadas && !this.fechaInicio) {
      // Si estamos en la vista "del día", buscamos en el día
      this.listarVentasDelDia();
    } else {
      // Si estábamos viendo "todas" o queremos buscar en todo
      this.listarTodasLasVentas();
    }
  }

  // Método que recibe el evento del input y alimenta al Subject
  onSearchChange(texto: string): void {
    this.searchSubject.next(texto);
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
