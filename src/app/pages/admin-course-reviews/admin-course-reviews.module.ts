import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminCourseReviewsComponent } from './admin-course-reviews.component';
import { AdminCourseReviewsRoutes } from './admin-course-reviews.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminCourseReviewsRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminCourseReviewsComponent]
})
export class AdminCourseReviewsModule {}
