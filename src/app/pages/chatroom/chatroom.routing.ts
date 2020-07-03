import { Routes } from '@angular/router';

import { ChatroomComponent } from './chatroom.component';

export const ChatroomRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ChatroomComponent
      }
    ]
  }
];
