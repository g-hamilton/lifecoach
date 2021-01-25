import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoachingServiceComponent } from './coaching.service.component';
import { CoachingServiceRoutes } from './coaching.service.routing';
import { ScheduleCallComponent } from 'app/components/schedule-call/schedule-call.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachingServiceRoutes),
    ComponentsModule,
    FormsModule, ReactiveFormsModule
  ],
  declarations: [
    CoachingServiceComponent
  ],
  entryComponents: [
    ScheduleCallComponent
  ]
})
export class CoachingServiceModule {}
