import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CoachingServiceComponent } from './coaching.service.component';
import { CoachingServiceRoutes } from './coaching.service.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachingServiceRoutes),
    ComponentsModule
  ],
  declarations: [
    CoachingServiceComponent
  ]
})
export class CoachingServiceModule {}
