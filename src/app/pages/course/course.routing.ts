import { Routes } from '@angular/router';

import { CourseComponent } from './course.component';

export const CourseRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CourseComponent
      }
    ]
  }
];
