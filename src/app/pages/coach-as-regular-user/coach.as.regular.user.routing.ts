import { Routes } from '@angular/router';

import { CoachAsRegularUserComponent } from './coach.as.regular.user.component';

export const CoachAsRegularUserRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachAsRegularUserComponent
      }
    ]
  }
];
