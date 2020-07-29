import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditCoachServiceComponent } from './edit.coach.service.component';
import { EditCoachServiceRoutes } from './edit.coach.service.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EditCoachServiceRoutes), FormsModule, ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [
    EditCoachServiceComponent
  ]
})
export class EditCoachServiceModule {}
