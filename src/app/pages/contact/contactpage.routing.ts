import { Routes } from '@angular/router';

import { ContactPageComponent } from './contactpage.component';

export const ContactPageRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ContactPageComponent
      }
    ]
  }
];