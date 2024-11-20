import { Component } from '@angular/core';
import { AldeasService } from '../../services/aldeas.service';
import { Aldea } from '../../../interfaces/cliente.interface';

@Component({
  selector: 'app-crud-aldeas',
  templateUrl: './crud-aldeas.component.html',
  styleUrls: ['./crud-aldeas.component.css'],
})
export class CrudAldeasComponent {

  constructor(
    private aldeasService: AldeasService,
  ){}
  ngOnInit(){
    this.listarAldeas()
  }
  aldeas:Aldea[] = []

  displayedColumns = ['nombre', 'acciones'];

  aldeaSeleccionada = null; // Aldea en edición
  aldeaFormulario: Aldea = { id_aldea: 0, nombre: '' }; // Formulario vacío
  mostrarFormulario = false; // Controla si se muestra el formulario

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.aldeaSeleccionada = null;
    this.aldeaFormulario = { id_aldea: 0, nombre: '' };
  }

  editarAldea(aldea:any) {
    this.mostrarFormulario = true;
    this.aldeaSeleccionada = aldea;
    this.aldeaFormulario = { ...aldea }; // Carga los datos de la aldea
  }

  guardarAldea() {
    if (!this.aldeaFormulario.nombre) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (this.aldeaSeleccionada) {
      // Actualizar aldea existente
      Object.assign(this.aldeaSeleccionada, this.aldeaFormulario);
      this.updateAldea();
    } else {
      // Crear nueva aldea
      this.aldeas.push({ ...this.aldeaFormulario });
      this.crearAldea()

    }

    this.cancelarFormulario();
  }

  eliminarAldea(aldea:any) {
    if (confirm(`¿Estás seguro de eliminar la aldea "${aldea.nombre}"?`)) {
      this.aldeas = this.aldeas.filter((a) => a !== aldea);
      alert('Aldea eliminada.');
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.aldeaFormulario = { id_aldea: 0, nombre: '' };
  }

  listarAldeas(){
    this.aldeasService.getAldeas().subscribe({
      next: (aldeas) => {
        this.aldeas = aldeas as Aldea[];
      },
      error: (error) => {
        console.error('Error al obtener aldeas:', error);
      }
    })
  }
  crearAldea(){
    this.aldeasService.crearAldea(this.aldeaFormulario).subscribe({
      next: (aldea) => {
        alert('Aldea registrada con éxito.');
        this.ngOnInit()
      },
      error: (error) => {
        console.error('Error al crear aldea:', error);
        alert('Error al crear aldea:'+ error)
      }
    })
  }

  updateAldea(){
    this.aldeasService.updateAldea(this.aldeaFormulario).subscribe({
      next: (aldea) => {
        alert('Aldea actualizada con exito.')
        this.ngOnInit()
      },
      error: (error) => {
        console.error('Error al actualizar aldea:', error);
        alert('Error al actualizar aldea:'+ error);
      }
    })
  }
}
