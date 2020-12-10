import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CoachAsRegularUserComponent } from './coach.as.regular.user.component';
import { CoachAsRegularUserRoutes } from './coach.as.regular.user.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachAsRegularUserRoutes),
    ComponentsModule
  ],
  declarations: [
    CoachAsRegularUserComponent
  ]
})
export class CoachAsRegularUserModule {}
