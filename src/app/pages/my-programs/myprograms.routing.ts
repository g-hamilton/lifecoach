import { Routes } from '@angular/router';

import { MyProgramsComponent } from './myprograms.component';

export const MyProgramsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyProgramsComponent
      }
    ]
  }
];
