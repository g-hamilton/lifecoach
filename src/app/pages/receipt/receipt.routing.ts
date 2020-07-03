import { Routes } from '@angular/router';

import { ReceiptComponent } from './receipt.component';

export const ReceiptRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ReceiptComponent
      }
    ]
  }
];
