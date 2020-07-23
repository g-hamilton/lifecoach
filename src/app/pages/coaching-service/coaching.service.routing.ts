import { Routes } from '@angular/router';

import { CoachingServiceComponent } from './coaching.service.component';

export const CoachingServiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachingServiceComponent
      }
    ]
  }
];
