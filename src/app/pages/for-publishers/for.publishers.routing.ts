import { Routes } from '@angular/router';

import { ForPublishersComponent } from './for.publishers.component';

export const ForPublishersRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ForPublishersComponent
      }
    ]
  }
];
