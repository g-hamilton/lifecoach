import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ReceiptComponent } from './receipt.component';
import { ReceiptRoutes } from './receipt.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReceiptRoutes),
    ComponentsModule
  ],
  declarations: [ReceiptComponent]
})
export class ReceiptModule {}
