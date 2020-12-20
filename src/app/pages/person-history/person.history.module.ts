import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { PersonHistoryComponent } from './person.history.component';
import { PersonHistoryRoutes } from './person.history.routing';
import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PersonHistoryRoutes),
    ComponentsModule
  ],
  declarations: [
    PersonHistoryComponent
  ],
  entryComponents: [
    CoachInviteComponent
  ]
})
export class PersonHistoryModule {}
