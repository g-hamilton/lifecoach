import { Routes } from '@angular/router';

import { HomeSearchResultsComponent } from './home-search-results.component';

export const HomeSearchResultsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: HomeSearchResultsComponent
      }
    ]
  }
];
