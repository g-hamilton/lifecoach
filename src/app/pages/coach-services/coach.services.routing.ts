import { Routes } from '@angular/router';

import { CoachServicesComponent } from './coach.services.component';

export const CoachServicesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachServicesComponent
      }
    ]
  }
];
