import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientesService } from '../../services/clientes.service';
import { ProductosService } from '../../services/productos.service';
import { VentasService } from '../../services/ventas.service';
import { Cliente } from '../../../interfaces/cliente.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { Venta, DetalleVenta, UltimaVentaCliente } from '../../../interfaces/venta.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  styles: [`
    /* Estilos para el contenedor del SnackBar (versiones nuevas y antiguas) */
    ::ng-deep .snackbar-success,
    ::ng-deep .snackbar-success .mdc-snackbar__surface {
      background-color: #4caf50 !important; /* Verde */
      color: white !important;
      --mdc-snackbar-container-color: #4caf50;
      --mdc-snackbar-supporting-text-color: white;
    }
    /* Color del texto y botones para éxito */
    ::ng-deep .snackbar-success .mat-simple-snackbar-action,
    ::ng-deep .snackbar-success .mat-mdc-snack-bar-action,
    ::ng-deep .snackbar-success .mdc-snackbar__label {
      color: white !important;
    }

    /* Estilos para el contenedor de Error */
    ::ng-deep .snackbar-error,
    ::ng-deep .snackbar-error .mdc-snackbar__surface {
      background-color: #f44336 !important; /* Rojo */
      color: white !important;
      --mdc-snackbar-container-color: #f44336;
      --mdc-snackbar-supporting-text-color: white;
    }
    /* Color del texto y botones para error */
    ::ng-deep .snackbar-error .mat-simple-snackbar-action,
    ::ng-deep .snackbar-error .mat-mdc-snack-bar-action,
    ::ng-deep .snackbar-error .mdc-snackbar__label {
      color: white !important;
    }
  `]
})
export class VentasComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  productos: Producto[] = [];
  productosVenta: Producto[] = [];
  displayedColumns: string[] = ['nombre', 'telefono', 'coordenadas', 'estado', 'ultimaCompra', 'acciones'];
  clienteSeleccionado: Cliente | null = null;
  totalVenta: number = 0;
  mostrarFormularioVenta: boolean = false;
  mostrarConfirmacion: boolean = false;
  private usuarioSub?: Subscription;

  // Variables para el filtro
  diaSeleccionado: string = '';
  diaActualNombre: string = '';
  diasSemana: string[] = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  textoBusqueda: string = ''; // Variable para el buscador

  // Detalles de la venta
  venta: Venta = {
    id_cliente: 0,
    fecha_compra: new Date(),
    total: 0,
    id_usuario: 0,
    id_fomrma_pago: 1, // 1 = Pago, 2 = Crédito
  };

  constructor(
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private ventasService: VentasService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.establecerUsuario();
    this.inicializarDiaActual();
    this.cargarTodosLosClientes();
    this.cargarProductos();
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }

  // Inicializar el día actual
  inicializarDiaActual(): void {
    const diaActual = this.diasSemana[new Date().getDay()];
    this.diaActualNombre = diaActual.charAt(0).toUpperCase() + diaActual.slice(1);
    this.diaSeleccionado = diaActual; // Por defecto muestra el día actual
  }

  // Cargar todos los clientes
  cargarTodosLosClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data as Cliente[];
        this.aplicarFiltros(); // Usamos la nueva función unificada
        this.cargarUltimasCompras();
      },
      error: (err) => console.error('Error al cargar los clientes', err),
    });
  }

  // Filtro unificado: Día + Nombre
  aplicarFiltros(): void {
    let filtrados = [...this.clientes];

    // 1. Filtrar por día
    if (this.diaSeleccionado !== 'todos') {
      filtrados = filtrados.filter(
        (cliente) => cliente.ruta.toLowerCase() === this.diaSeleccionado.toLowerCase()
      );
    }

    // 2. Filtrar por nombre (buscador)
    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(termino)
      );
    }

    this.clientesFiltrados = filtrados;
  }

  // Cargar productos disponibles
  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data as Producto[];
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  // Seleccionar un cliente y abrir el formulario de venta
  registrarVenta(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.venta.id_cliente = cliente.id_cliente!;
    this.mostrarFormularioVenta = true;
    this.resetVenta();
  }

  // Reiniciar detalles de la venta
  resetVenta(): void {
    this.productos.forEach((producto) => (producto.cantidad = 0));
    this.totalVenta = 0;
    this.venta.id_fomrma_pago = 1; // Pago por defecto
  }

  // Calcular el total de la venta
  calcularTotal(): void {
    this.totalVenta = this.productos.reduce((total, producto) => {
      return total + producto.precio * (producto.cantidad || 0);
    }, 0);
    this.venta.total = this.totalVenta; // Actualizar el total en la venta
  }

  // Construir los detalles de la venta
  construirDetalleVenta() {
    return this.productos.filter(
      (producto) => producto.cantidad && producto.cantidad > 0
    );
  }

  // Guardar la venta
  guardarVenta(): void {
    if (this.totalVenta > 0 && this.clienteSeleccionado) {
      this.productosVenta = this.construirDetalleVenta();
      this.mostrarConfirmacion = true;
    } else {
      this.mostrarNotificacion('Agrega productos y selecciona un cliente antes de guardar la venta.', 'advertencia');
    }
  }

  confirmarVenta(): void {
    if (!(this.totalVenta > 0 && this.clienteSeleccionado)) {
      return;
    }
    if (!this.venta.id_usuario) {
      this.mostrarNotificacion('No se pudo determinar el usuario que registra la venta.', 'error');
      return;
    }

    this.mostrarConfirmacion = false;

    const ventaCompleta = {
      id_usuario: this.venta.id_usuario,
      id_metodo_pago: this.venta.id_fomrma_pago,
      id_cliente: this.venta.id_cliente,
      productos: this.productosVenta,
    };

    this.ventasService.registrarVenta(ventaCompleta).subscribe({
      next: () => {
        this.mostrarNotificacion(`Venta registrada exitosamente para ${this.clienteSeleccionado!.nombre}`, 'exito');
        const fechaActual = new Date().toISOString();
        this.clienteSeleccionado!.estado = 'abastecido'; // Actualizar estado local
        this.clienteSeleccionado!.ultimaCompra = this.formatearFechaCorta(fechaActual);
        
        // Actualizar la lista filtrada
        const index = this.clientesFiltrados.findIndex(
          (c) => c.id_cliente === this.clienteSeleccionado!.id_cliente
        );
        if (index !== -1) {
          this.clientesFiltrados[index].estado = 'abastecido';
          this.clientesFiltrados[index].ultimaCompra = this.formatearFechaCorta(fechaActual);
        }
        
        this.mostrarFormularioVenta = false;
        this.resetVenta();
      },
      error: (err) => {
        console.error('Error al registrar la venta', err.error);
        const mensajeError = err.error?.error || 'Ocurrió un error desconocido al registrar la venta.';
        this.mostrarNotificacion('Error al registrar la venta: ' + mensajeError, 'error');
      },
    });
  }

  // Cancelar la venta
  cancelarVenta(): void {
    this.mostrarConfirmacion = false;
    this.mostrarFormularioVenta = false;
    this.resetVenta();
  }

  private cargarUltimasCompras(): void {
    const clientesConId = this.clientes.filter((cliente) => !!cliente.id_cliente);
    if (!clientesConId.length) {
      return;
    }

    const solicitudes = clientesConId.map((cliente) =>
      this.ventasService.getUltimaVentaCliente(cliente.id_cliente!).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(solicitudes).subscribe({
      next: (respuestas) => {
        respuestas.forEach((respuesta, index) => {
          const cliente = clientesConId[index];
          if (!cliente) {
            return;
          }

          const ultimaVenta = respuesta as UltimaVentaCliente | null;
          if (ultimaVenta && ultimaVenta.fecha) {
            cliente.ultimaCompra = this.formatearFechaCorta(ultimaVenta.fecha);
            cliente.estado = this.esSemanaActual(ultimaVenta.fecha)
              ? 'abastecido'
              : 'desabastecido';
          } else {
            cliente.ultimaCompra = 'Sin registro';
            cliente.estado = 'desabastecido';
          }
        });
      },
      error: (err) => console.error('Error al obtener últimas compras', err),
    });
  }

  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
  }

  private esSemanaActual(fechaIso: string): boolean {
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) {
      return false;
    }

    const inicioSemana = this.obtenerInicioSemana(new Date());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return fecha >= inicioSemana && fecha <= finSemana;
  }

  private obtenerInicioSemana(fechaBase: Date): Date {
    const inicio = new Date(fechaBase);
    const diaSemana = inicio.getDay(); // 0 = domingo
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1; // Semana inicia lunes
    inicio.setDate(inicio.getDate() - diferencia);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }

  private formatearFechaCorta(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) {
      return 'Sin registro';
    }
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private establecerUsuario(): void {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.venta.id_usuario = usuario.id;
    }

    this.usuarioSub = this.authService.getUsuario$().subscribe((user) => {
      this.venta.id_usuario = user?.id || 0;
    });
  }

  private mostrarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia'): void {
    // Si es error usa la clase roja, de lo contrario (éxito o advertencia) usa la verde
    const clase = tipo === 'error' ? 'snackbar-error' : 'snackbar-success';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [clase]
    });
  }
}
