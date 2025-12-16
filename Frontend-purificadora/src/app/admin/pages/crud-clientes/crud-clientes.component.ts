import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { Aldea, Cliente } from '../../../interfaces/cliente.interface';
import { AldeasService } from '../../services/aldeas.service';

@Component({
  selector: 'app-crud-clientes',
  templateUrl: './crud-clientes.component.html',
  styleUrls: ['./crud-clientes.component.css'],
})
export class CrudClientesComponent {

  constructor(
    private clientesService: ClientesService,
    private aldeasService: AldeasService,
  ){}

  ngOnInit(){
    this.listarClientes();
    this.listarAldeas();
  }

  aldeaSelectId:number=0;
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  aldeas:Aldea[]=[]
  clientes: Cliente[]=[];
  clientesFiltrados: Cliente[] = [];
  clientesPaginados: Cliente[] = [];
  terminoBusqueda: string = '';
  filtroRuta: string = 'todos';
  filtroAldea: number | 'todos' = 'todos';
  paginaActual = 1;
  tamanoPagina = 10;
  totalPaginas = 1;

  displayedColumns = ['nombre', 'ruta', 'aldea', 'direccion', 'coordenadas', 'telefono', 'acciones'];

  clienteSeleccionado = null; // Cliente en edición
  clienteFormulario: Cliente =
    {
      id_cliente:0,
      nombre: '',
      ruta: '',
      Aldea: {nombre:''},
      direccion: '',
      coordenadas: '',
      telefono: '' }; // Formulario vacío
      mostrarFormulario = false; // Controla si se muestra el formulario

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.clienteSeleccionado = null;
    this.clienteFormulario = { nombre: '', ruta: '', Aldea: {nombre:''}, direccion: '', coordenadas: '', telefono: '' };
  }

  editarCliente(cliente: any) {
    this.mostrarFormulario = true;
    this.clienteSeleccionado = cliente;
    console.log(cliente);

    this.clienteFormulario = { ...cliente }; // Carga los datos del cliente
  }

  guardarCliente() {
    if (!this.clienteFormulario.nombre || !this.clienteFormulario.ruta || !this.clienteFormulario.id_aldea) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const telefono = (this.clienteFormulario.telefono || '').trim();
    if (!/^\d{8}$/.test(telefono)) {
      alert('El teléfono debe contener exactamente 8 dígitos.');
      return;
    }

    if (this.clienteSeleccionado) {
      //this.clienteFormulario.id_aldea=this.aldeaSelectId;
      // Actualizar cliente existente
      Object.assign(this.clienteSeleccionado, this.clienteFormulario);

      this.actualizarCliente();
      alert('Cliente actualizado con éxito.');
    } else {
      //this.clienteFormulario.id_aldea=this.aldeaSelectId;
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
      this.aplicarFiltros();
      alert('Cliente eliminado.');
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.clienteFormulario = { nombre: '', ruta: '', Aldea: {nombre:''}, direccion: '', coordenadas: '', telefono: '' };
  }

  listarClientes(){
    this.clientesService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes as Cliente[];
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
      }
    })
  }

  crearCliente(){
    this.clientesService.crearCliente(this.clienteFormulario).subscribe({
      next: (cliente) => {
        alert('Cliente creado con exito.')
        this.listarClientes();
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        alert('Error al crear cliente:'+ error);
      }
    })
  }

  actualizarCliente(){
    console.log(this.clienteFormulario);
    this.clienteFormulario.id_aldea
    this.clientesService.updateCliente(this.clienteFormulario).subscribe({
      next: (cliente) => {
        alert('Cliente actualizado con exito.')
        this.listarClientes();
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        alert('Error al crear cliente:'+ error);
      }
    })
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

  aplicarFiltros(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    const rutaFiltro = this.filtroRuta.toLowerCase();

    this.clientesFiltrados = this.clientes.filter((cliente) => {
      const coincideBusqueda =
        !termino ||
        cliente.nombre.toLowerCase().includes(termino) ||
        (cliente.telefono || '').toLowerCase().includes(termino);

      const coincideRuta =
        rutaFiltro === 'todos' ||
        (cliente.ruta || '').toLowerCase() === rutaFiltro;

      const coincideAldea =
        this.filtroAldea === 'todos' ||
        cliente.id_aldea === this.filtroAldea;

      return coincideBusqueda && coincideRuta && coincideAldea;
    });

    this.totalPaginas = Math.max(
      1,
      Math.ceil(this.clientesFiltrados.length / this.tamanoPagina)
    );
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas);
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.clientesPaginados = this.clientesFiltrados.slice(inicio, fin);
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) {
      return;
    }
    this.paginaActual = nuevaPagina;
    this.actualizarPaginacion();
  }
}
