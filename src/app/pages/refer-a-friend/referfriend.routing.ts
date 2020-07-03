import { Routes } from '@angular/router';

import { ReferFriendComponent } from './referfriend.component';

export const ReferFriendRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ReferFriendComponent
      }
    ]
  }
];
