import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { VentasService } from '../../services/ventas.service';
import {
  ReporteSemanalDia,
  ReporteSemanalResponse,
  ReporteSemanalTotales,
  ReporteIngresosDia,
  ReporteIngresosResponse,
  ReporteIngresosTotales,
} from '../../../interfaces/reporte-semanal.interface';

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
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  isLoading = false;
  errorMessage = '';
  tipoReporteSeleccionado: 'semanal' | 'ingresos' = 'semanal';

  constructor(private ventasService: VentasService) {}

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
    }).subscribe({
      next: (data) => {
        const respuestaSemanal = data.semanal as ReporteSemanalResponse;
        const respuestaIngresos = data.ingresos as ReporteIngresosResponse;

        this.reporteSemanal = Object.values(respuestaSemanal.resumen || {});
        this.resumenTotales = respuestaSemanal.total || null;

        this.reporteIngresos = Object.values(respuestaIngresos.resumen || {});
        this.totalesIngresos = respuestaIngresos.totales || null;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los reportes', err);
        this.errorMessage = 'No fue posible cargar los reportes. Intenta nuevamente.';
        this.reporteSemanal = [];
        this.resumenTotales = null;
        this.reporteIngresos = [];
        this.totalesIngresos = null;
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
            <span class="value">${this.formatearMoneda(this.totalesIngresos.creditos)}</span>
          </div>
          <div class="total-item">
            <span class="label">Vendidos</span>
            <span class="value">${this.totalesIngresos.vendidos}</span>
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
            <td>${this.formatearMoneda(item.creditos)}</td>
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
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
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
