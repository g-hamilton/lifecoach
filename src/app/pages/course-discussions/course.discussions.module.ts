import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CourseDiscussionsComponent } from './course.discussions.component';
import { CourseDiscussionsRoutes } from './course.discussions.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CourseDiscussionsRoutes),
    ComponentsModule
  ],
  declarations: [CourseDiscussionsComponent]
})
export class CourseDiscussionsModule {}
