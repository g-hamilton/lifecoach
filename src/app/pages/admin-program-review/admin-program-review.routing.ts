import { Routes } from '@angular/router';

import { AdminProgramReviewComponent } from './admin-program-review.component';

export const AdminProgramReviewRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminProgramReviewComponent
      }
    ]
  }
];
