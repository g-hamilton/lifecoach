import { Routes } from '@angular/router';

import { LearnComponent } from './learn.component';

export const LearnRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LearnComponent
      }
    ]
  }
];
