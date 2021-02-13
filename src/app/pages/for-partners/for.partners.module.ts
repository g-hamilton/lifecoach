import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { ForPartnersComponent } from './for.partners.component';
import { ForPartnersRoutes } from './for.partners.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ForPartnersRoutes),
    FormsModule,
    ComponentsModule
  ],
  declarations: [
    ForPartnersComponent
  ]
})
export class ForPartnersModule {}
