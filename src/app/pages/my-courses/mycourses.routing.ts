import { Routes } from '@angular/router';

import { MyCoursesComponent } from './mycourses.component';

export const MyCoursesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MyCoursesComponent
      }
    ]
  }
];
