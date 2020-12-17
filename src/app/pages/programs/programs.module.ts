import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { ProgramsComponent } from './programs.component';
import { ProgramsRoutes } from './programs.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ProgramsRoutes),
    FormsModule,
    ComponentsModule
  ],
  declarations: [
    ProgramsComponent
  ]
})
export class ProgramsModule {}
