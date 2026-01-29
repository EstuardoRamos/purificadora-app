import { Component, OnDestroy, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
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
  encapsulation: ViewEncapsulation.None,
  styles: [`
    ::ng-deep .snackbar-success,
    ::ng-deep .snackbar-success .mdc-snackbar__surface {
      background-color: #4caf50 !important;
      color: white !important;
      --mdc-snackbar-container-color: #4caf50;
      --mdc-snackbar-supporting-text-color: white;
    }
    ::ng-deep .snackbar-success .mat-simple-snackbar-action,
    ::ng-deep .snackbar-success .mat-mdc-snack-bar-action,
    ::ng-deep .snackbar-success .mdc-snackbar__label {
      color: white !important;
    }
    ::ng-deep .snackbar-error,
    ::ng-deep .snackbar-error .mdc-snackbar__surface {
      background-color: #f44336 !important;
      color: white !important;
      --mdc-snackbar-container-color: #f44336;
      --mdc-snackbar-supporting-text-color: white;
    }
    ::ng-deep .snackbar-error .mat-simple-snackbar-action,
    ::ng-deep .snackbar-error .mat-mdc-snack-bar-action,
    ::ng-deep .snackbar-error .mdc-snackbar__label {
      color: white !important;
    }
  `]
})
export class VentasComponent implements OnInit, OnDestroy, AfterViewInit {
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

  diaSeleccionado: string = '';
  diaActualNombre: string = '';
  diasSemana: string[] = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  textoBusqueda: string = '';
  
  mostrarMapa: boolean = false;
  map: L.Map | undefined;
  markers: L.Layer[] = [];

  venta: Venta = {
    id_cliente: 0,
    fecha_compra: new Date(),
    total: 0,
    id_usuario: 0,
    id_fomrma_pago: 1,
  };

  constructor(
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private ventasService: VentasService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.injectarEstilosMapa();
    this.corregirIconosLeaflet();
    this.establecerUsuario();
    this.inicializarDiaActual();
    this.cargarTodosLosClientes();
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    // No inicializamos el mapa automáticamente
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }

  inicializarDiaActual(): void {
    const diaActual = this.diasSemana[new Date().getDay()];
    this.diaActualNombre = diaActual.charAt(0).toUpperCase() + diaActual.slice(1);
    this.diaSeleccionado = diaActual;
  }

  cargarTodosLosClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data as Cliente[];
        this.aplicarFiltros();
        this.cargarUltimasCompras();
      },
      error: (err) => console.error('Error al cargar los clientes', err),
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.clientes];

    if (this.diaSeleccionado !== 'todos') {
      filtrados = filtrados.filter(
        (cliente) => cliente.ruta.toLowerCase() === this.diaSeleccionado.toLowerCase()
      );
    }

    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(termino)
      );
    }

    this.clientesFiltrados = filtrados;
    
    if (this.mostrarMapa) {
      this.actualizarMarcadores();
    }
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data as Producto[];
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  registrarVenta(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.venta.id_cliente = cliente.id_cliente!;
    this.mostrarFormularioVenta = true;
    this.resetVenta();
  }

  resetVenta(): void {
    this.productos.forEach((producto) => (producto.cantidad = 0));
    this.totalVenta = 0;
    this.venta.id_fomrma_pago = 1;
  }

  calcularTotal(): void {
    this.totalVenta = this.productos.reduce((total, producto) => {
      return total + producto.precio * (producto.cantidad || 0);
    }, 0);
    this.venta.total = this.totalVenta;
  }

  construirDetalleVenta() {
    return this.productos.filter(
      (producto) => producto.cantidad && producto.cantidad > 0
    );
  }

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
        this.clienteSeleccionado!.estado = 'abastecido';
        this.clienteSeleccionado!.ultimaCompra = this.formatearFechaCorta(fechaActual);
        
        const index = this.clientesFiltrados.findIndex(
          (c) => c.id_cliente === this.clienteSeleccionado!.id_cliente
        );
        if (index !== -1) {
          this.clientesFiltrados[index].estado = 'abastecido';
          this.clientesFiltrados[index].ultimaCompra = this.formatearFechaCorta(fechaActual);
          if (this.mostrarMapa) {
            this.actualizarMarcadores();
          }
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
    const diaSemana = inicio.getDay();
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
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
    const clase = tipo === 'error' ? 'snackbar-error' : 'snackbar-success';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [clase]
    });
  }

  // --- Lógica del Mapa ---

  toggleMapa(): void {
    this.mostrarMapa = !this.mostrarMapa;
    if (this.mostrarMapa) {
      setTimeout(() => {
        if (!this.map) {
          this.initMap();
        } else {
          this.map.invalidateSize();
        }
        this.actualizarMarcadores();
      }, 200);
    }
  }

  private injectarEstilosMapa(): void {
    if (document.getElementById('leaflet-css-injected')) return;

    const link = document.createElement('link');
    link.id = 'leaflet-css-injected';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  private corregirIconosLeaflet(): void {
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    
    const defaultIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    
    L.Marker.prototype.options.icon = defaultIcon;
  }

  private initMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Elemento del mapa no encontrado');
      return;
    }

    this.map = L.map('map').setView([14.6349, -90.5069], 12);

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private actualizarMarcadores(): void {
    if (!this.map) {
      console.warn('El mapa no está inicializado');
      return;
    }

    this.markers.forEach(m => this.map!.removeLayer(m));
    this.markers = [];

    const bounds = L.latLngBounds([]);
    let marcadoresValidos = 0;

    this.clientesFiltrados.forEach((cliente) => {
      if (!cliente.coordenadas) {
        return;
      }

      const coordenadasLimpias = cliente.coordenadas
        .replace(/[()]/g, '')
        .trim();

      const parts = coordenadasLimpias.split(',');
      
      if (parts.length !== 2) {
        return;
      }

      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());

      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      const color = cliente.estado === 'abastecido' ? '#4caf50' : '#f44336';
      
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });

      const popupContent = `
        <div style="color: #000; font-family: Arial; min-width: 220px;">
          <div style="margin-bottom: 8px;">
            <b style="font-size: 1.1em;">${cliente.nombre}</b>
          </div>
          <div style="margin-bottom: 4px; color: #666;">
            📞 ${cliente.telefono || 'Sin teléfono'}
          </div>
          <div style="margin-bottom: 8px;">
            <span style="color: ${color}; font-weight: bold; font-size: 0.9em;">
              ${cliente.estado === 'abastecido' ? '✓ Abastecido' : '✗ Desabastecido'}
            </span>
          </div>
          <div style="margin-bottom: 8px; color: #666; font-size: 0.85em;">
            Última compra: ${cliente.ultimaCompra || 'Sin registro'}
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button 
              id="navegar-btn-${cliente.id_cliente}" 
              style="
                flex: 1;
                padding: 8px 12px;
                background-color: #4285F4;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.85em;
              "
              onmouseover="this.style.backgroundColor='#1976D2'"
              onmouseout="this.style.backgroundColor='#4285F4'"
            >
              Cómo llegar
            </button>
            
            <button 
              id="venta-btn-${cliente.id_cliente}" 
              style="
                flex: 1;
                padding: 8px 12px;
                background-color: #ffa726;
                color: #000;
                border: none;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.85em;
              "
              onmouseover="this.style.backgroundColor='#fb8c00'"
              onmouseout="this.style.backgroundColor='#ffa726'"
            >
              Venta
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btnNavegar = document.getElementById(`navegar-btn-${cliente.id_cliente}`);
        if (btnNavegar) {
          btnNavegar.addEventListener('click', () => {
            this.abrirNavegacionGoogle(lat, lng, cliente.nombre);
          });
        }

        const btnVenta = document.getElementById(`venta-btn-${cliente.id_cliente}`);
        if (btnVenta) {
          btnVenta.addEventListener('click', () => {
            this.registrarVentaDesdePopup(cliente);
          });
        }
      });

      marker.addTo(this.map!);
      this.markers.push(marker);
      bounds.extend([lat, lng]);
      marcadoresValidos++;
    });

    if (marcadoresValidos > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      console.warn('No hay clientes con coordenadas válidas para mostrar');
      this.map.setView([14.6349, -90.5069], 12);
    }
  }

  private registrarVentaDesdePopup(cliente: Cliente): void {
    this.map?.closePopup();
    this.mostrarMapa = false;
    
    setTimeout(() => {
      this.registrarVenta(cliente);
    }, 100);
  }

  private abrirNavegacionGoogle(lat: number, lng: number, nombreCliente: string): void {
    const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(urlGoogleMaps, '_blank');
    this.mostrarNotificacion(`Abriendo navegación hacia ${nombreCliente}`, 'exito');
  }
}