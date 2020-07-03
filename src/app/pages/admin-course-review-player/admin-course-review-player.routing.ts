import { Routes } from '@angular/router';

import { AdminCourseReviewPlayerComponent } from './admin-course-review-player.component';

export const AdminCourseReviewPlayerRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminCourseReviewPlayerComponent
      }
    ]
  }
];
