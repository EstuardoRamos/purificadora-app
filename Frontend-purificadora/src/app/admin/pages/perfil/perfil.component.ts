import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { AuthUser } from '../../../interfaces/auth.interface';
import { Usuario } from '../../../interfaces/usuario.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  usuarioAuth: AuthUser | null = null;
  perfilForm = this.obtenerPerfilInicial();
  passwordForm = { actual: '', nueva: '' };
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  cargandoPerfil = false;
  guardandoPerfil = false;
  cambiandoPassword = false;
  mensajePerfil = '';
  mensajePassword = '';

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioAuth = this.authService.getUsuarioActual();
    if (this.usuarioAuth) {
      this.cargarPerfil();
    } else {
      this.mensajePerfil = 'No pudimos identificar al usuario autenticado.';
    }
  }

  cargarPerfil(): void {
    if (!this.usuarioAuth) {
      return;
    }
    this.cargandoPerfil = true;
    this.mensajePerfil = '';

    this.usuariosService.getUsuarioPorId(this.usuarioAuth.id).subscribe({
      next: (usuario) => {
        this.cargandoPerfil = false;
        this.asignarPerfil(usuario);
      },
      error: (error) => {
        this.cargandoPerfil = false;
        console.error(error);
        this.mensajePerfil =
          error?.error?.error || 'No se pudo cargar la información del perfil.';
      },
    });
  }

  guardarPerfil(form: NgForm): void {
    if (!this.usuarioAuth || form.invalid) {
      return;
    }

    if (this.perfilForm.telefono && !/^\d{8}$/.test(String(this.perfilForm.telefono))) {
      alert('El teléfono debe tener 8 dígitos.');
      return;
    }

    this.guardandoPerfil = true;
    this.mensajePerfil = '';

    const payload: any = {
      nombre: this.perfilForm.nombre,
      correo: this.perfilForm.correo,
      telefono: this.perfilForm.telefono,
      fecha_de_nacimiento: this.perfilForm.fecha_de_nacimiento,
      tipo: Number(this.perfilForm.tipo || this.usuarioAuth.tipo),
    };

    this.usuariosService.actualizarUsuario(this.usuarioAuth.id, payload).subscribe({
      next: () => {
        this.guardandoPerfil = false;
        this.mensajePerfil = 'Perfil actualizado correctamente.';
        this.actualizarUsuarioSesion(payload);
      },
      error: (error) => {
        this.guardandoPerfil = false;
        console.error(error);
        this.mensajePerfil =
          error?.error?.error || 'No fue posible actualizar el perfil.';
      },
    });
  }

  cambiarPassword(form: NgForm): void {
    if (!this.usuarioAuth || form.invalid) {
      return;
    }

    if (this.passwordForm.nueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.cambiandoPassword = true;
    this.mensajePassword = '';

    this.usuariosService
      .cambiarContrasena(
        this.usuarioAuth.id,
        this.passwordForm.actual,
        this.passwordForm.nueva
      )
      .subscribe({
        next: () => {
          this.cambiandoPassword = false;
          this.mensajePassword = 'Contraseña actualizada correctamente.';
          this.passwordForm = { actual: '', nueva: '' };
          form.resetForm();
        },
        error: (error) => {
          this.cambiandoPassword = false;
          console.error(error);
          this.mensajePassword =
            error?.error?.error || 'No fue posible cambiar la contraseña.';
        },
      });
  }

  togglePasswordActual(): void {
    this.mostrarPasswordActual = !this.mostrarPasswordActual;
  }

  togglePasswordNueva(): void {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
  }

  private asignarPerfil(usuario: Usuario): void {
    const fecha = this.obtenerFecha(usuario);
    this.perfilForm = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono ? usuario.telefono.toString() : '',
      fecha_de_nacimiento: fecha,
      tipo: (usuario as any).tipo ?? this.usuarioAuth?.tipo ?? 2,
    };
  }

  private obtenerPerfilInicial() {
    return {
      nombre: '',
      correo: '',
      telefono: '',
      fecha_de_nacimiento: '',
      tipo: 2,
    };
  }

  private obtenerFecha(usuario: Usuario): string {
    const fecha =
      (usuario as any).fecha_de_nacimiento ||
      (usuario as any).fecha_nacimiento ||
      '';
    if (!fecha) {
      return '';
    }
    const date = new Date(fecha);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  private actualizarUsuarioSesion(payload: any): void {
    if (!this.usuarioAuth) {
      return;
    }
    const usuarioActualizado: AuthUser = {
      id: this.usuarioAuth.id,
      nombre: payload.nombre,
      correo: payload.correo,
      tipo: Number(payload.tipo || this.usuarioAuth.tipo),
    };
    this.authService.actualizarUsuarioLocal(usuarioActualizado);
    this.usuarioAuth = usuarioActualizado;
  }
}
