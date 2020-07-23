import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { CalendarPageComponent } from './calendar.page.component';
import { CalendarPageRoutes } from './calendar.page.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CalendarPageRoutes),
    ComponentsModule
  ],
  declarations: [
    CalendarPageComponent
  ]
})
export class CalendarPageModule {}
