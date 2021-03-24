import { Routes } from '@angular/router';

import { ManageTestimonialsComponent } from './manage.testimonials.component';

export const ManageTestimonialsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ManageTestimonialsComponent
      }
    ]
  }
];
