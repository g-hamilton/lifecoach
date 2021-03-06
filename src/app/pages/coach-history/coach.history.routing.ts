import { Routes } from '@angular/router';

import { CoachHistoryComponent } from './coach.history.component';

export const CoachHistoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachHistoryComponent
      }
    ]
  }
];
