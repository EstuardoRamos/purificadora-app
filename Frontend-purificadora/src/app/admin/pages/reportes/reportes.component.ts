import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { VentasService } from '../../services/ventas.service';
import { GastosService } from '../../services/gastos.service';
import {
  ReporteSemanalDia,
  ReporteSemanalResponse,
  ReporteSemanalTotales,
  ReporteIngresosDia,
  ReporteIngresosResponse,
  ReporteIngresosTotales,
} from '../../../interfaces/reporte-semanal.interface';
import { Gasto } from '../../../interfaces/gasto.interface';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  displayedColumns: string[] = [
    'dia',
    'fecha',
    'ventas',
    'credito',
    'entrega_total',
    'garrafones_en_planta',
  ];
  displayedIngresosColumns: string[] = [
    'dia',
    'fecha',
    'vendidos',
    'ventas',
    'creditos',
    'ingreso',
  ];

  reporteSemanal: ReporteSemanalDia[] = [];
  resumenTotales: ReporteSemanalTotales | null = null;
  reporteIngresos: ReporteIngresosDia[] = [];
  totalesIngresos: ReporteIngresosTotales | null = null;
  totalGastos: number = 0;
  gastosDetalle: Gasto[] = [];
  mostrarGastosDetalle = false;
  ingresoNeto: number = 0;
  totalGarrafonesVendidos = 0;
  totalMontoVentas = 0;
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  isLoading = false;
  errorMessage = '';
  tipoReporteSeleccionado: 'semanal' | 'ingresos' = 'semanal';

  constructor(
    private ventasService: VentasService,
    private gastosService: GastosService
  ) {}

  ngOnInit(): void {
    const { desde, hasta } = this.obtenerRangoInicial();
    this.fechaDesde = desde;
    this.fechaHasta = hasta;
    this.obtenerReporte();
  }

  aplicarFiltros(): void {
    if (!this.fechaDesde || !this.fechaHasta) {
      alert('Selecciona un rango de fechas para consultar el reporte.');
      return;
    }

    if (this.fechaDesde > this.fechaHasta) {
      alert('La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }

    this.obtenerReporte();
  }

  private obtenerReporte(): void {
    if (!this.fechaDesde || !this.fechaHasta) {
      return;
    }

    const desde = this.formatearFecha(this.fechaDesde);
    const hasta = this.formatearFecha(this.fechaHasta);

    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      semanal: this.ventasService.getReporteSemanal(desde, hasta),
      ingresos: this.ventasService.getReporteIngresos(desde, hasta),
      gastos: this.gastosService.getReporteGastos(desde, hasta),
    }).subscribe({
      next: (data) => {
        const respuestaSemanal = data.semanal as ReporteSemanalResponse;
        const respuestaIngresos = data.ingresos as ReporteIngresosResponse;
        const respuestaGastos = data.gastos;

        this.reporteSemanal = this.ordenarPorFechaDesc(
          Object.values(respuestaSemanal.resumen || {})
        );
        this.resumenTotales = respuestaSemanal.total || null;

        const ingresosDias = Object.values(respuestaIngresos.resumen || {}).map(
          (dia) => this.normalizarDiaIngreso(dia)
        );
        this.reporteIngresos = this.ordenarPorFechaDesc(ingresosDias);
        this.totalesIngresos = this.normalizarTotalesIngreso(respuestaIngresos.totales);
        const gastosProcesados = this.procesarGastos(respuestaGastos);
        this.totalGastos = gastosProcesados.total;
        this.gastosDetalle = gastosProcesados.gastos;
        this.actualizarIngresoNeto();
        this.actualizarResumenIngresos();
        this.mostrarGastosDetalle = false;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los reportes', err);
        this.errorMessage = 'No fue posible cargar los reportes. Intenta nuevamente.';
        this.reporteSemanal = [];
        this.resumenTotales = null;
        this.reporteIngresos = [];
        this.totalesIngresos = null;
        this.totalGastos = 0;
        this.gastosDetalle = [];
        this.mostrarGastosDetalle = false;
        this.ingresoNeto = 0;
        this.totalGarrafonesVendidos = 0;
        this.totalMontoVentas = 0;
        this.isLoading = false;
      },
    });
  }

  generarPDF(): void {
    const contenido = this.construirContenidoPDF();
    if (!contenido) {
      alert('No hay información para exportar.');
      return;
    }

    const ventana = window.open('', '_blank', 'width=900,height=650');
    if (!ventana) {
      alert('No se pudo abrir la ventana de descarga. Verifica si el navegador bloqueó los pop-ups.');
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${this.tipoReporteSeleccionado === 'semanal' ? 'Reporte Semanal' : 'Reporte de Ingresos'}</title>
          <style>${this.obtenerEstilosImpresion()}</style>
        </head>
        <body>
          ${contenido}
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  }

  private construirContenidoPDF(): string {
    const rango = this.obtenerTextoRangoFechas();

    if (this.tipoReporteSeleccionado === 'semanal') {
      if (!this.reporteSemanal.length) {
        return '';
      }

      const totales = this.resumenTotales
        ? `
          <div class="totales">
            <div class="total-item">
              <span class="label">Total Ventas</span>
              <span class="value">${this.resumenTotales.ventas}</span>
            </div>
            <div class="total-item">
              <span class="label">Total Crédito</span>
              <span class="value">${this.resumenTotales.credito}</span>
            </div>
            <div class="total-item">
              <span class="label">Entrega Total</span>
              <span class="value">${this.resumenTotales.entrega_total}</span>
            </div>
          </div>
        `
        : '';

      const filas = this.reporteSemanal
        .map(
          (item) => `
            <tr>
              <td>${item.dia}</td>
              <td>${item.fecha}</td>
              <td>${item.ventas}</td>
              <td>${item.credito}</td>
              <td>${item.entrega_total}</td>
              <td>${item.garrafones_en_planta}</td>
            </tr>
          `
        )
        .join('');

      return `
        <h1>Reporte Semanal de Ventas</h1>
        ${rango}
        ${totales}
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Fecha</th>
              <th>Ventas</th>
              <th>Crédito</th>
              <th>Entrega Total</th>
              <th>Garrafones en Planta</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      `;
    }

    if (!this.reporteIngresos.length) {
      return '';
    }

    const totalesIngresos = this.totalesIngresos
      ? `
        <div class="totales">
          <div class="total-item">
            <span class="label">Ingresos</span>
            <span class="value">${this.formatearMoneda(this.totalesIngresos.ingresos)}</span>
          </div>
          <div class="total-item">
            <span class="label">Créditos</span>
            <span class="value">${this.formatearMoneda(
              this.totalesIngresos.creditos_monto ?? this.totalesIngresos.creditos
            )}</span>
          </div>
          <div class="total-item">
            <span class="label">Vendidos</span>
            <span class="value">${this.totalGarrafonesVendidos}</span>
          </div>
          <div class="total-item">
            <span class="label">Monto Ventas</span>
            <span class="value">${this.formatearMoneda(this.totalMontoVentas)}</span>
          </div>
          <div class="total-item">
            <span class="label">Gastos</span>
            <span class="value">${this.formatearMoneda(this.totalGastos)}</span>
          </div>
          <div class="total-item">
            <span class="label">Ingreso Neto</span>
            <span class="value">${this.formatearMoneda(this.ingresoNeto)}</span>
          </div>
        </div>
      `
      : '';

    const filasIngresos = this.reporteIngresos
      .map(
        (item) => `
          <tr>
            <td>${item.dia}</td>
            <td>${item.fecha}</td>
            <td>${item.vendidos}</td>
            <td>${this.formatearMoneda(item.ventas)}</td>
            <td>${this.formatearMoneda(item.creditos_monto ?? item.creditos)}</td>
            <td>${this.formatearMoneda(item.ingreso)}</td>
          </tr>
        `
      )
      .join('');

    return `
      <h1>Reporte de Ingresos</h1>
      ${rango}
      ${totalesIngresos}
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Fecha</th>
            <th>Garrafones Vendidos</th>
            <th>Ventas</th>
            <th>Créditos</th>
            <th>Ingreso Neto</th>
          </tr>
        </thead>
        <tbody>
          ${filasIngresos}
        </tbody>
      </table>
    `;
  }

  private obtenerTextoRangoFechas(): string {
    if (!this.fechaDesde || !this.fechaHasta) {
      return '';
    }
    return `<p class="rango-fechas">Periodo: ${this.formatearFechaVisual(
      this.fechaDesde
    )} al ${this.formatearFechaVisual(this.fechaHasta)}</p>`;
  }

  private obtenerEstilosImpresion(): string {
    return `
      body {
        font-family: Arial, Helvetica, sans-serif;
        padding: 24px;
        color: #1f1f1f;
      }
      h1 {
        text-align: center;
        margin-bottom: 0;
      }
      .rango-fechas {
        text-align: center;
        margin: 8px 0 20px;
        font-weight: 500;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      th, td {
        border: 1px solid #d0d0d0;
        padding: 8px;
        text-align: left;
        font-size: 13px;
      }
      th {
        background-color: #f5f5f5;
      }
      .totales {
        display: flex;
        gap: 12px;
        margin: 16px 0;
      }
      .total-item {
        flex: 1;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        padding: 10px;
      }
      .total-item .label {
        font-size: 12px;
        text-transform: uppercase;
        color: #777;
      }
      .total-item .value {
        font-size: 18px;
        font-weight: bold;
      }
    `;
  }

  private formatearFechaVisual(fecha: Date): string {
    return fecha.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private ordenarPorFechaDesc<T extends { fecha: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA;
    });
  }

  private normalizarDiaIngreso(dia: any): ReporteIngresosDia {
    return {
      ...dia,
      vendidos: this.aNumero(dia.vendidos),
      ventas: this.aNumero(dia.ventas),
      creditos: this.aNumero(dia.creditos),
      creditos_monto:
        dia.creditos_monto !== undefined ? this.aNumero(dia.creditos_monto) : undefined,
      ingreso: this.aNumero(dia.ingreso),
    };
  }

  private normalizarTotalesIngreso(
    totales?: ReporteIngresosTotales | null
  ): ReporteIngresosTotales | null {
    if (!totales) {
      return null;
    }

    const creditosMonto =
      (totales as any).creditos_monto !== undefined
        ? this.aNumero((totales as any).creditos_monto)
        : this.aNumero(totales.creditos);

    return {
      ingresos: this.aNumero(totales.ingresos),
      creditos: this.aNumero(totales.creditos),
      vendidos: this.aNumero(totales.vendidos),
      creditos_monto: creditosMonto,
    };
  }

  private aNumero(valor: any): number {
    if (typeof valor === 'number') {
      return isNaN(valor) ? 0 : valor;
    }
    if (typeof valor === 'string') {
      const numero = parseFloat(valor);
      return isNaN(numero) ? 0 : numero;
    }
    return 0;
  }

  toggleGastos(): void {
    if (!this.gastosDetalle.length) {
      return;
    }
    this.mostrarGastosDetalle = !this.mostrarGastosDetalle;
  }

  private actualizarResumenIngresos(): void {
    const vendidosCalculados = this.reporteIngresos.reduce(
      (sum, dia) => sum + (dia.vendidos || 0),
      0
    );
    const ventasCalculadas = this.reporteIngresos.reduce(
      (sum, dia) => sum + (dia.ventas || 0),
      0
    );

    if (this.totalesIngresos) {
      this.totalGarrafonesVendidos =
        this.totalesIngresos.vendidos && this.totalesIngresos.vendidos > 0
          ? this.totalesIngresos.vendidos
          : vendidosCalculados;
      this.totalesIngresos.vendidos = this.totalGarrafonesVendidos;
    } else {
      this.totalGarrafonesVendidos = vendidosCalculados;
    }

    this.totalMontoVentas = ventasCalculadas;
  }

  private procesarGastos(respuesta: any): { total: number; gastos: Gasto[] } {
    if (!respuesta) {
      return { total: 0, gastos: [] };
    }

    let coleccion: any[] = [];
    if (Array.isArray(respuesta.resumen)) {
      coleccion = respuesta.resumen;
    } else if (Array.isArray(respuesta.gastos)) {
      coleccion = respuesta.gastos;
    } else if (Array.isArray(respuesta.data)) {
      coleccion = respuesta.data;
    }

    const gastos = coleccion.map((item) => ({
      ...item,
      valor: this.aNumero(item.valor),
    })) as Gasto[];

    let total = 0;
    if (typeof respuesta.total === 'number') {
      total = respuesta.total;
    } else if (typeof respuesta.total === 'string') {
      const numero = parseFloat(respuesta.total);
      total = isNaN(numero) ? 0 : numero;
    } else {
      total = gastos.reduce((sum: number, gasto: Gasto) => sum + (gasto.valor || 0), 0);
    }

    return { total, gastos };
  }

  private actualizarIngresoNeto(): void {
    const ingresos = this.totalesIngresos?.ingresos ?? 0;
    this.ingresoNeto = ingresos - (this.totalGastos || 0);
  }

  private obtenerRangoInicial(): { desde: Date; hasta: Date } {
    const hoy = new Date();
    const inicio = new Date(hoy);
    const diaSemana = hoy.getDay(); // 0 = domingo
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1; // iniciar en lunes
    inicio.setDate(hoy.getDate() - diferencia);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(hoy);
    fin.setHours(0, 0, 0, 0);

    return { desde: inicio, hasta: fin };
  }
}
