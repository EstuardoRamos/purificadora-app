import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credenciales = {
    correo: '',
    contrasena: '',
  };
  ocultarPassword = true;
  cargando = false;
  mensajeError = '';

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(form: NgForm): void {
    if (form.invalid || this.cargando) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.authService.login(this.credenciales).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.cargando = false;
        this.mensajeError =
          error.error?.message || 'No pudimos iniciar sesión. Intenta de nuevo.';
      },
    });
  }

  togglePassword(): void {
    this.ocultarPassword = !this.ocultarPassword;
  }
}
