import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { CrudProductosComponent } from './pages/crud-productos/crud-productos.component';
import { CrudClientesComponent } from './pages/crud-clientes/crud-clientes.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children:[
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'ventas',
        component: VentasComponent
      },
      {
        path: 'productos',
        component: CrudProductosComponent
      },
      {
        path: 'clientes',
        component: CrudClientesComponent
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
