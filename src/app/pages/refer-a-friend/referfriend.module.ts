import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReferFriendComponent } from './referfriend.component';
import { ReferFriendRoutes } from './referfriend.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReferFriendRoutes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [ReferFriendComponent]
})
export class ReferFriendModule {}
