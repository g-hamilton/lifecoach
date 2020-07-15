import { Routes } from '@angular/router';

import { AdminUploaderComponent } from './admin.uploader.component';

export const AdminUploaderRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AdminUploaderComponent
      }
    ]
  }
];
