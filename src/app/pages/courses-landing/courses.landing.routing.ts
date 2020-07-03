import { Routes } from '@angular/router';

import { CoursesLandingComponent } from './courses.landing.component';

export const CoursesLandingRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CoursesLandingComponent
      }
    ]
  }
];
