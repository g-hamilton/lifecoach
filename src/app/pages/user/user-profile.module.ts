import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { UserComponent } from './user.component';
import { UserRoutes } from './user-profile.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import {NgxSocialShareModule} from 'ngx-social-share';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UserRoutes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    MatFormFieldModule,
    MatChipsModule,
    NgxSocialShareModule,
  ],
  declarations: [UserComponent]
})
export class UserModule {}
