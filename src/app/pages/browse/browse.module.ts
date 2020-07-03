import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { BrowseComponent } from './browse.component';
import { BrowseRoutes } from './browse.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(BrowseRoutes),
    FormsModule,
    ComponentsModule
  ],
  declarations: [
    BrowseComponent
  ]
})
export class BrowseModule {}
