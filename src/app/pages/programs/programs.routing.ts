import { Routes } from '@angular/router';

import { ProgramsComponent } from './programs.component';

export const ProgramsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProgramsComponent
      }
    ]
  }
];
