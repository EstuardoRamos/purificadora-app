import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Módulos
import { MatCardModule } from '@angular/material/card';         // Para <mat-card>
import { MatTableModule } from '@angular/material/table';       // Para <table mat-table>
//import { MatButtonModule } from '@angular/material/button';     // Para <button mat-raised-button>
import { MatFormFieldModule } from '@angular/material/form-field'; // Para <mat-form-field>
import { MatInputModule } from '@angular/material/input';       // Para <input matInput>
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@NgModule({
  declarations: [],
  imports: [
  ],
  exports:[
    MatSidenavModule,  // Para sidenav-container y sidenav
    MatToolbarModule,  // Para toolbar
    MatIconModule,     // Para iconos (mat-icon)
    MatListModule,     // Para nav-list y list-item
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ]
})
export class MaterialModule { }
