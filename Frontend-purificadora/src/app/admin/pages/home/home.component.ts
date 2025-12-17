import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AuthUser } from '../../../interfaces/auth.interface';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: number[];
  description?: string;
}

interface MenuSection {
  title: string;
  icon: string;
  expanded?: boolean;
  items: MenuItem[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLargeScreen = true;
  usuarioActual: AuthUser | null = null;
  
  menuSections: MenuSection[] = [
    {
      title: 'Ventas',
      icon: 'wb_sunny',
      expanded: true,
      items: [
        //{ label: 'Dashboard', icon: 'dashboard', route: '/admin/inicio', roles: [1], description: 'Indicadores generales' },
        { label: 'Listar ventas', icon: 'view_list', route: '/admin/listar-ventas', roles: [1] },
        { label: 'Mis ventas', icon: 'flare', route: '/admin/mis-ventas', roles: [1, 2], description: 'Resumen personal' },
        { label: 'Ventas del día', icon: 'point_of_sale', route: '/admin/ventas', roles: [1, 2], description: 'Registrar ventas' },
        { label: 'Créditos pendientes', icon: 'account_balance', route: '/admin/creditos', roles: [1, 2], description: 'Seguimiento de créditos' },
        { label: 'Clientes', icon: 'people', route: '/admin/clientes', roles: [1, 2], description: 'Listado y rutas' },
        //{ label: 'Mi perfil', icon: 'face', route: '/admin/perfil', roles: [1, 2], description: 'Datos personales' },
      ],
    },
    // {
    //   title: 'Mi día',
    //   icon: 'wb_sunny',
    //   expanded: true,
    //   items: [
    //     { label: 'Dashboard', icon: 'dashboard', route: '/admin/inicio', roles: [1], description: 'Indicadores generales' },
    //     { label: 'Mis ventas', icon: 'flare', route: '/admin/mis-ventas', roles: [1, 2], description: 'Resumen personal' },
    //     { label: 'Ventas del día', icon: 'point_of_sale', route: '/admin/ventas', roles: [1, 2], description: 'Registrar ventas' },
    //     { label: 'Créditos pendientes', icon: 'account_balance', route: '/admin/creditos', roles: [1, 2], description: 'Seguimiento de créditos' },
    //     { label: 'Clientes', icon: 'people', route: '/admin/clientes', roles: [1, 2], description: 'Listado y rutas' },
    //     { label: 'Mi perfil', icon: 'face', route: '/admin/perfil', roles: [1, 2], description: 'Datos personales' },
    //   ],
    // },
    {
      title: 'Productos e Inventario',
      icon: 'settings_applications',
      expanded: false,
      items: [
        { label: 'Productos', icon: 'inventory_2', route: '/admin/productos', roles: [1] },
        { label: 'Registro inventario', icon: 'playlist_add', route: '/admin/registro-inventario', roles: [1] },
        //{ label: 'Inventario', icon: 'warehouse', route: '/admin/inventario', roles: [1] },
        //{ label: 'Historial inventario', icon: 'history', route: '/admin/historial-inventario', roles: [1] },
        { label: 'Listar ventas', icon: 'view_list', route: '/admin/listar-ventas', roles: [1] },
        { label: 'Gastos', icon: 'receipt_long', route: '/admin/gastos', roles: [1] },
      ],
    },
    {
      title: 'Gestion empresarial',
      icon: 'settings_applications',
      expanded: false,
      items: [
        //{ label: 'Productos', icon: 'inventory_2', route: '/admin/productos', roles: [1] },
        //{ label: 'Registro inventario', icon: 'playlist_add', route: '/admin/registro-inventario', roles: [1] },
        //{ label: 'Inventario', icon: 'warehouse', route: '/admin/inventario', roles: [1] },
        //{ label: 'Historial inventario', icon: 'history', route: '/admin/historial-inventario', roles: [1] },
        
        { label: 'Gastos', icon: 'receipt_long', route: '/admin/gastos', roles: [1] },
        { label: 'Aldeas', icon: 'map', route: '/admin/aldeas', roles: [1] },
        { label: 'Usuarios', icon: 'supervisor_account', route: '/admin/usuarios', roles: [1] },
      ],
    },

    {
      title: 'Análisis y control',
      icon: 'analytics',
      expanded: false,
      items: [
        { label: 'Reportes', icon: 'bar_chart', route: '/admin/reportes', roles: [1] },
        { label: 'Clientes por aldea', icon: 'pie_chart', route: '/admin/clientes-por-aldea', roles: [1] },
        
      ],
    },
    {
      title: 'Mi perfil',
      icon: 'face',
      expanded: false,
      items: [
        { label: 'Mi perfil', icon: 'face', route: '/admin/perfil', roles: [1, 2], description: 'Datos personales' },
        //{ label: 'Mi perfil', icon: 'face', route: '/admin/perfil', roles: [1, 2], description: 'Datos personales' },
      ],
    }
  ];

  private usuarioSub?: Subscription;
  private breakpointSub?: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.breakpointSub = this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .subscribe(result => {
        this.isLargeScreen = !result.matches;
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

  puedeVer(roles: number[]): boolean {
    if (!roles || !roles.length) {
      return true;
    }
    const tipo = Number(this.usuarioActual?.tipo);
    if (!tipo) {
      return false;
    }
    return roles.includes(tipo);
  }

  tieneItems(section: MenuSection): boolean {
    return section.items.some((item) => this.puedeVer(item.roles));
  }

  toggleSection(index: number): void {
    this.menuSections[index].expanded = !this.menuSections[index].expanded;
  }
}