import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { PersonHistoryComponent } from './person.history.component';
import { PersonHistoryRoutes } from './person.history.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PersonHistoryRoutes),
    ComponentsModule
  ],
  declarations: [
    PersonHistoryComponent
  ]
})
export class PersonHistoryModule {}
