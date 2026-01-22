import { Component } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../../interfaces/inventario.interface';

@Component({
  selector: 'app-registro-inventario',
  templateUrl: './registro-inventario.component.html',
  styleUrls: ['./registro-inventario.component.css']
})
export class RegistroInventarioComponent {
  inventario: Inventario[] = [];
  displayedColumns = ['nombre', 'cantidad', 'acciones'];

  // Nuevas propiedades para el formulario
  mostrarFormulario: boolean = false;
  productoSeleccionado: Inventario | null = null;
  accion: 'incrementar' | 'disminuir' | null = null;
  cantidadCambio: number = 0;

  constructor(private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        this.inventario = data as Inventario[];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  abrirFormulario(producto: Inventario) {
    this.mostrarFormulario = true;
    this.productoSeleccionado = producto;
    this.accion = null;
    this.cantidadCambio = 0; // Reseteamos valores
  }

  guardarCambio() {
    if (!this.accion || this.cantidadCambio <= 0) {
      alert('Por favor selecciona una acción y una cantidad válida.');
      return;
    }

    let cambio = this.cantidadCambio;

    if (this.accion === 'disminuir') {
      if (this.productoSeleccionado!.cantidad! < cambio) {
        alert('No puedes reducir más allá de 0.');
        return;
      }
      cambio = -cambio; // Convertir a negativo para la resta
    }

    // Actualizamos la cantidad localmente
    this.productoSeleccionado!.cantidad! += cambio;

    this.actualizarInventario(this.productoSeleccionado!, cambio);
    this.cancelarFormulario();
  }

  actualizarInventario(inventarioActualizar: Inventario, cantidadSuma: number) {
    this.inventarioService.updateInventario(inventarioActualizar, cantidadSuma).subscribe({
      next: () => {
        alert('Se actualizó el inventario correctamente');
        this.cargarInventario();
      },
      error: (error) => {
        console.error(error);
        alert('Error al actualizar el inventario: ' + error.error.error);
      },
    });
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.productoSeleccionado = null;
    this.accion = null;
    this.cantidadCambio = 0;
  }
}
