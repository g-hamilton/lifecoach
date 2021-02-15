import { Routes } from '@angular/router';

import { ForPartnersComponent } from './for.partners.component';

export const ForPartnersRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ForPartnersComponent
      }
    ]
  }
];
