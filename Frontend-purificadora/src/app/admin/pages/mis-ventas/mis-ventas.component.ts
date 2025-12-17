import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { VentasService } from '../../services/ventas.service';
import { Venta } from '../../../interfaces/venta.interface';
import { AuthService } from '../../../services/auth.service';
import { AuthUser } from '../../../interfaces/auth.interface';

@Component({
  selector: 'app-mis-ventas',
  templateUrl: './mis-ventas.component.html',
  styleUrls: ['./mis-ventas.component.css'],
})
export class MisVentasComponent implements OnInit, OnDestroy {
  usuarioActual: AuthUser | null = null;
  ventas: Venta[] = [];
  totalVentas = 0;
  filtros = {
    desde: '',
    hasta: '',
  };
  cargando = false;
  mensajeError = '';
  private usuarioSub?: Subscription;

  constructor(
    private ventasService: VentasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsuarioActual();
    if (this.usuarioActual) {
      this.cargarVentas();
    }

    this.usuarioSub = this.authService.getUsuario$().subscribe((usuario) => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.cargarVentas();
      } else {
        this.ventas = [];
        this.totalVentas = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }

  cargarVentas(): void {
    if (!this.usuarioActual) {
      this.mensajeError = 'No encontramos información del usuario autenticado.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.ventasService
      .getVentasUsuario(
        this.usuarioActual.id,
        this.filtros.desde || undefined,
        this.filtros.hasta || undefined
      )
      .subscribe({
        next: (data) => {
          const ventas = (data as Venta[]).map((venta: any) => {
            const totalNormalizado =
              typeof venta.total === 'string'
                ? parseFloat(venta.total)
                : Number(venta.total || 0);
            const fechaBase = venta.fecha_compra || venta.fecha || venta.fecha_pago;

            return {
              ...venta,
              total: isNaN(totalNormalizado) ? 0 : totalNormalizado,
              fecha_compra: fechaBase ? new Date(fechaBase) : new Date(),
            } as Venta;
          });
          this.ventas = ventas;
          this.calcularTotal();
          this.cargando = false;
        },
        error: (error) => {
          this.cargando = false;
          const mensaje =
            error.error?.error ||
            error.error?.message ||
            'No fue posible obtener tus ventas.';
          this.mensajeError = mensaje;
          this.ventas = [];
          this.totalVentas = 0;
        },
      });
  }

  aplicarFiltros(): void {
    this.cargarVentas();
  }

  limpiarFiltros(): void {
    this.filtros.desde = '';
    this.filtros.hasta = '';
    this.cargarVentas();
  }

  private calcularTotal(): void {
    this.totalVentas = this.ventas.reduce((sum, venta) => {
      const monto =
        typeof venta.total === 'number'
          ? venta.total
          : parseFloat((venta.total as unknown as string) || '0');
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);
  }

  obtenerFechaBonita(venta: Venta): string {
    let fecha: Date | null = null;

    if (venta.fecha_compra instanceof Date) {
      fecha = venta.fecha_compra;
    } else if (venta.fecha_compra) {
      fecha = new Date(venta.fecha_compra as unknown as string);
    } else if (venta.fecha) {
      fecha = new Date(venta.fecha);
    }

    if (!fecha || isNaN(fecha.getTime())) {
      return 'Sin fecha';
    }

    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }
}
