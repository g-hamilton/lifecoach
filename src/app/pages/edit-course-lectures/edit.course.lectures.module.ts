import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EditCourseLecturesComponent } from './edit.course.lectures.component';
import { EditCourseLecturesRoutes } from './edit.course.lectures.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(EditCourseLecturesRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [EditCourseLecturesComponent]
})
export class EditCourseLecturesModule {}
