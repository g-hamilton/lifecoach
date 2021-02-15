import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { PartnerLinkComponent } from './partner.link.component';
import { PartnerLinkRoutes } from './partner.link.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PartnerLinkRoutes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [
    PartnerLinkComponent
  ]
})
export class PartnerLinkModule {}
