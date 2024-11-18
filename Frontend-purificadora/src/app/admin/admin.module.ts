import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { GestionUsuariosComponent } from './pages/gestion-usuarios/gestion-usuarios.component';
import { MaterialModule } from '../material/material.module';
import { VentasComponent } from './pages/ventas/ventas.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HomeComponent,
    GestionUsuariosComponent,
    VentasComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    MaterialModule
  ]
})
export class AdminModule { }
