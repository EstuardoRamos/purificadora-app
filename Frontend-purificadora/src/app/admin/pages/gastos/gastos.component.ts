import { Component, OnInit } from '@angular/core';
import { GastosService } from '../../services/gastos.service';
import { Gasto } from '../../../interfaces/gasto.interface';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css'],
})
export class GastosComponent implements OnInit {
  gastos: Gasto[] = [];
  displayedColumns: string[] = ['gasto', 'valor', 'fecha', 'observacion', 'acciones'];
  gastoActual: Gasto = this.obtenerGastoVacio();
  fechaFiltroInicio: Date | null = null;
  fechaFiltroFin: Date | null = null;
  isLoading = false;
  errorMessage = '';
  editando = false;
  totalReporte: number | null = null;
  mostrarFormulario = false;

  constructor(private gastosService: GastosService) {}

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.gastosService.getGastos().subscribe({
      next: (data) => {
        const respuesta = this.normalizarRespuesta(data);
        this.gastos = respuesta.gastos;
        this.totalReporte = respuesta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los gastos', err);
        this.errorMessage = 'No fue posible cargar los gastos.';
        this.isLoading = false;
      },
    });
  }

  guardarGasto(): void {
    if (!this.gastoActual.gasto || !this.gastoActual.fecha || !this.gastoActual.valor) {
      alert('Completa el nombre, la fecha y el valor del gasto.');
      return;
    }

    const peticion = this.editando && this.gastoActual.id
      ? this.gastosService.actualizarGasto(this.gastoActual.id, this.gastoActual)
      : this.gastosService.crearGasto(this.gastoActual);

    peticion.subscribe({
      next: () => {
        this.resetFormulario();
        this.cargarGastos();
        this.mostrarFormulario = false;
      },
      error: (err) => {
        console.error('Error al guardar el gasto', err);
        alert('No se pudo guardar el gasto.');
      },
    });
  }

  editarGasto(gasto: Gasto): void {
    // Tomamos la parte de la fecha del string ISO directamente para evitar
    // que la conversión de zona horaria del navegador cambie el día.
    // Si viene '2023-10-27T06:00:00.000Z', tomamos '2023-10-27'.
    const fechaFormateada = typeof gasto.fecha === 'string' ? gasto.fecha.split('T')[0] : '';

    // Asignamos el gasto para editar, pero con la fecha ya formateada.
    this.gastoActual = { ...gasto, fecha: fechaFormateada };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  cancelarEdicion(): void {
    this.resetFormulario();
    this.mostrarFormulario = false;
  }

  eliminarGasto(gasto: Gasto): void {
    if (!gasto.id) {
      return;
    }
    const confirmar = confirm(`¿Eliminar el gasto "${gasto.gasto}"?`);
    if (!confirmar) {
      return;
    }
    this.gastosService.eliminarGasto(gasto.id).subscribe({
      next: () => {
        this.cargarGastos();
      },
      error: (err) => {
        console.error('Error al eliminar el gasto', err);
        alert('No se pudo eliminar el gasto.');
      },
    });
  }

  filtrarPorFechas(): void {
    if (!this.fechaFiltroInicio && !this.fechaFiltroFin) {
      alert('Selecciona al menos una fecha para filtrar.');
      return;
    }

    let inicio = this.fechaFiltroInicio
      ? new Date(this.fechaFiltroInicio)
      : new Date(this.fechaFiltroFin!);
    let fin = this.fechaFiltroFin
      ? new Date(this.fechaFiltroFin)
      : new Date(this.fechaFiltroInicio!);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (inicio > fin) {
      const temp = inicio;
      inicio = fin;
      fin = temp;
    }

    const desde = this.formatearFechaFiltro(inicio);
    const hasta = this.formatearFechaFiltro(fin);

    this.isLoading = true;
    this.errorMessage = '';
    this.gastosService.getReporteGastos(desde, hasta).subscribe({
      next: (data: any) => {
        const respuesta = this.normalizarRespuesta(data);
        this.gastos = respuesta.gastos;
        this.totalReporte = respuesta.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al filtrar los gastos', err);
        this.errorMessage = 'No fue posible filtrar los gastos.';
        this.isLoading = false;
      },
    });
  }

  private normalizarRespuesta(data: any): { gastos: Gasto[]; total: number | null } {
    let coleccion: any[] = [];
    let total: number | null = null;

    if (Array.isArray(data)) {
      coleccion = data;
    } else if (data) {
      if (Array.isArray(data.resumen)) {
        coleccion = data.resumen;
      } else if (Array.isArray(data.gastos)) {
        coleccion = data.gastos;
      } else if (Array.isArray(data.data)) {
        coleccion = data.data;
      }

      if (typeof data.total === 'number') {
        total = data.total;
      } else if (typeof data.total === 'string') {
        const valorNumerico = parseFloat(data.total);
        total = isNaN(valorNumerico) ? null : valorNumerico;
      }
    }

    const gastosNormalizados = coleccion.map((item) => ({
      ...item,
      valor:
        typeof item.valor === 'string'
          ? parseFloat(item.valor)
          : typeof item.valor === 'number'
          ? item.valor
          : 0,
    })) as Gasto[];

    return { gastos: gastosNormalizados, total };
  }

  limpiarFiltros(): void {
    this.fechaFiltroInicio = null;
    this.fechaFiltroFin = null;
    this.totalReporte = null;
    this.cargarGastos();
  }

  private resetFormulario(): void {
    this.gastoActual = this.obtenerGastoVacio();
    this.editando = false;
  }

  private obtenerGastoVacio(): Gasto {
    // Usar fecha local para evitar que toISOString() adelante el día si es tarde
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const day = hoy.getDate().toString().padStart(2, '0');

    return {
      gasto: '',
      fecha: `${year}-${month}-${day}`,
      valor: 0,
      observacion: '',
    };
  }

  private formatearFechaFiltro(fecha: Date): string {
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
