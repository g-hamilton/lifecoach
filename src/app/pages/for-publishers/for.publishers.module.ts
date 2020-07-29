import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { ForPublishersComponent } from './for.publishers.component';
import { ForPublishersRoutes } from './for.publishers.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ForPublishersRoutes),
    FormsModule,
    ComponentsModule
  ],
  declarations: [
    ForPublishersComponent
  ]
})
export class ForPublishersModule {}
