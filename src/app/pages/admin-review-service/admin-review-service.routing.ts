import { Routes } from '@angular/router';

import { AdminReviewServiceComponent } from './admin-review-service.component';

export const AdminReviewServiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminReviewServiceComponent
      }
    ]
  }
];
