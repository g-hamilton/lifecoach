import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditCoachProgramComponent } from './edit.coach.program.component';
import { EditCoachProgramRoutes } from './edit.coach.program.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(EditCoachProgramRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [EditCoachProgramComponent]
})
export class EditCoachProgramModule {}
