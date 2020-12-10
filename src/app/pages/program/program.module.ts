import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProgramComponent } from './program.component';
import { ProgramRoutes } from './program.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ProgramRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [ProgramComponent]
})
export class ProgramModule {}
