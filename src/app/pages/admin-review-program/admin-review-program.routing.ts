import { Routes } from '@angular/router';

import { AdminReviewProgramComponent } from './admin-review-program.component';

export const AdminReviewProgramRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminReviewProgramComponent
      }
    ]
  }
];
