import { Routes } from '@angular/router';

import { EditCoachServiceComponent } from './edit.coach.service.component';

export const EditCoachServiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditCoachServiceComponent
      }
    ]
  }
];
