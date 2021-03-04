import { Routes } from '@angular/router';

import { MyCoachesComponent } from './mycoaches.component';

export const MyCoachesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyCoachesComponent
      }
    ]
  }
];
