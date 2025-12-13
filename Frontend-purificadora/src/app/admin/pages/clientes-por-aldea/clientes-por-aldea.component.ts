import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import {
  AldeaResumen,
  ReporteAldeasResponse,
} from '../../../interfaces/reporte-aldea.interface';

@Component({
  selector: 'app-clientes-por-aldea',
  templateUrl: './clientes-por-aldea.component.html',
  styleUrls: ['./clientes-por-aldea.component.css'],
})
export class ClientesPorAldeaComponent implements OnInit {
  resumen: AldeaResumen[] = [];
  totalGeneral = 0;
  maxClientes = 0;
  isLoading = false;
  errorMessage = '';
  aldeaSeleccionada: AldeaResumen | null = null;

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.clientesService.getReporteClientesPorAldea().subscribe({
      next: (data) => {
        const respuesta = data as ReporteAldeasResponse;
        this.resumen = respuesta.resumen || [];
        this.totalGeneral = respuesta.totalGeneral || 0;
        this.maxClientes = this.resumen.reduce(
          (max, item) => Math.max(max, item.totalClientes),
          0
        );
        this.aldeaSeleccionada = this.resumen[0] || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el reporte de aldeas', err);
        this.errorMessage = 'No fue posible cargar la información.';
        this.isLoading = false;
      },
    });
  }

  obtenerPorcentaje(total: number): number {
    if (!this.maxClientes) {
      return 0;
    }
    return (total / this.maxClientes) * 100;
  }

  obtenerColor(index: number): string {
    const paleta = ['#2196f3', '#66bb6a', '#ffb74d', '#ab47bc', '#26c6da', '#ef5350'];
    return paleta[index % paleta.length];
  }

  seleccionarAldea(aldea: AldeaResumen): void {
    this.aldeaSeleccionada = aldea;
  }
}
