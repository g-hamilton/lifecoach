import { Routes } from '@angular/router';

import { CoursesComponent } from './courses.component';

export const CoursesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoursesComponent
      }
    ]
  }
];
