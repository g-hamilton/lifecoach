import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { EditCoachServiceComponent } from './edit.coach.service.component';
import { EditCoachServiceRoutes } from './edit.coach.service.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EditCoachServiceRoutes),
    ComponentsModule
  ],
  declarations: [
    EditCoachServiceComponent
  ]
})
export class EditCoachServiceModule {}
