import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CoachHistoryComponent } from './coach.history.component';
import { CoachHistoryRoutes } from './coach.history.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoachHistoryRoutes),
    ComponentsModule
  ],
  declarations: [
    CoachHistoryComponent
  ]
})
export class CoachHistoryModule {}
