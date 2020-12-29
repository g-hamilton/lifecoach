import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoachComponent } from './coach.component';
import { CoachRoutes } from './coach.routing';
import { ComponentsModule } from '../../components/components.module';
import { ScheduleCallComponent } from 'app/components/schedule-call/schedule-call.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(CoachRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [CoachComponent],
  entryComponents: [
    ScheduleCallComponent
  ]
})
export class CoachModule {}
