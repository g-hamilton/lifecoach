import { Routes } from '@angular/router';

import { AdminRefundsComponent } from './admin.refunds.component';

export const AdminRefundsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminRefundsComponent
      }
    ]
  }
];
