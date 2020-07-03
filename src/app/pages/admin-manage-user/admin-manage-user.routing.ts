import { Routes } from '@angular/router';

import { AdminManageUserComponent } from './admin-manage-user.component';

export const AdminManageUserRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminManageUserComponent
      }
    ]
  }
];
