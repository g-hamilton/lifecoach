import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { PricingComponent } from './pricing.component';
import { PricingRoutes } from './pricing.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PricingRoutes),
    FormsModule,
    ComponentsModule,
    ProgressbarModule.forRoot(),
  ],
  declarations: [
    PricingComponent
  ]
})
export class PricingModule {}
