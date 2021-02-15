import { Routes } from '@angular/router';

import { PartnerLinkComponent } from './partner.link.component';

export const PartnerLinkRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PartnerLinkComponent
      }
    ]
  }
];
