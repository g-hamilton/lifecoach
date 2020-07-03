import { Routes } from '@angular/router';

import { CoachComponent } from './coach.component';

export const CoachRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachComponent
      }
    ]
  }
];
