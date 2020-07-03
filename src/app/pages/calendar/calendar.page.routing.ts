import { Routes } from '@angular/router';

import { CalendarPageComponent } from './calendar.page.component';

export const CalendarPageRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CalendarPageComponent
      }
    ]
  }
];
