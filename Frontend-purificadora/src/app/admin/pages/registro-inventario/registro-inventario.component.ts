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
    console.log(this.accion);
    console.log(this.cantidadCambio);


    if (!this.accion || this.cantidadCambio <= 0) {
      alert('Por favor selecciona una acción y una cantidad válida.');
      return;
    }

    if (this.accion === 'incrementar') {
      this.productoSeleccionado!.cantidad! += this.cantidadCambio;
      this.cantidadCambio=+this.cantidadCambio
    } else if (this.accion === 'disminuir') {
      this.cantidadCambio=(-this.cantidadCambio);
      if (this.productoSeleccionado!.cantidad! - this.cantidadCambio < 0) {
        console.log('hola');

        this.cantidadCambio=-Number(this.cantidadCambio);
        alert('No puedes reducir más allá de 0.');
        return;
      }
      this.productoSeleccionado!.cantidad! -= this.cantidadCambio;
    }

    // Actualizamos el estado basado en la cantidad
   // this.productoSeleccionado!.estado =
      this.productoSeleccionado!.cantidad! > 10 ? 'Disponible' : 'Poca Existencia';

    this.actualizarInventario(this.productoSeleccionado!, this.cantidadCambio);
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
