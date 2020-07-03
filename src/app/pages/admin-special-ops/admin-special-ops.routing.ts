import { Routes } from '@angular/router';

import { AdminSpecialOpsComponent } from './admin-special-ops.component';

export const AdminSpecialOpsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminSpecialOpsComponent
      }
    ]
  }
];
