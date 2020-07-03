import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRefundsComponent } from './admin.refunds.component';
import { AdminRefundsRoutes } from './admin.refunds.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminRefundsRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminRefundsComponent]
})
export class AdminRefundsModule {}
