import { Component } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../../interfaces/inventario.interface';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent {

  constructor(
    private inventarioService: InventarioService
  ){}

  ngOnInit(){
    this.cargarInventario();
  }
  inventario: Inventario[] = [
  ];

  displayedColumns = ['nombre', 'cantidad', 'estado', 'acciones'];

  guardarCambios(item: Inventario) {
    if (item.cantidad! > 10) {
      //item.estado = 'Disponible';
    } else if (item.cantidad! <= 10) {
      //item.estado = 'Poca Existencia';
    }
    this.actualizarInventario(item);
    alert(`Cambios guardados para ${item.Producto.nombre}: Cantidad = ${item.cantidad}, Estado = ${item}`);
  }

  cargarInventario(){
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        this.inventario = data as Inventario[];
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  actualizarInventario(inventarioActualizar: Inventario){
    this.inventarioService.updateInventario(inventarioActualizar,3).subscribe({
      next: (data) => {
        alert('Se Actualizo el inventario ')
        this.cargarInventario();
      },
      error: (error) => {
        console.error(error);
        alert('Error al Actualizar el invetario: '+error.mensaje)
      }
    })
  }
}
