import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { RatesComponent } from './rates.component';
import { RatesRoutes } from './rates.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(RatesRoutes),
    ComponentsModule
  ],
  declarations: [RatesComponent]
})
export class RatesModule {}
