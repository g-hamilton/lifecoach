import { Routes } from '@angular/router';

import { ProgramComponent } from './program.component';

export const ProgramRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProgramComponent
      }
    ]
  }
];
