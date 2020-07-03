import { Routes } from '@angular/router';

import { PricingComponent } from './pricing.component';

export const PricingRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PricingComponent
      }
    ]
  }
];
