import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CourseComponent } from './course.component';
import { CourseRoutes } from './course.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(CourseRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [CourseComponent]
})
export class CourseModule {}
