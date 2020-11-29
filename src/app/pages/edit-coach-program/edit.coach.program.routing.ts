import { Routes } from '@angular/router';

import { EditCoachProgramComponent } from './edit.coach.program.component';

export const EditCoachProgramRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditCoachProgramComponent
      }
    ]
  }
];
