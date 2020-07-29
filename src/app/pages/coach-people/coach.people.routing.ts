import { Routes } from '@angular/router';

import { CoachPeopleComponent } from './coach.people.component';

export const CoachPeopleRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoachPeopleComponent
      }
    ]
  }
];
