import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { GestionUsuariosComponent } from './pages/gestion-usuarios/gestion-usuarios.component';
import { MaterialModule } from '../material/material.module';
import { VentasComponent } from './pages/ventas/ventas.component';
import { FormsModule } from '@angular/forms';
import { CrudProductosComponent } from './pages/crud-productos/crud-productos.component';
import { ProductosService } from './services/productos.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CrudClientesComponent } from './pages/crud-clientes/crud-clientes.component';
import { ClientesService } from './services/clientes.service';
import { AldeasService } from './services/aldeas.service';
import { CrudAldeasComponent } from './pages/crud-aldeas/crud-aldeas.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { InventarioService } from './services/inventario.service';
import { RegistroInventarioComponent } from './pages/registro-inventario/registro-inventario.component';
import { HistorialInventarioComponent } from './pages/historial-inventario/historial-inventario.component';
import { VentasService } from './services/ventas.service';
import { ListarVentasComponent } from './pages/listar-ventas/listar-ventas.component';


@NgModule({
  declarations: [
    HomeComponent,
    GestionUsuariosComponent,
    VentasComponent,
    CrudProductosComponent,
    CrudClientesComponent,
    CrudAldeasComponent,
    InventarioComponent,
    RegistroInventarioComponent,
    HistorialInventarioComponent,
    ListarVentasComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    AdminRoutingModule,
    MaterialModule,
    RouterOutlet
  ],
  providers:[
    ProductosService,
    ClientesService,
    AldeasService,
    InventarioService,
    VentasService,
  ]
})
export class AdminModule { }
