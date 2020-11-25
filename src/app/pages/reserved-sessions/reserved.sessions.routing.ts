import { Routes } from '@angular/router';

import { ReservedSessionsComponent } from './reserved-sessions.component';

export const ReservedSessionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ReservedSessionsComponent
      }
    ]
  }
];
