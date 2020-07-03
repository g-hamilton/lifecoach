import { Routes } from '@angular/router';

import { EditCourseLecturesComponent } from './edit.course.lectures.component';

export const EditCourseLecturesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditCourseLecturesComponent
      }
    ]
  }
];
