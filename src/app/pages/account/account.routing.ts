import { Routes } from '@angular/router';

import { AccountComponent } from './account.component';

export const AccountRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AccountComponent
      }
    ]
  }
];
