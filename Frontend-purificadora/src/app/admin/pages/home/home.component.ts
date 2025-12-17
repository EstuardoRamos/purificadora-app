import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AuthUser } from '../../../interfaces/auth.interface';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLargeScreen = true; // Indica si es pantalla grande
  usuarioActual: AuthUser | null = null;
  private usuarioSub?: Subscription;
  private breakpointSub?: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.breakpointSub = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset]).subscribe(result => {
      this.isLargeScreen = !result.matches; // Cambia según el tamaño de pantalla
    });

    this.usuarioActual = this.authService.getUsuarioActual();
    this.usuarioSub = this.authService.getUsuario$().subscribe(usuario => {
      this.usuarioActual = usuario;
    });
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
    this.breakpointSub?.unsubscribe();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
