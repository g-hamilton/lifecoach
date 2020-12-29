import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProgramComponent } from './program.component';
import { ProgramRoutes } from './program.routing';
import { ComponentsModule } from '../../components/components.module';
import { ScheduleCallComponent } from 'app/components/schedule-call/schedule-call.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ProgramRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [ProgramComponent],
  entryComponents: [
    ScheduleCallComponent
  ]
})
export class ProgramModule {}
