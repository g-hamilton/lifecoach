import { Routes } from '@angular/router';

import { CourseDiscussionsComponent } from './course.discussions.component';

export const CourseDiscussionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CourseDiscussionsComponent
      }
    ]
  }
];
