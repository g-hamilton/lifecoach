import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminCourseReviewPlayerComponent } from './admin-course-review-player.component';
import { AdminCourseReviewPlayerRoutes } from './admin-course-review-player.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminCourseReviewPlayerRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminCourseReviewPlayerComponent]
})
export class AdminCourseReviewPlayerModule {}
