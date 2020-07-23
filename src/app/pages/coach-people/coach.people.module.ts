import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CoachPeopleComponent } from './coach.people.component';
import { CoachPeopleRoutes } from './coach.people.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachPeopleRoutes),
    ComponentsModule
  ],
  declarations: [
    CoachPeopleComponent
  ]
})
export class CoachPeopleModule {}
