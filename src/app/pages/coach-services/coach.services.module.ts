import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CoachServicesComponent } from './coach.services.component';
import { CoachServicesRoutes } from './coach.services.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachServicesRoutes),
    ComponentsModule
  ],
  declarations: [
    CoachServicesComponent
  ]
})
export class CoachServicesModule {}
