import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../../interfaces/cliente.interface';

@Component({
  selector: 'app-crud-clientes',
  templateUrl: './crud-clientes.component.html',
  styleUrls: ['./crud-clientes.component.css'],
})
export class CrudClientesComponent {

  constructor(
    private clientesService: ClientesService
  ){}

  ngOnInit(){
    this.listarClientes();
  }
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  aldeas = ['Aldea 1', 'Aldea 2', 'Aldea 3', 'Aldea 4']; // Lista de aldeas disponibles
  clientes: Cliente[]=[];
  clientes2 = [
    {
      nombre: 'Juan Pérez',
      ruta: 'Lunes',
      aldea: 'Aldea 1',
      direccion: 'Calle 123',
      coordenadas: '(19.432608, -99.133209)',
      telefono: '555-1234',
    },
    {
      nombre: 'Ana García',
      ruta: 'Martes',
      aldea: 'Aldea 2',
      direccion: 'Av. Siempre Viva 456',
      coordenadas: '(19.422608, -99.143209)',
      telefono: '555-5678',
    },
  ];

  displayedColumns = ['nombre', 'ruta', 'aldea', 'direccion', 'coordenadas', 'telefono', 'acciones'];

  clienteSeleccionado = null; // Cliente en edición
  clienteFormulario: Cliente =
    {
      nombre: '',
      ruta: '',
      aldea: {nombre:''},
      direccion: '',
      coordenadas: '',
      telefono: '' }; // Formulario vacío
  mostrarFormulario = false; // Controla si se muestra el formulario

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.clienteSeleccionado = null;
    this.clienteFormulario = { nombre: '', ruta: '', aldea: {nombre:''}, direccion: '', coordenadas: '', telefono: '' };
  }

  editarCliente(cliente: any) {
    this.mostrarFormulario = true;
    this.clienteSeleccionado = cliente;
    this.clienteFormulario = { ...cliente }; // Carga los datos del cliente
  }

  guardarCliente() {
    if (!this.clienteFormulario.nombre || !this.clienteFormulario.ruta || !this.clienteFormulario.aldea) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (this.clienteSeleccionado) {
      // Actualizar cliente existente
      Object.assign(this.clienteSeleccionado, this.clienteFormulario);
      alert('Cliente actualizado con éxito.');
    } else {
      // Crear nuevo cliente
      this.clientes.push({ ...this.clienteFormulario });
      this.crearCliente();
      alert('Cliente registrado con éxito.');
    }

    this.cancelarFormulario();
  }

  eliminarCliente(cliente: any) {
    if (confirm(`¿Estás seguro de eliminar al cliente "${cliente.nombre}"?`)) {
      this.clientes = this.clientes.filter((c) => c !== cliente);
      alert('Cliente eliminado.');
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.clienteFormulario = { nombre: '', ruta: '', aldea: {nombre:''}, direccion: '', coordenadas: '', telefono: '' };
  }

  listarClientes(){
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes as Cliente[];
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
      }
    })
  }

  crearCliente(){
    this.clientesService.crearCliente(this.clienteFormulario).subscribe({
      next: (cliente) => {
    //    this.clientes.push(cliente);
        alert('Cliente creado con exito.')
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        alert('Error al crear cliente:'+ error);
      }
    })
  }

  actualizarCliente(){
    this.clientesService.updateCliente(this.clienteFormulario).subscribe({
      next: (cliente) => {
    //    this.clientes.push(cliente);
        alert('Cliente actualizado con exito.')
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        alert('Error al crear cliente:'+ error);
      }
    })
  }
}
