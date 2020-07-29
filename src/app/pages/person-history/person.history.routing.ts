import { Routes } from '@angular/router';

import { PersonHistoryComponent } from './person.history.component';

export const PersonHistoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PersonHistoryComponent
      }
    ]
  }
];
