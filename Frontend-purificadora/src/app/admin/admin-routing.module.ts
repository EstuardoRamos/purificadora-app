import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { CrudProductosComponent } from './pages/crud-productos/crud-productos.component';
import { CrudClientesComponent } from './pages/crud-clientes/crud-clientes.component';
import { CrudAldeasComponent } from './pages/crud-aldeas/crud-aldeas.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { RegistroInventarioComponent } from './pages/registro-inventario/registro-inventario.component';
import { HistorialInventarioComponent } from './pages/historial-inventario/historial-inventario.component';
import { ListarVentasComponent } from './pages/listar-ventas/listar-ventas.component';
import { GestionUsuariosComponent } from './pages/gestion-usuarios/gestion-usuarios.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ClientesPorAldeaComponent } from './pages/clientes-por-aldea/clientes-por-aldea.component';
import { GastosComponent } from './pages/gastos/gastos.component';
import { CreditosPendientesComponent } from './pages/creditos-pendientes/creditos-pendientes.component';
import { MisVentasComponent } from './pages/mis-ventas/mis-ventas.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children:[
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio'
      },
      {
        path: 'inicio',
        component: ClientesPorAldeaComponent,
        data: { roles: [1] }
      },
      {
        path: 'ventas',
        component: VentasComponent,
        data: { roles: [1, 2] }
      },
      {
        path: 'productos',
        component: CrudProductosComponent,
        data: { roles: [1] }
      },
      {
        path: 'clientes',
        component: CrudClientesComponent,
        data: { roles: [1, 2] }
      },
      {
        path: 'aldeas',
        component: CrudAldeasComponent,
        data: { roles: [1] }
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        data: { roles: [1] }
      },
      {
        path: 'registro-inventario',
        component: RegistroInventarioComponent,
        data: { roles: [1] }
      },
      {
        path: 'historial-inventario',
        component: HistorialInventarioComponent,
        data: { roles: [1] }
      },
      {
        path: 'listar-ventas',
        component: ListarVentasComponent,
        data: { roles: [1] }
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        data: { roles: [1] }
      },
      {
        path: 'clientes-por-aldea',
        component: ClientesPorAldeaComponent,
        data: { roles: [1] }
      },
      {
        path: 'gastos',
        component: GastosComponent,
        data: { roles: [1] }
      },
      {
        path: 'creditos',
        component: CreditosPendientesComponent,
        data: { roles: [1, 2] }
      },
      {
        path: 'mis-ventas',
        component: MisVentasComponent,
        data: { roles: [1, 2] }
      },
      {
        path: 'perfil',
        component: PerfilComponent,
        data: { roles: [1, 2] }
      },
      {
        path: 'usuarios',
        component: GestionUsuariosComponent,
        data: { roles: [1] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
