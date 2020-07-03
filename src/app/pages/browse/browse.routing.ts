import { Routes } from '@angular/router';

import { BrowseComponent } from './browse.component';

export const BrowseRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BrowseComponent
      }
    ]
  }
];
