import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { HomeSearchResultsComponent } from './home-search-results.component';
import { HomeSearchResultsRoutes } from './home-search-results.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(HomeSearchResultsRoutes),
    ComponentsModule
  ],
  declarations: [
    HomeSearchResultsComponent
  ]
})
export class HomeSearchResultsModule {}
