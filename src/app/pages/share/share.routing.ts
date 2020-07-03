import { Routes } from '@angular/router';

import { ShareComponent } from './share.component';

export const ShareRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ShareComponent
      }
    ]
  }
];
