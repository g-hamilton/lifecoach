import { Routes } from '@angular/router';

import { AdminServiceReviewComponent } from './admin-service-review.component';

export const AdminServiceReviewRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminServiceReviewComponent
      }
    ]
  }
];
