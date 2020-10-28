import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Nouislider } from 'nouislider';

import { AccountComponent } from './account.component';
import { AccountRoutes } from './account.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AccountRoutes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [AccountComponent]
})
export class AccountModule {}
