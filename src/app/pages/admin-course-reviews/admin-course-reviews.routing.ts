import { Routes } from '@angular/router';

import { AdminCourseReviewsComponent } from './admin-course-reviews.component';

export const AdminCourseReviewsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminCourseReviewsComponent
      }
    ]
  }
];
