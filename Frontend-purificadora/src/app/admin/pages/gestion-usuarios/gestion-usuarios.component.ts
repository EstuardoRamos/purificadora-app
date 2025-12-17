import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../../interfaces/usuario.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  terminoBusqueda: string = '';
  mostrarFormulario = false;
  usuarioSeleccionado: Usuario | null = null;
  mostrarPassword = false;
  tiposUsuario = [
    { valor: 1, etiqueta: 'Administrador' },
    { valor: 2, etiqueta: 'Repartidor' },
  ];

  usuarioFormulario: any = this.obtenerFormularioInicial();

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.listarUsuarios();
  }

  private obtenerFormularioInicial() {
    return {
      id: null,
      nombre: '',
      correo: '',
      telefono: '',
      tipo: 2,
      contrasena: '',
      fecha_de_nacimiento: '',
      activo: true,
    };
  }

  listarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error al obtener usuarios', err),
    });
  }

  aplicarFiltro(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      if (!termino) return true;
      return (
        usuario.nombre.toLowerCase().includes(termino) ||
        (usuario.telefono || '').toString().includes(termino)
      );
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.usuarioSeleccionado = null;
    this.usuarioFormulario = this.obtenerFormularioInicial();
  }

  editarUsuario(usuario: Usuario): void {
    this.mostrarFormulario = true;
    this.usuarioSeleccionado = usuario;
    this.usuarioFormulario = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      tipo: usuario.tipo,
      fecha_de_nacimiento: this.obtenerFechaNormalizada(usuario),
      activo: (usuario as any).activo ?? true,
    };
  }

  guardarUsuario(): void {
    if (!this.esFormularioValido()) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const payload: any = {
      nombre: this.usuarioFormulario.nombre,
      correo: this.usuarioFormulario.correo,
      telefono: this.usuarioFormulario.telefono,
      tipo: Number(this.usuarioFormulario.tipo),
      fecha_de_nacimiento: this.usuarioFormulario.fecha_de_nacimiento,
      activo: this.usuarioFormulario.activo,
    };

    if (!this.usuarioSeleccionado && !this.usuarioFormulario.contrasena) {
      alert('Ingresa una contraseña para el nuevo usuario.');
      return;
    }

    if (this.usuarioFormulario.contrasena) {
      payload['contraseña'] = this.usuarioFormulario.contrasena;
    }

    const peticion = this.usuarioSeleccionado
      ? this.usuariosService.actualizarUsuario(this.usuarioSeleccionado.id!, payload)
      : this.usuariosService.crearUsuario(payload);

    peticion.subscribe({
      next: () => {
        const mensaje = this.usuarioSeleccionado
          ? 'Usuario actualizado correctamente.'
          : 'Usuario creado correctamente.';
        alert(mensaje);
        this.mostrarFormulario = false;
        this.usuarioFormulario = this.obtenerFormularioInicial();
        this.listarUsuarios();
      },
      error: (err) => {
        console.error('Error al guardar usuario', err);
        alert(err?.error?.error || 'No fue posible guardar al usuario.');
      },
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${usuario.nombre}?`)) {
      return;
    }

    this.usuariosService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        alert('Usuario eliminado.');
        this.listarUsuarios();
      },
      error: (err) => {
        console.error('Error al eliminar usuario', err);
        alert('No fue posible eliminar al usuario.');
      },
    });
  }

  toggleEstado(usuario: Usuario, event: MatSlideToggleChange): void {
    const activo = !!event.checked;
    const fecha = this.obtenerFechaNormalizada(usuario);
    const payload: any = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      tipo: usuario.tipo,
      fecha_de_nacimiento: fecha,
      activo,
    };

    this.usuariosService.actualizarUsuario(usuario.id, payload).subscribe({
      next: () => {
        usuario.activo = activo;
      },
      error: (err) => {
        console.error('Error al actualizar estado', err);
        alert('No fue posible actualizar el estado del usuario.');
        event.source.checked = !activo;
      },
    });
  }

  private obtenerFechaNormalizada(usuario: Usuario): string {
    const fecha = (usuario as any).fecha_nacimiento || (usuario as any).fecha_de_nacimiento;
    if (!fecha) {
      return '';
    }
    const date = new Date(fecha);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.usuarioSeleccionado = null;
    this.usuarioFormulario = this.obtenerFormularioInicial();
  }

  private esFormularioValido(): boolean {
    const { nombre, correo, telefono, tipo, fecha_de_nacimiento } = this.usuarioFormulario;
    if (!nombre || !correo || !telefono || !tipo) {
      return false;
    }
    if (telefono && !/^\d{8}$/.test(String(telefono))) {
      alert('El teléfono debe tener 8 dígitos.');
      return false;
    }
    if (fecha_de_nacimiento && isNaN(Date.parse(fecha_de_nacimiento))) {
      alert('Ingresa una fecha de nacimiento válida.');
      return false;
    }
    return true;
  }

  obtenerEtiquetaTipo(valor: number): string {
    return this.tiposUsuario.find((t) => t.valor === valor)?.etiqueta || `Tipo ${valor}`;
  }
}
